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
import { buildActionEmbed, parseDuration } from "../utils/embeds";
import type { Command } from "../utils/types";

// Discord's maximum timeout is 28 days
const MAX_TIMEOUT_SECONDS = 28 * 24 * 60 * 60;

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member using Discord's native timeout feature.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("The member to mute.").setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("duration")
        .setDescription("How long to mute them, e.g. 1h, 30m, 2h30m. Max 28 days.")
        .setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the mute.").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const target       = interaction.options.getUser("target", true);
    const durationStr  = interaction.options.getString("duration", true);
    const reason       = interaction.options.getString("reason") ?? "No reason provided.";
    const moderator    = interaction.user;

    if (target.id === moderator.id) {
      await interaction.editReply("❌ You cannot mute yourself.");
      return;
    }

    if (target.bot) {
      await interaction.editReply("❌ You cannot mute a bot.");
      return;
    }

    const durationSecs = parseDuration(durationStr);
    if (!durationSecs) {
      await interaction.editReply(
        "❌ Invalid duration format. Use `1h`, `30m`, or `1h30m`."
      );
      return;
    }

    if (durationSecs > MAX_TIMEOUT_SECONDS) {
      await interaction.editReply("❌ Duration cannot exceed 28 days.");
      return;
    }

    const targetMember = await guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      await interaction.editReply("❌ That user is not in this server.");
      return;
    }

    const modMember = await guild.members.fetch(moderator.id).catch(() => null);
    if (modMember && targetMember.roles.highest.position >= modMember.roles.highest.position) {
      await interaction.editReply("❌ You cannot mute a member with an equal or higher role.");
      return;
    }

    if (!targetMember.moderatable) {
      await interaction.editReply("❌ I do not have permission to mute that member.");
      return;
    }

    const until = new Date(Date.now() + durationSecs * 1000);

    try {
      await targetMember.timeout(durationSecs * 1000, `[${moderator.tag}] ${reason}`);
    } catch {
      await interaction.editReply("❌ Failed to mute the member. Check my permissions.");
      return;
    }

    const c = await createCase({
      guildId:      guild.id,
      type:         "mute",
      targetId:     target.id,
      targetTag:    target.tag,
      moderatorId:  moderator.id,
      moderatorTag: moderator.tag,
      reason,
      duration:     durationSecs,
    });

    await interaction.editReply({ embeds: [buildActionEmbed(c)] });
  },
};