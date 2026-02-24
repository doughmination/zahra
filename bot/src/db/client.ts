// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import { Pool } from "pg";
import { createClient } from "redis";
import chalk from "chalk";

// ── PostgreSQL ──────────────────────────────────────────────────────────────

export const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? "bot_postgres",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  console.error(chalk.red("💾 PostgreSQL pool error:"), err);
});

// ── Redis ───────────────────────────────────────────────────────────────────

export const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST ?? "bot_redis",
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
  password: process.env.REDIS_PASSWORD,
});

redis.on("error", (err) => {
  console.error(chalk.red("📦 Redis client error:"), err);
});

// ── Init ────────────────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
  // Connect Redis
  await redis.connect();
  console.log(chalk.greenBright("✔ Redis connected"));

  // Run migrations
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id            SERIAL PRIMARY KEY,
        case_id       VARCHAR(8)   NOT NULL UNIQUE,
        guild_id      VARCHAR(20)  NOT NULL,
        type          VARCHAR(10)  NOT NULL,
        target_id     VARCHAR(20)  NOT NULL,
        target_tag    VARCHAR(100) NOT NULL,
        moderator_id  VARCHAR(20)  NOT NULL,
        moderator_tag VARCHAR(100) NOT NULL,
        reason        TEXT         NOT NULL DEFAULT 'No reason provided.',
        duration      INTEGER,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        active        BOOLEAN      NOT NULL DEFAULT TRUE
      );

      CREATE INDEX IF NOT EXISTS idx_cases_guild_target
        ON cases (guild_id, target_id);

      CREATE INDEX IF NOT EXISTS idx_cases_case_id
        ON cases (case_id);
    `);
    console.log(chalk.greenBright("✔ Database migrations complete"));
  } finally {
    client.release();
  }
}