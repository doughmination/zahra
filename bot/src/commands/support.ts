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

// ── Config — update these as needed ─────────────────────────────────────────
const SUPPORT_SERVER = "https://discord.gg/RQDRzK3VBe";
const GITHUB_URL     = "https://github.com/doughmination/zahra";
const ISSUES_URL     = "https://github.com/doughmination/Zahra/issues";
// ────────────────────────────────────────────────────────────────────────────

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Get help and support resources for Zahra."),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🛟 Zahra Support")
      .setDescription(
        "Need help? Here are all the resources available to you."
      )
      .addFields(
        {
          name: "💬 Support Server",
          value: `Join our Discord for live support:\n${SUPPORT_SERVER}`,
          inline: false,
        },
        {
          name: "🐛 Bug Reports & Feature Requests",
          value: `Open an issue on GitHub:\n${ISSUES_URL}`,
          inline: false,
        },
        {
          name: "📦 Source Code",
          value: `Zahra is open source and free forever:\n${GITHUB_URL}`,
          inline: false,
        },
        {
          name: "📜 Licence",
          value: "Zahra is licenced under the **ESAL‑1.3** (Estrogen Source-Available Licence).\nSee `LICENCE.md` in the repository for full details.",
          inline: false,
        },
      )
      .setFooter({ text: "Zahra — Feature rich, free forever" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};