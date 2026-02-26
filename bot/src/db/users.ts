// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import type { PoolClient } from "pg";
import { pool, redis } from "./client";
import crypto from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DonorPlatform = "github" | "patreon";

export interface UserRecord {
  id: number;
  discord_id: string;
  discord_tag: string;
  is_donor: boolean;
  is_friend: boolean;
  is_girls_network: boolean;
  is_girls_mod: boolean;
  is_girls_bot: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DonorLink {
  id: number;
  discord_id: string;
  platform: DonorPlatform;
  platform_id: string;        // GitHub numeric user ID / Patreon user ID
  platform_username: string;  // GitHub login / Patreon full name or vanity
  verified_at: Date;
  active: boolean;
}

export interface OAuthState {
  state: string;
  discord_id: string;
  discord_tag: string;
  platform: DonorPlatform;
  interaction_token: string;  // Discord interaction token for follow-up edit
  application_id: string;
  expires_at: number;         // Unix ms
}

export type GroupFlag =
  | "is_donor"
  | "is_friend"
  | "is_girls_network"
  | "is_girls_mod"
  | "is_girls_bot";

const USER_CACHE_TTL  = 3600; // 1 hour
const OAUTH_STATE_TTL = 600;  // 10 minutes

// ── Migrations ────────────────────────────────────────────────────────────────

export async function migrateUsers(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id               SERIAL PRIMARY KEY,
      discord_id       VARCHAR(20)  NOT NULL UNIQUE,
      discord_tag      VARCHAR(100) NOT NULL,
      is_donor         BOOLEAN      NOT NULL DEFAULT FALSE,
      is_friend        BOOLEAN      NOT NULL DEFAULT FALSE,
      is_girls_network BOOLEAN      NOT NULL DEFAULT FALSE,
      is_girls_mod     BOOLEAN      NOT NULL DEFAULT FALSE,
      is_girls_bot     BOOLEAN      NOT NULL DEFAULT FALSE,
      notes            TEXT,
      created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_discord_id
      ON users (discord_id);

    CREATE TABLE IF NOT EXISTS donor_links (
      id                SERIAL PRIMARY KEY,
      discord_id        VARCHAR(20)  NOT NULL,
      platform          VARCHAR(20)  NOT NULL,
      platform_id       VARCHAR(100) NOT NULL,
      platform_username VARCHAR(100) NOT NULL,
      verified_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      active            BOOLEAN      NOT NULL DEFAULT TRUE,
      UNIQUE (discord_id, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_donor_links_discord
      ON donor_links (discord_id);
    CREATE INDEX IF NOT EXISTS idx_donor_links_platform_id
      ON donor_links (platform, platform_id);
  `);
}

// ── OAuth state (Redis, one-time-use) ────────────────────────────────────────

export async function createOAuthState(
  data: Omit<OAuthState, "state" | "expires_at">
): Promise<string> {
  const state = crypto.randomBytes(24).toString("hex");
  const payload: OAuthState = {
    ...data,
    state,
    expires_at: Date.now() + OAUTH_STATE_TTL * 1000,
  };
  await redis.setEx(`oauth:${state}`, OAUTH_STATE_TTL, JSON.stringify(payload));
  return state;
}

export async function consumeOAuthState(state: string): Promise<OAuthState | null> {
  const raw = await redis.getDel(`oauth:${state}`);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as OAuthState;
  if (Date.now() > parsed.expires_at) return null;
  return parsed;
}

// ── User helpers ──────────────────────────────────────────────────────────────

const userKey = (id: string) => `user:${id}`;

export async function getUserByDiscordId(discordId: string): Promise<UserRecord | null> {
  const cached = await redis.get(userKey(discordId));
  if (cached) return JSON.parse(cached) as UserRecord;

  const result = await pool.query<UserRecord>(
    "SELECT * FROM users WHERE discord_id = $1",
    [discordId]
  );
  if (!result.rowCount) return null;

  await redis.setEx(userKey(discordId), USER_CACHE_TTL, JSON.stringify(result.rows[0]));
  return result.rows[0];
}

export async function upsertUser(
  discordId: string,
  discordTag: string,
  flags: Partial<Pick<UserRecord, GroupFlag | "notes">> = {}
): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `INSERT INTO users
       (discord_id, discord_tag, is_donor, is_friend, is_girls_network, is_girls_mod, is_girls_bot, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (discord_id) DO UPDATE SET
       discord_tag      = EXCLUDED.discord_tag,
       is_donor         = CASE WHEN $3 THEN TRUE ELSE users.is_donor END,
       is_friend        = CASE WHEN $4 THEN TRUE ELSE users.is_friend END,
       is_girls_network = CASE WHEN $5 THEN TRUE ELSE users.is_girls_network END,
       is_girls_mod     = CASE WHEN $6 THEN TRUE ELSE users.is_girls_mod END,
       is_girls_bot     = CASE WHEN $7 THEN TRUE ELSE users.is_girls_bot END,
       notes            = COALESCE($8, users.notes),
       updated_at       = NOW()
     RETURNING *`,
    [
      discordId, discordTag,
      flags.is_donor         ?? false,
      flags.is_friend        ?? false,
      flags.is_girls_network ?? false,
      flags.is_girls_mod     ?? false,
      flags.is_girls_bot     ?? false,
      flags.notes            ?? null,
    ]
  );
  const user = result.rows[0];
  await redis.setEx(userKey(discordId), USER_CACHE_TTL, JSON.stringify(user));
  return user;
}

export async function setUserFlag(
  discordId: string,
  flag: GroupFlag,
  value: boolean
): Promise<UserRecord | null> {
  const allowed: GroupFlag[] = [
    "is_donor", "is_friend", "is_girls_network", "is_girls_mod", "is_girls_bot",
  ];
  if (!allowed.includes(flag)) return null;

  const result = await pool.query<UserRecord>(
    `UPDATE users SET "${flag}" = $2, updated_at = NOW()
     WHERE discord_id = $1 RETURNING *`,
    [discordId, value]
  );
  if (!result.rowCount) return null;

  const user = result.rows[0];
  await redis.setEx(userKey(discordId), USER_CACHE_TTL, JSON.stringify(user));
  return user;
}

// ── Donor links ───────────────────────────────────────────────────────────────

export async function getDonorLinks(discordId: string): Promise<DonorLink[]> {
  const result = await pool.query<DonorLink>(
    "SELECT * FROM donor_links WHERE discord_id = $1 AND active = TRUE",
    [discordId]
  );
  return result.rows;
}

export async function upsertDonorLink(
  discordId: string,
  platform: DonorPlatform,
  platformId: string,
  platformUsername: string
): Promise<DonorLink> {
  const result = await pool.query<DonorLink>(
    `INSERT INTO donor_links (discord_id, platform, platform_id, platform_username)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (discord_id, platform) DO UPDATE SET
       platform_id       = EXCLUDED.platform_id,
       platform_username = EXCLUDED.platform_username,
       verified_at       = NOW(),
       active            = TRUE
     RETURNING *`,
    [discordId, platform, platformId, platformUsername]
  );
  return result.rows[0];
}