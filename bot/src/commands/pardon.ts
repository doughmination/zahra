// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { pardonCase } from "../db/cases";
import type { Command } from "../utils/types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("pardon")
    .setDescription("Pardon (void) a moderation case by its ID.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) =>
      o
        .setName("id")
        .setDescription("The case ID to pardon, e.g. #a3f9b2c")
        .setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("reason")
        .setDescription("Reason for pardoning this case.")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const rawId = interaction.options.getString("id", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided.";

    const result = await pardonCase(rawId, guild.id);

    if (result === "not_found") {
      await interaction.editReply(`❌ No case found with ID \`#${rawId.replace(/^#/, "")}\`.`);
      return;
    }

    if (result === "wrong_guild") {
      await interaction.editReply("❌ That case does not belong to this server.");
      return;
    }

    if (result === "already_inactive") {
      await interaction.editReply(`⚠️ Case \`#${result}\` is already inactive/pardoned.`);
      return;
    }

    const c = result;
    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`✅ PARDON — Case \`#${c.case_id}\``)
      .addFields(
        { name: "Original Action", value: c.type.toUpperCase(), inline: true },
        { name: "Target",          value: `<@${c.target_id}> (${c.target_tag})`, inline: true },
        { name: "\u200B",          value: "\u200B", inline: true },
        { name: "Pardoned By",     value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: true },
        { name: "Pardon Reason",   value: reason, inline: false },
        { name: "Original Reason", value: c.reason, inline: false },
      )
      .setFooter({ text: `Case ID: #${c.case_id}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};