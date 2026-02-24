// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../utils/types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("dash")
    .setDescription("Get a link to the Zahra web dashboard."),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("🚧 Dashboard — Coming Soon")
      .setDescription(
        "The **Zahra Dashboard** is currently under active development and isn't available just yet.\n\n" +
        "We're working hard to bring you a fully-featured web dashboard for managing your server, " +
        "moderation cases, and bot settings — all from your browser.\n\n" +
        "Stay tuned for updates!"
      )
      .addFields(
        { name: "Status", value: "🟡 In Development", inline: true },
      )
      .setFooter({ text: "Zahra — Free forever" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};