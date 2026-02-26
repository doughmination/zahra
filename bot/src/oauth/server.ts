// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

/**
 * Minimal HTTP server running inside the bot process.
 *
 * Routes:
 *   GET /oauth/github/callback   — GitHub OAuth return
 *   GET /oauth/patreon/callback  — Patreon OAuth return
 *
 * On successful verification:
 *   1. Writes to DB (donor_links + users.is_donor = true)
 *   2. Assigns donor role via Discord client
 *   3. Edits the original ephemeral interaction with result embed
 *   4. Shows a confirmation page in the user's browser
 */

import http from "http";
import { URL } from "url";
import chalk from "chalk";
import fetch from "node-fetch";
import type { Client } from "discord.js";
import { consumeOAuthState, upsertDonorLink, upsertUser, type DonorPlatform } from "../db/users";
import {
  OAUTH_PORT,
  OAUTH_BASE_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_SPONSOR_LOGIN,
  PATREON_CLIENT_ID,
  PATREON_CLIENT_SECRET,
  PATREON_CAMPAIGN_ID,
  DONOR_GUILD_ID,
  DONOR_ROLE_ID,
  APPLICATION_ID,
} from "../utils/config";

// ── HTML pages ────────────────────────────────────────────────────────────────

function page(title: string, emoji: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title} — Zahra</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #0d0e14;
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #1a1b23;
      border: 1px solid #2d2e3a;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 440px;
      width: 90%;
      text-align: center;
    }
    .emoji { font-size: 3rem; margin-bottom: 16px; }
    h1 { font-size: 1.4rem; margin-bottom: 12px; font-weight: 600; }
    p  { color: #94a3b8; line-height: 1.7; font-size: 0.95rem; }
    code { background: #2d2e3a; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    .hint { margin-top: 24px; color: #64748b; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <h1>${title}</h1>
    <p>${body}</p>
    <p class="hint">You can close this tab and return to Discord.</p>
  </div>
</body>
</html>`;
}

// ── Discord helpers ───────────────────────────────────────────────────────────

async function editInteraction(
  interactionToken: string,
  title: string,
  description: string,
  color: number
): Promise<void> {
  try {
    await fetch(
      `https://discord.com/api/v10/webhooks/${APPLICATION_ID}/${interactionToken}/messages/@original`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title,
            description,
            color,
            timestamp: new Date().toISOString(),
            footer: { text: "Zahra — Thank you for your support 💜" },
          }],
          components: [], // remove the Verify button
        }),
      }
    );
  } catch {
    // Interaction token may have expired — not fatal
  }
}

async function assignDonorRole(client: Client, discordId: string): Promise<boolean> {
  if (!DONOR_GUILD_ID || !DONOR_ROLE_ID) return false;
  try {
    const guild  = await client.guilds.fetch(DONOR_GUILD_ID);
    const member = await guild.members.fetch(discordId);
    if (member.roles.cache.has(DONOR_ROLE_ID)) return true;
    await member.roles.add(DONOR_ROLE_ID, "Donor verified via OAuth");
    return true;
  } catch {
    return false;
  }
}

// ── Verification result type ──────────────────────────────────────────────────

interface VerifyResult {
  ok: boolean;
  platformId?: string;
  platformUsername?: string;
  discordError?: string;   // shown in the ephemeral embed update
  browserError?: string;   // shown in the browser page
}

// ── GitHub Sponsors verification ──────────────────────────────────────────────

