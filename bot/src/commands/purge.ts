// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
  TextChannel,
} from "discord.js";
import type { Command } from "../utils/types";

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk-delete messages from this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((o) =>
      o
        .setName("amount")
        .setDescription("Number of messages to delete (1–100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("Only delete messages from this user.")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const channel = interaction.channel;
    if (!channel || !(channel instanceof TextChannel)) {
      await interaction.editReply("❌ This command can only be used in a text channel.");
      return;
    }

    const amount     = interaction.options.getInteger("amount", true);
    const targetUser = interaction.options.getUser("target");

    // Fetch messages — fetch a larger batch if filtering by user so we hit the target count
    const fetchCount = targetUser ? Math.min(amount * 5, 100) : amount;

    let messages = await channel.messages.fetch({ limit: fetchCount });

    // Filter by user if specified
    if (targetUser) {
      messages = messages.filter((m) => m.author.id === targetUser.id);
    }

    // Discord bulk-delete only works for messages under 14 days old
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const deletable   = messages
      .filter((m) => m.createdTimestamp > twoWeeksAgo)
      .first(amount);

    if (deletable.length === 0) {
      await interaction.editReply(
        "❌ No deletable messages found. Messages older than 14 days cannot be bulk-deleted."
      );
      return;
    }

    const deleted = await channel.bulkDelete(deletable, true).catch(() => null);

    if (!deleted) {
      await interaction.editReply("❌ Failed to delete messages. Check my permissions.");
      return;
    }

    const suffix = targetUser ? ` from **${targetUser.tag}**` : "";
    await interaction.editReply(
      `🗑️ Successfully deleted **${deleted.size}** message(s)${suffix}.`
    );
  },
};