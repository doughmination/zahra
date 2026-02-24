// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import { pool, redis } from "./client";
import crypto from "crypto";

// ── Types ───────────────────────────────────────────────────────────────────

export type CaseType = "ban" | "kick" | "warn" | "mute" | "unban" | "unmute";

export interface Case {
  id: number;
  case_id: string;
  guild_id: string;
  type: CaseType;
  target_id: string;
  target_tag: string;
  moderator_id: string;
  moderator_tag: string;
  reason: string;
  duration: number | null;
  created_at: Date;
  active: boolean;
}

export interface CreateCaseOptions {
  guildId: string;
  type: CaseType;
  targetId: string;
  targetTag: string;
  moderatorId: string;
  moderatorTag: string;
  reason?: string;
  /** Duration in seconds (for mutes) */
  duration?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generates a short, collision-resistant 7-character hex case ID.
 * Format: #a3f9b2c  (# prefix is display-only, not stored)
 */
function generateCaseId(): string {
  return crypto.randomBytes(4).toString("hex").slice(0, 7);
}

const CACHE_TTL = 3600; // 1 hour in seconds

// ── Repository ──────────────────────────────────────────────────────────────

export async function createCase(opts: CreateCaseOptions): Promise<Case> {
  let caseId: string;
  let attempts = 0;

  // Retry on the (very unlikely) collision
  while (true) {
    caseId = generateCaseId();
    const exists = await pool.query(
      "SELECT 1 FROM cases WHERE case_id = $1",
      [caseId]
    );
    if (exists.rowCount === 0) break;
    if (++attempts > 10) throw new Error("Failed to generate unique case ID");
  }

  const result = await pool.query<Case>(
    `INSERT INTO cases
       (case_id, guild_id, type, target_id, target_tag,
        moderator_id, moderator_tag, reason, duration)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      caseId,
      opts.guildId,
      opts.type,
      opts.targetId,
      opts.targetTag,
      opts.moderatorId,
      opts.moderatorTag,
      opts.reason ?? "No reason provided.",
      opts.duration ?? null,
    ]
  );

  const newCase = result.rows[0];
  await redis.setEx(`case:${caseId}`, CACHE_TTL, JSON.stringify(newCase));
  return newCase;
}

export async function getCaseById(caseId: string): Promise<Case | null> {
  // Normalise — strip leading # if user typed it
  const id = caseId.replace(/^#/, "").toLowerCase();

  // Cache hit
  const cached = await redis.get(`case:${id}`);
  if (cached) return JSON.parse(cached) as Case;

  const result = await pool.query<Case>(
    "SELECT * FROM cases WHERE case_id = $1",
    [id]
  );

  if (result.rowCount === 0) return null;

  const found = result.rows[0];
  await redis.setEx(`case:${id}`, CACHE_TTL, JSON.stringify(found));
  return found;
}

export async function getCasesByUser(
  guildId: string,
  targetId: string
): Promise<Case[]> {
  const result = await pool.query<Case>(
    `SELECT * FROM cases
     WHERE guild_id = $1 AND target_id = $2
     ORDER BY created_at DESC
     LIMIT 25`,
    [guildId, targetId]
  );
  return result.rows;
}