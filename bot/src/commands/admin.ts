// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import {
  getUserByDiscordId,
  upsertUser,
  setUserFlag,
  upsertDonorLink,
  getDonorLinks,
  type GroupFlag,
  type DonorPlatform,
} from "../db/users";
import { DONOR_GUILD_ID, DONOR_ROLE_ID } from "../utils/config";
import { BOT_OWNER_ID } from "../utils/badges";
import type { Command } from "../utils/types";

// ── Role helpers ──────────────────────────────────────────────────────────────

async function assignDonorRole(client: Client, discordId: string): Promise<boolean> {
  if (!DONOR_GUILD_ID || !DONOR_ROLE_ID) return false;
  try {
    const guild  = await client.guilds.fetch(DONOR_GUILD_ID);
    const member = await guild.members.fetch(discordId);
    if (member.roles.cache.has(DONOR_ROLE_ID)) return true;
    await member.roles.add(DONOR_ROLE_ID, "Donor granted via /admin adduser");
    return true;
  } catch {
    return false;
  }
}

async function removeDonorRole(client: Client, discordId: string): Promise<boolean> {
  if (!DONOR_GUILD_ID || !DONOR_ROLE_ID) return false;
  try {
    const guild  = await client.guilds.fetch(DONOR_GUILD_ID);
    const member = await guild.members.fetch(discordId);
    if (!member.roles.cache.has(DONOR_ROLE_ID)) return true;
    await member.roles.remove(DONOR_ROLE_ID, "Donor removed via /admin removeuser");
    return true;
  } catch {
    return false;
  }
}

