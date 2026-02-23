// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import { EmbedBuilder } from "discord.js";
import type { Case, CaseType } from "../db/cases";

// ── Colours ──────────────────────────────────────────────────────────────────

const TYPE_COLOUR: Record<CaseType, number> = {
  ban:    0xe74c3c, // red
  unban:  0x2ecc71, // green
  kick:   0xe67e22, // orange
  warn:   0xf1c40f, // yellow
  mute:   0x9b59b6, // purple
  unmute: 0x2ecc71, // green
};

const TYPE_EMOJI: Record<CaseType, string> = {
  ban:    "🔨",
  unban:  "✅",
  kick:   "👢",
  warn:   "⚠️",
  mute:   "🔇",
  unmute: "🔊",
};

// ── Builders ─────────────────────────────────────────────────────────────────

/** Builds the embed shown after a moderation action is taken. */
export function buildActionEmbed(c: Case): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(TYPE_COLOUR[c.type])
    .setTitle(`${TYPE_EMOJI[c.type]} ${c.type.toUpperCase()} — Case \`#${c.case_id}\``)
    .addFields(
      { name: "Target",     value: `<@${c.target_id}> (${c.target_tag})`, inline: true },
      { name: "Moderator",  value: `<@${c.moderator_id}> (${c.moderator_tag})`, inline: true },
      { name: "\u200B",     value: "\u200B", inline: true },
      { name: "Reason",     value: c.reason },
    )
    .setTimestamp(new Date(c.created_at));

  if (c.duration) {
    const mins = Math.round(c.duration / 60);
    embed.addFields({ name: "Duration", value: `${mins} minute(s)`, inline: true });
  }

  embed.setFooter({ text: `Case ID: #${c.case_id}` });
  return embed;
}

/** Builds the embed shown when looking up a case. */
export function buildCaseLookupEmbed(c: Case): EmbedBuilder {
  const embed = buildActionEmbed(c);
  embed.setTitle(`${TYPE_EMOJI[c.type]} Case \`#${c.case_id}\` — ${c.type.toUpperCase()}`);

  const timestamp = Math.floor(new Date(c.created_at).getTime() / 1000);
  embed.addFields(
    { name: "Created",  value: `<t:${timestamp}:F>`, inline: true },
    { name: "Status",   value: c.active ? "🟢 Active" : "⚫ Inactive", inline: true },
  );

  return embed;
}

/** Formats a duration string like "1h 30m" or "45m" to seconds. Returns null on parse failure. */
export function parseDuration(input: string): number | null {
  const regex = /(?:(\d+)h)?(?:(\d+)m)?/i;
  const match = input.match(regex);
  if (!match || (!match[1] && !match[2])) return null;

  const hours   = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const total   = hours * 3600 + minutes * 60;
  return total > 0 ? total : null;
}