async function verifyGitHub(code: string): Promise<VerifyResult> {
  // 1. Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      client_id:     GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string };
  if (!tokenData.access_token) {
    return {
      ok: false,
      discordError: "GitHub token exchange failed. The link may have expired — please run `/link` again.",
      browserError: "GitHub token exchange failed. Please try again from Discord.",
    };
  }

  const ghHeaders = {
    Authorization:  `Bearer ${tokenData.access_token}`,
    "User-Agent":   "Zahra-Bot/1.0",
    "Content-Type": "application/json",
  };

  // 2. Fetch the authenticated user's profile
  const userRes  = await fetch("https://api.github.com/user", { headers: ghHeaders });
  const userData = await userRes.json() as { id?: number; login?: string };

  if (!userData.login || !userData.id) {
    return {
      ok: false,
      discordError: "Could not retrieve your GitHub profile. Please try again.",
      browserError: "Could not retrieve your GitHub profile.",
    };
  }

  // 3. Check sponsorship via GraphQL — fetch who the viewer is currently sponsoring
  const gqlRes = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: ghHeaders,
    body: JSON.stringify({
      query: `
        query {
          viewer {
            sponsoring(first: 100) {
              nodes {
                ... on User         { login }
                ... on Organization { login }
              }
            }
          }
        }
      `,
    }),
  });

  const gqlData = await gqlRes.json() as {
    data?: { viewer?: { sponsoring?: { nodes: Array<{ login?: string }> } } };
    errors?: Array<{ message: string }>;
  };

  if (gqlData.errors?.length) {
    return {
      ok: false,
      discordError:
        "Could not verify your GitHub Sponsors status. Make sure your sponsorship visibility is set to **public** in your GitHub settings, then try again.",
      browserError:
        "Could not read your GitHub sponsoring data. Ensure your sponsorship is set to public in GitHub settings.",
    };
  }

  const sponsoring      = gqlData.data?.viewer?.sponsoring?.nodes ?? [];
  const isActiveSponsser = sponsoring.some(
    (n) => n.login?.toLowerCase() === GITHUB_SPONSOR_LOGIN.toLowerCase()
  );

  if (!isActiveSponsser) {
    return {
      ok: false,
      discordError:
        `Your GitHub account **${userData.login}** doesn't appear to be an active sponsor of **${GITHUB_SPONSOR_LOGIN}**.\n\n` +
        `If you just started sponsoring, wait a minute and try again. ` +
        `Also check that your sponsorship isn't set to **private** in your GitHub settings.`,
      browserError:
        `Your GitHub account <strong>${userData.login}</strong> is not an active sponsor of <strong>${GITHUB_SPONSOR_LOGIN}</strong>. ` +
        `If you just donated, wait a moment and try again, and ensure your sponsorship is not private.`,
    };
  }

  return { ok: true, platformId: String(userData.id), platformUsername: userData.login };
}

// ── Patreon verification ──────────────────────────────────────────────────────

async function verifyPatreon(code: string): Promise<VerifyResult> {
  // 1. Exchange code for access token
  const tokenRes = await fetch("https://www.patreon.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type:    "authorization_code",
      client_id:     PATREON_CLIENT_ID,
      client_secret: PATREON_CLIENT_SECRET,
      redirect_uri:  `${OAUTH_BASE_URL}/oauth/patreon/callback`,
    }).toString(),
  });

  const tokenData = await tokenRes.json() as { access_token?: string };
  if (!tokenData.access_token) {
    return {
      ok: false,
      discordError: "Patreon token exchange failed. The link may have expired — please run `/link` again.",
      browserError: "Patreon token exchange failed. Please try again from Discord.",
    };
  }

  // 2. Fetch identity + memberships in one request
  const identityUrl =
    "https://www.patreon.com/api/oauth2/v2/identity" +
    "?fields%5Buser%5D=full_name,vanity" +
    "&include=memberships" +
    "&fields%5Bmember%5D=patron_status,currently_entitled_amount_cents";

  const identityRes = await fetch(identityUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const identity = await identityRes.json() as {
    data?: {
      id?: string;
      attributes?: { full_name?: string; vanity?: string };
      relationships?: {
        memberships?: { data: Array<{ id: string; type: string }> };
      };
    };
    included?: Array<{
      type: string;
      id: string;
      attributes?: {
        patron_status?: string;
        currently_entitled_amount_cents?: number;
      };
      relationships?: {
        campaign?: { data?: { id?: string } };
      };
    }>;
  };

  const userId   = identity.data?.id;
  const userName = identity.data?.attributes?.vanity
    ?? identity.data?.attributes?.full_name
    ?? "Unknown";

  if (!userId) {
    return {
      ok: false,
      discordError: "Could not retrieve your Patreon profile. Please try again.",
      browserError: "Could not retrieve your Patreon profile.",
    };
  }

  // 3. Check for an active membership on our campaign
  const memberships = (identity.included ?? []).filter((i) => i.type === "member");

  const activePledge = memberships.some((m) => {
    const isActive   = m.attributes?.patron_status === "active_patron";
    const hasPledge  = (m.attributes?.currently_entitled_amount_cents ?? 0) > 0;
    const campaignOk = !PATREON_CAMPAIGN_ID ||
      m.relationships?.campaign?.data?.id === PATREON_CAMPAIGN_ID;
    return isActive && hasPledge && campaignOk;
  });

  if (!activePledge) {
    return {
      ok: false,
      discordError:
        `Your Patreon account **${userName}** doesn't appear to have an active pledge to our campaign.\n\n` +
        `If you just pledged, wait a minute and try again.`,
      browserError:
        `Your Patreon account <strong>${userName}</strong> does not have an active pledge to our campaign. ` +
        `If you just pledged, wait a moment and try again.`,
    };
  }

  return { ok: true, platformId: userId, platformUsername: userName };
}

// ── Shared post-verify handler ────────────────────────────────────────────────

