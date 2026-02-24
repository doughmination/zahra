// Copyright (c) 2026 Girls Network
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { getCaseById, getCasesByUser } from "../db/cases";
import { buildCaseLookupEmbed } from "../utils/embeds";
import type { Command } from "../utils/types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription("Look up a moderation case or view a user's history.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub
        .setName("lookup")
        .setDescription("Look up a specific case by its ID.")
        .addStringOption((o) =>
          o
            .setName("id")
            .setDescription("The case ID, e.g. #a3f9b2c")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("history")
        .setDescription("View the moderation history of a user.")
        .addUserOption((o) =>
          o.setName("target").setDescription("The user to look up.").setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const sub = interaction.options.getSubcommand(true);

    // ── /case lookup ────────────────────────────────────────────────────────
    if (sub === "lookup") {
      const rawId = interaction.options.getString("id", true);
      const found = await getCaseById(rawId);

      if (!found) {
        await interaction.editReply(`❌ No case found with ID \`#${rawId.replace(/^#/, "")}\`.`);
        return;
      }

      // Scope to this guild
      if (found.guild_id !== guild.id) {
        await interaction.editReply("❌ That case does not belong to this server.");
        return;
      }

      await interaction.editReply({ embeds: [buildCaseLookupEmbed(found)] });
    }

    // ── /case history ───────────────────────────────────────────────────────
    else if (sub === "history") {
      const target = interaction.options.getUser("target", true);
      const cases  = await getCasesByUser(guild.id, target.id);

      if (cases.length === 0) {
        await interaction.editReply(`✅ No moderation cases found for **${target.tag}**.`);
        return;
      }

      const TYPE_EMOJI: Record<string, string> = {
        ban:    "🔨",
        unban:  "✅",
        kick:   "👢",
        warn:   "⚠️",
        mute:   "🔇",
        unmute: "🔊",
      };

      const lines = cases.map((c) => {
        const ts = Math.floor(new Date(c.created_at).getTime() / 1000);
        const emoji = TYPE_EMOJI[c.type] ?? "❔";
        const dur = c.duration ? ` (${Math.round(c.duration / 60)}m)` : "";
        return `\`#${c.case_id}\` ${emoji} **${c.type.toUpperCase()}**${dur} — <t:${ts}:R> — ${c.reason}`;
      });

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📋 Moderation History — ${target.tag}`)
        .setDescription(lines.join("\n"))
        .setFooter({ text: `${cases.length} case(s) shown (max 25)` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};