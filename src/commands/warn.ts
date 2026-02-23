// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";
import { createCase } from "../db/cases";
import { buildActionEmbed } from "../utils/embeds";
import type { Command } from "../utils/types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue a formal warning to a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("The member to warn.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the warning.").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const target    = interaction.options.getUser("target", true);
    const reason    = interaction.options.getString("reason") ?? "No reason provided.";
    const moderator = interaction.user;

    if (target.id === moderator.id) {
      await interaction.editReply("❌ You cannot warn yourself.");
      return;
    }

    if (target.bot) {
      await interaction.editReply("❌ You cannot warn a bot.");
      return;
    }

    const c = await createCase({
      guildId:      guild.id,
      type:         "warn",
      targetId:     target.id,
      targetTag:    target.tag,
      moderatorId:  moderator.id,
      moderatorTag: moderator.tag,
      reason,
    });

    // Try to DM the warned user
    try {
      await target.send(
        `⚠️ You have received a warning in **${guild.name}**.\n**Reason:** ${reason}\n**Case:** \`#${c.case_id}\``
      );
    } catch {
      // DMs are closed — not a failure
    }

    await interaction.editReply({ embeds: [buildActionEmbed(c)] });
  },
};