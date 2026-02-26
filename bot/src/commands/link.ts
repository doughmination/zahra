// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { createOAuthState, getDonorLinks } from "../db/users";
import {
  OAUTH_BASE_URL,
  GITHUB_CLIENT_ID,
  GITHUB_SPONSOR_LOGIN,
  PATREON_CLIENT_ID,
  APPLICATION_ID,
} from "../utils/config";
import type { Command } from "../utils/types";

type Platform = "github" | "patreon";

const PLATFORMS: Record<Platform, {
  label:    string;
  emoji:    string;
  color:    number;
  buildUrl: (state: string) => string;
}> = {
  github: {
    label: "GitHub Sponsors",
    emoji: "💜",
    color: 0x24292e,
    buildUrl: (state) =>
      `https://github.com/login/oauth/authorize` +
      `?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(`${OAUTH_BASE_URL}/oauth/github/callback`)}` +
      `&scope=read%3Auser` +
      `&state=${state}` +
      `&allow_signup=false`,
  },
  patreon: {
    label: "Patreon",
    emoji: "🧡",
    color: 0xff424d,
    buildUrl: (state) =>
      `https://www.patreon.com/oauth2/authorize` +
      `?response_type=code` +
      `&client_id=${PATREON_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(`${OAUTH_BASE_URL}/oauth/patreon/callback`)}` +
      `&scope=identity%20identity.memberships` +
      `&state=${state}`,
  },
};

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your donor account to claim your Donor badge and role.")
    .addStringOption((o) =>
      o
        .setName("platform")
        .setDescription("Which platform did you donate on?")
        .setRequired(true)
        .addChoices(
          { name: "GitHub Sponsors", value: "github"  },
          { name: "Patreon",         value: "patreon" }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply({ ephemeral: true });

    const platform = interaction.options.getString("platform", true) as Platform;
    const meta     = PLATFORMS[platform];

    // Check if this platform is already linked
    const existing    = await getDonorLinks(interaction.user.id);
    const alreadyLinked = existing.find((l) => l.platform === platform);

    if (alreadyLinked) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle(`${meta.emoji} Already linked — ${meta.label}`)
            .setDescription(
              `Your ${meta.label} account **${alreadyLinked.platform_username}** is already verified.\n\n` +
              `If you need to re-link (e.g. you changed accounts), please contact support.`
            )
            .setTimestamp(),
        ],
      });
      return;
    }

    // Create a signed one-time OAuth state token (10 min TTL in Redis)
    const state = await createOAuthState({
      discord_id:        interaction.user.id,
      discord_tag:       interaction.user.tag,
      platform,
      interaction_token: interaction.token,
      application_id:    APPLICATION_ID,
    });

    const oauthUrl = meta.buildUrl(state);

    const platformNote = platform === "github"
      ? `Donors must be actively sponsoring **${GITHUB_SPONSOR_LOGIN}** on GitHub Sponsors.`
      : `Donors must have an active pledge to our Patreon campaign.`;

    const embed = new EmbedBuilder()
      .setColor(meta.color)
      .setTitle(`${meta.emoji} Link your ${meta.label} account`)
      .setDescription(
        `Click **Verify on ${meta.label}** below to confirm your donation.\n\n` +
        `${platformNote}\n\n` +
        `> ⚠️ This link is **personal — don't share it**. It expires in **10 minutes**.\n\n` +
        `After authorising, come back here — this message will update automatically.`
      )
      .setFooter({ text: "Zahra — Thank you for your support 💜" })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(`Verify on ${meta.label}`)
        .setStyle(ButtonStyle.Link)
        .setURL(oauthUrl)
        .setEmoji(meta.emoji)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
};