// ── Command ───────────────────────────────────────────────────────────────────

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Bot owner only — manage users and donor records.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // ── adduser ──────────────────────────────────────────────────────────────
    .addSubcommand((sub) =>
      sub
        .setName("adduser")
        .setDescription("Manually add a user to a group or mark them as a donor.")
        .addUserOption((o) =>
          o.setName("user").setDescription("The Discord user.").setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("group")
            .setDescription("Which group to add them to.")
            .setRequired(true)
            .addChoices(
              { name: "Donor",         value: "is_donor"         },
              { name: "Friend",        value: "is_friend"        },
              { name: "Girls Network", value: "is_girls_network" },
              { name: "Girls Mod",     value: "is_girls_mod"     },
              { name: "Girls Bot",     value: "is_girls_bot"     },
            )
        )
        .addStringOption((o) =>
          o
            .setName("platform")
            .setDescription("If adding as donor, which platform? (Creates a donor_links record)")
            .setRequired(false)
            .addChoices(
              { name: "GitHub Sponsors", value: "github"  },
              { name: "Patreon",         value: "patreon" },
            )
        )
        .addStringOption((o) =>
          o
            .setName("platform_username")
            .setDescription("Their username on that platform (e.g. their GitHub handle).")
            .setRequired(false)
        )
        .addStringOption((o) =>
          o.setName("notes").setDescription("Optional notes to store against this user.").setRequired(false)
        )
    )

    // ── removeuser ───────────────────────────────────────────────────────────
    .addSubcommand((sub) =>
      sub
        .setName("removeuser")
        .setDescription("Remove a user from a group.")
        .addUserOption((o) =>
          o.setName("user").setDescription("The Discord user.").setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("group")
            .setDescription("Which group to remove them from.")
            .setRequired(true)
            .addChoices(
              { name: "Donor",         value: "is_donor"         },
              { name: "Friend",        value: "is_friend"        },
              { name: "Girls Network", value: "is_girls_network" },
              { name: "Girls Mod",     value: "is_girls_mod"     },
              { name: "Girls Bot",     value: "is_girls_bot"     },
            )
        )
    )

    // ── userinfo ─────────────────────────────────────────────────────────────
    .addSubcommand((sub) =>
      sub
        .setName("userinfo")
        .setDescription("Show the full DB record for a user.")
        .addUserOption((o) =>
          o.setName("user").setDescription("The Discord user.").setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    // Bot owner only
    if (interaction.user.id !== BOT_OWNER_ID) {
      await interaction.reply({ content: "❌ This command is restricted to the bot owner.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const sub = interaction.options.getSubcommand();

    // ── /admin adduser ────────────────────────────────────────────────────────
    if (sub === "adduser") {
      const target          = interaction.options.getUser("user", true);
      const group           = interaction.options.getString("group", true) as GroupFlag;
      const platform        = interaction.options.getString("platform") as DonorPlatform | null;
      const platformUsername = interaction.options.getString("platform_username");
      const notes           = interaction.options.getString("notes");

      // Upsert the user with the chosen flag
      await upsertUser(target.id, target.tag, {
        [group]: true,
        ...(notes ? { notes } : {}),
      });

      // If adding as donor and a platform was provided, create a donor_links record
      if (group === "is_donor" && platform) {
        const username = platformUsername ?? target.username;
        // Use a synthetic platform ID for manually granted records
        await upsertDonorLink(target.id, platform, `manual:${target.id}`, username);
      }

      // Assign donor role if applicable
      let roleNote = "";
      if (group === "is_donor") {
        const assigned = await assignDonorRole(client, target.id);
        roleNote = assigned ? "\nDonor role assigned." : "\nCould not assign role (user may not be in the configured guild).";
      }

      const platformNote = group === "is_donor" && platform
        ? `\nPlatform: **${platform === "github" ? "GitHub Sponsors" : "Patreon"}** (${platformUsername ?? target.username})`
        : "";

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("✅ User updated")
            .setDescription(
              `Added **${target.tag}** to **${group}**.${platformNote}${roleNote}`
            )
            .setTimestamp(),
        ],
      });
      return;
    }

    // ── /admin removeuser ─────────────────────────────────────────────────────
    if (sub === "removeuser") {
      const target = interaction.options.getUser("user", true);
      const group  = interaction.options.getString("group", true) as GroupFlag;

      const updated = await setUserFlag(target.id, group, false);

      if (!updated) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xe74c3c)
              .setTitle("❌ User not found")
              .setDescription(`No DB record found for **${target.tag}**. They may never have used the bot.`)
              .setTimestamp(),
          ],
        });
        return;
      }

      // Remove donor role if applicable
      let roleNote = "";
      if (group === "is_donor") {
        const removed = await removeDonorRole(client, target.id);
        roleNote = removed ? "\nDonor role removed." : "\nCould not remove role (user may not be in the configured guild).";
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe67e22)
            .setTitle("✅ User updated")
            .setDescription(`Removed **${target.tag}** from **${group}**.${roleNote}`)
            .setTimestamp(),
        ],
      });
      return;
    }

    // ── /admin userinfo ───────────────────────────────────────────────────────
    if (sub === "userinfo") {
      const target     = interaction.options.getUser("user", true);
      const record     = await getUserByDiscordId(target.id);
      const donorLinks = await getDonorLinks(target.id);

      if (!record) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x95a5a6)
              .setTitle("No record")
              .setDescription(`**${target.tag}** has no DB record yet.`)
              .setTimestamp(),
          ],
        });
        return;
      }

      const bool = (v: boolean) => v ? "✅ Yes" : "❌ No";

      const linksText = donorLinks.length > 0
        ? donorLinks.map((l) =>
            `• ${l.platform === "github" ? "GitHub Sponsors" : "Patreon"} — **${l.platform_username}** ` +
            `(ID: \`${l.platform_id}\`, verified <t:${Math.floor(new Date(l.verified_at).getTime() / 1000)}:R>)`
          ).join("\n")
        : "None";

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle(`🔍 DB record — ${target.tag}`)
            .addFields(
              { name: "Discord ID",    value: record.discord_id,              inline: true  },
              { name: "DB ID",         value: String(record.id),              inline: true  },
              { name: "\u200b",        value: "\u200b",                       inline: true  },
              { name: "Donor",         value: bool(record.is_donor),          inline: true  },
              { name: "Friend",        value: bool(record.is_friend),         inline: true  },
              { name: "\u200b",        value: "\u200b",                       inline: true  },
              { name: "Girls Network", value: bool(record.is_girls_network),  inline: true  },
              { name: "Girls Mod",     value: bool(record.is_girls_mod),      inline: true  },
              { name: "Girls Bot",     value: bool(record.is_girls_bot),      inline: true  },
              { name: "Donor links",   value: linksText,                      inline: false },
              { name: "Notes",         value: record.notes ?? "None",         inline: false },
              { name: "Created",       value: `<t:${Math.floor(new Date(record.created_at).getTime() / 1000)}:R>`, inline: true },
              { name: "Updated",       value: `<t:${Math.floor(new Date(record.updated_at).getTime() / 1000)}:R>`, inline: true },
            )
            .setTimestamp(),
        ],
      });
    }
  },
};