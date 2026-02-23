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
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("The member to kick.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the kick.").setRequired(false)
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
      await interaction.editReply("❌ You cannot kick yourself.");
      return;
    }

    const targetMember = await guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      await interaction.editReply("❌ That user is not in this server.");
      return;
    }

    const modMember = await guild.members.fetch(moderator.id).catch(() => null);
    if (modMember && targetMember.roles.highest.position >= modMember.roles.highest.position) {
      await interaction.editReply("❌ You cannot kick a member with an equal or higher role.");
      return;
    }

    if (!targetMember.kickable) {
      await interaction.editReply("❌ I do not have permission to kick that member.");
      return;
    }

    try {
      await targetMember.kick(`[${moderator.tag}] ${reason}`);
    } catch {
      await interaction.editReply("❌ Failed to kick the member. Check my permissions and role hierarchy.");
      return;
    }

    const c = await createCase({
      guildId:      guild.id,
      type:         "kick",
      targetId:     target.id,
      targetTag:    target.tag,
      moderatorId:  moderator.id,
      moderatorTag: moderator.tag,
      reason,
    });

    await interaction.editReply({ embeds: [buildActionEmbed(c)] });
  },
};