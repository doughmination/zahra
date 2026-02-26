// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

// ── Discord ───────────────────────────────────────────────────────────────────
/** The guild where donor roles are assigned. */
export const DONOR_GUILD_ID  = process.env.DONOR_GUILD_ID  ?? "";
/** The role to assign upon donor verification. */
export const DONOR_ROLE_ID   = process.env.DONOR_ROLE_ID   ?? "";
/** Your Discord application ID (same as CLIENT_ID). */
export const APPLICATION_ID  = process.env.CLIENT_ID        ?? "";

// ── OAuth base URL ────────────────────────────────────────────────────────────
/**
 * Public HTTPS URL that platforms redirect to after OAuth.
 * Production:  https://zahra.yourdomain.com
 * Testing:     https://abc123.ngrok.io  (from `ngrok http 4000`)
 * No trailing slash.
 */
export const OAUTH_BASE_URL = process.env.OAUTH_BASE_URL ?? "http://localhost:4000";

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
export const GITHUB_CLIENT_ID     = process.env.GITHUB_CLIENT_ID     ?? "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";
/** Your GitHub username — donors must be actively sponsoring this account. */
export const GITHUB_SPONSOR_LOGIN = process.env.GITHUB_SPONSOR_LOGIN ?? "doughmination";

// ── Patreon OAuth ─────────────────────────────────────────────────────────────
export const PATREON_CLIENT_ID     = process.env.PATREON_CLIENT_ID     ?? "";
export const PATREON_CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET ?? "";
/**
 * Your Patreon campaign ID.
 * Find it at: https://www.patreon.com/api/oauth2/v2/campaigns
 * (using your creator access token — see setup guide)
 */
export const PATREON_CAMPAIGN_ID   = process.env.PATREON_CAMPAIGN_ID   ?? "";

// ── OAuth HTTP server ─────────────────────────────────────────────────────────
export const OAUTH_PORT = Number(process.env.OAUTH_PORT ?? 4000);