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
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("The member to ban.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the ban.").setRequired(false)
    )
    .addIntegerOption((o) =>
      o
        .setName("delete_days")
        .setDescription("Number of days of messages to delete (0-7).")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const target      = interaction.options.getUser("target", true);
    const reason      = interaction.options.getString("reason") ?? "No reason provided.";
    const deleteDays  = interaction.options.getInteger("delete_days") ?? 0;
    const moderator   = interaction.user;

    // Prevent self-ban
    if (target.id === moderator.id) {
      await interaction.editReply("❌ You cannot ban yourself.");
      return;
    }

    // Prevent banning the bot
    if (target.id === _client.user?.id) {
      await interaction.editReply("❌ I cannot ban myself.");
      return;
    }

    // Hierarchy check
    const targetMember = await guild.members.fetch(target.id).catch(() => null);
    const modMember    = await guild.members.fetch(moderator.id).catch(() => null);

    if (targetMember && modMember) {
      if (targetMember.roles.highest.position >= modMember.roles.highest.position) {
        await interaction.editReply("❌ You cannot ban a member with an equal or higher role.");
        return;
      }

      if (!targetMember.bannable) {
        await interaction.editReply("❌ I do not have permission to ban that member.");
        return;
      }
    }

    try {
      await guild.members.ban(target.id, {
        reason: `[${moderator.tag}] ${reason}`,
        deleteMessageDays: deleteDays,
      });
    } catch {
      await interaction.editReply("❌ Failed to ban the member. Check my permissions and role hierarchy.");
      return;
    }

    const c = await createCase({
      guildId:      guild.id,
      type:         "ban",
      targetId:     target.id,
      targetTag:    target.tag,
      moderatorId:  moderator.id,
      moderatorTag: moderator.tag,
      reason,
    });

    await interaction.editReply({ embeds: [buildActionEmbed(c)] });
  },
};