async function handleVerified(
  client: Client,
  discordId: string,
  discordTag: string,
  interactionToken: string,
  platform: DonorPlatform,
  platformId: string,
  platformUsername: string,
  platformLabel: string,
  res: http.ServerResponse
): Promise<void> {
  await upsertUser(discordId, discordTag, { is_donor: true });
  await upsertDonorLink(discordId, platform, platformId, platformUsername);
  const roleAssigned = await assignDonorRole(client, discordId);

  await editInteraction(
    interactionToken,
    `💜 ${platformLabel} — Verified!`,
    `Your ${platformLabel} account **${platformUsername}** has been verified!\n\n` +
    `You now have the **Donor** badge on your \`/userinfo\` card.` +
    (roleAssigned ? "\nYour donor role has been assigned. 🎉" : ""),
    0x9b59b6
  );

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page(
    "Verified!",
    "💜",
    `Your ${platformLabel} account <strong>${platformUsername}</strong> has been linked. You're all set!`
  ));
}

async function handleFailed(
  interactionToken: string,
  platformLabel: string,
  discordError: string,
  browserError: string,
  res: http.ServerResponse
): Promise<void> {
  await editInteraction(
    interactionToken,
    `❌ ${platformLabel} — Not verified`,
    discordError,
    0xe74c3c
  );
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page("Not verified", "❌", browserError));
}

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleGitHubCallback(
  searchParams: URLSearchParams,
  client: Client,
  res: http.ServerResponse
): Promise<void> {
  if (searchParams.get("error") === "access_denied") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page("Cancelled", "✋", "You cancelled the GitHub authorisation. Run <code>/link</code> in Discord if you change your mind."));
    return;
  }

  const code  = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page("Something went wrong", "❌", "Missing OAuth parameters. Please try again from Discord."));
    return;
  }

  const oauthState = await consumeOAuthState(state);
  if (!oauthState) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page("Link expired", "⏱️", "This link has expired (links last 10 minutes). Please run <code>/link</code> again in Discord."));
    return;
  }

  const result = await verifyGitHub(code);

  if (!result.ok) {
    await handleFailed(
      oauthState.interaction_token,
      "GitHub Sponsors",
      result.discordError!,
      result.browserError!,
      res
    );
    return;
  }

  await handleVerified(
    client,
    oauthState.discord_id,
    oauthState.discord_tag,
    oauthState.interaction_token,
    "github",
    result.platformId!,
    result.platformUsername!,
    "GitHub Sponsors",
    res
  );
}

async function handlePatreonCallback(
  searchParams: URLSearchParams,
  client: Client,
  res: http.ServerResponse
): Promise<void> {
  if (searchParams.get("error") === "access_denied") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page("Cancelled", "✋", "You cancelled the Patreon authorisation. Run <code>/link</code> in Discord if you change your mind."));
    return;
  }

  const code  = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page("Something went wrong", "❌", "Missing OAuth parameters. Please try again from Discord."));
    return;
  }

  const oauthState = await consumeOAuthState(state);
  if (!oauthState) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page("Link expired", "⏱️", "This link has expired (links last 10 minutes). Please run <code>/link</code> again in Discord."));
    return;
  }

  const result = await verifyPatreon(code);

  if (!result.ok) {
    await handleFailed(
      oauthState.interaction_token,
      "Patreon",
      result.discordError!,
      result.browserError!,
      res
    );
    return;
  }

  await handleVerified(
    client,
    oauthState.discord_id,
    oauthState.discord_tag,
    oauthState.interaction_token,
    "patreon",
    result.platformId!,
    result.platformUsername!,
    "Patreon",
    res
  );
}

// ── Server bootstrap ──────────────────────────────────────────────────────────

export function startOAuthServer(client: Client): http.Server {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${OAUTH_PORT}`);

    try {
      if (req.method === "GET" && url.pathname === "/oauth/github/callback") {
        await handleGitHubCallback(url.searchParams, client, res);
      } else if (req.method === "GET" && url.pathname === "/oauth/patreon/callback") {
        await handlePatreonCallback(url.searchParams, client, res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      }
    } catch (err) {
      console.error(chalk.red("❌ OAuth server error:"), err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end(page("Server error", "⚠️", "Something went wrong on our end. Please try again later."));
      }
    }
  });

  server.listen(OAUTH_PORT, () => {
    console.log(chalk.greenBright(`✔ OAuth callback server listening on :${OAUTH_PORT}`));
    console.log(chalk.gray(`  GitHub:  ${OAUTH_BASE_URL}/oauth/github/callback`));
    console.log(chalk.gray(`  Patreon: ${OAUTH_BASE_URL}/oauth/patreon/callback`));
  });

  return server;
}