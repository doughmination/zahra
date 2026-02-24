// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Guild,
} from "discord.js";
import type { Command } from "../utils/types";

const VERIFICATION_LABELS: Record<number, string> = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Very High",
};

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Display information about this server."),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild as Guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    // Fetch full guild data (includes approximate member counts etc.)
    const fullGuild = await guild.fetch();

    const owner = await _client.users.fetch(fullGuild.ownerId).catch(() => null);
    const createdTs = Math.floor(fullGuild.createdTimestamp / 1000);

    const totalChannels  = fullGuild.channels.cache.size;
    const textChannels   = fullGuild.channels.cache.filter((c) => c.isTextBased()).size;
    const voiceChannels  = fullGuild.channels.cache.filter((c) => c.isVoiceBased()).size;
    const roles          = fullGuild.roles.cache.size - 1; // exclude @everyone
    const emojis         = fullGuild.emojis.cache.size;
    const boosters       = fullGuild.premiumSubscriptionCount ?? 0;
    const boostTier      = fullGuild.premiumTier;
    const verificationLv = VERIFICATION_LABELS[fullGuild.verificationLevel] ?? "Unknown";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🏰 ${fullGuild.name}`)
      .setThumbnail(fullGuild.iconURL({ size: 256 }) ?? null)
      .addFields(
        { name: "Owner",         value: owner ? `<@${owner.id}> (${owner.tag})` : `<@${fullGuild.ownerId}>`, inline: true },
        { name: "Server ID",     value: fullGuild.id,                           inline: true },
        { name: "Created",       value: `<t:${createdTs}:F>`,                  inline: false },
        { name: "Members",       value: `${fullGuild.memberCount.toLocaleString()}`, inline: true },
        { name: "Roles",         value: roles.toString(),                       inline: true },
        { name: "Emojis",        value: emojis.toString(),                      inline: true },
        { name: "Channels",      value: `${totalChannels} total (${textChannels} text · ${voiceChannels} voice)`, inline: false },
        { name: "Verification",  value: verificationLv,                         inline: true },
        { name: "Boost Tier",    value: `Tier ${boostTier} (${boosters} boost${boosters !== 1 ? "s" : ""})`, inline: true },
      )
      .setImage(fullGuild.bannerURL({ size: 1024 }) ?? null)
      .setFooter({ text: `Server ID: ${fullGuild.id}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};