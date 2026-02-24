// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import type { Command } from "../utils/types";
import { publicDecrypt } from "node:crypto";

// ── Bot ownership and developer roster ────────────────────────────────────────────────────────────────

/** The bot owner's Discord ID, Displayed with a crown badge */
const BOT_OWNER_ID = "1125844710511104030";

/**
 * Discord IDs of the bot's developers.
 * The Owner ID is also included here.
 */
const BOT_DEVELOPER_IDS: string[] = [
  "1125844710511104030", // Owner
  "1474568910736199825",
]

const ZAHRA_ID = "1475052462410043514";

/** Custom Bots I've Made */
const BOT_IDS: string[] = [
  "1475052462410043514", // Zahra
  "1470035010592440393", // Robot
  "1466359948777885799", // OnlyMeows
  "1462829528790597684", // Shortcuts
  "1469693643106291915", // Modding SSO
]

const GIRLS_BOTS: string[] = [
  "1475380726643032064", // GayBot
  "1449095867372933181", // BanSync
  "1456858864551985378", // RaidGuardian
  "1442680671880351795", // Booster Bot
]

// ── Command ───────────────────────────────────────────────────────────────────────────────────────────

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display information about a user.")
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("The user to look up. Defaults to yourself.")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, _client: Client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply("❌ This command can only be used in a server.");
      return;
    }

    const targetUser = interaction.options.getUser("target") ?? interaction.user;
    const member     = await guild.members.fetch(targetUser.id).catch(() => null) as GuildMember | null;

    const accountCreatedTs = Math.floor(targetUser.createdTimestamp / 1000);
    const joinedTs         = member?.joinedTimestamp
      ? Math.floor(member.joinedTimestamp / 1000)
      : null;

    // Roles (exclude @everyone, cap display at 20)
    const roles = member?.roles.cache
      .filter((r) => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      ?? null;

    const roleDisplay = roles && roles.size > 0
      ? roles
          .map((r) => `<@&${r.id}>`)
          .slice(0, 20)
          .join(" ") + (roles.size > 20 ? ` … (+${roles.size - 20} more)` : "")
      : "None";

    // Discord's badges
    const flags      = targetUser.flags?.toArray() ?? [];
    const badgeMap: Record<string, string> = {
      Staff:                      "👨‍💼 Discord Staff",
      Partner:                    "🤝 Partnered Server Owner",
      Hypesquad:                  "🏠 HypeSquad Events",
      BugHunterLevel1:            "🐛 Bug Hunter (Level 1)",
      BugHunterLevel2:            "🐛 Bug Hunter (Level 2)",
      HypeSquadOnlineHouse1:      "🏠 HypeSquad Bravery",
      HypeSquadOnlineHouse2:      "🏠 HypeSquad Brilliance",
      HypeSquadOnlineHouse3:      "🏠 HypeSquad Balance",
      PremiumEarlySupporter:      "💎 Early Supporter",
      VerifiedDeveloper:          "🤖 Verified Bot Developer",
      ActiveDeveloper:            "🔧 Active Developer",
      CertifiedModerator:         "🛡️ Discord Certified Moderator",
    };
    const discordBadges = flags.map((f) => badgeMap[f] ?? f);

    // ── Zahra badges ────────────────────────────────────────────
    const zahraBadges: string[] = [];

    if (targetUser.id === BOT_OWNER_ID) {
      zahraBadges.push("<:round:1475949812787580999> Zahra Bot Owner");
    }

    if (BOT_DEVELOPER_IDS.includes(targetUser.id)) {
      zahraBadges.push("<:round:1475949812787580999> Zahra Developer");
    }

    if (targetUser.id == ZAHRA_ID) {
      zahraBadges.push("<:round:1475949812787580999> Zahra");
    }

    if (BOT_IDS.includes(targetUser.id)) {
      zahraBadges.push("<:butterfly:1475950160302571581> Doughmination Bot")
    }

    if (GIRLS_BOTS.includes(targetUser.id)){
      zahraBadges.push("<:girls:1475950689158041600> Girls Network")
    }

    // Combine all badges
    const allBadges = [...zahraBadges, ...discordBadges];
    const badges = allBadges.join("\n") || "None";

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor !== "#000000" ? member?.displayHexColor ?? 0x5865f2 : 0x5865f2)
      .setTitle(`👤 ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "User ID",          value: targetUser.id,                            inline: true  },
        { name: "Bot?",             value: targetUser.bot ? "Yes" : "No",            inline: true  },
        { name: "\u200B",           value: "\u200B",                                 inline: true  },
        { name: "Account Created",  value: `<t:${accountCreatedTs}:F>`,              inline: true  },
        { name: "Joined Server",    value: joinedTs ? `<t:${joinedTs}:F>` : "N/A",  inline: true  },
        { name: "\u200B",           value: "\u200B",                                 inline: true  },
        { name: "Nickname",         value: member?.nickname ?? "None",               inline: true  },
        { name: "Highest Role",     value: roles && roles.size > 0 ? `<@&${roles.first()!.id}>` : "None", inline: true },
        { name: "\u200B",           value: "\u200B",                                 inline: true  },
        { name: `Roles (${roles?.size ?? 0})`, value: roleDisplay,                  inline: false },
        { name: "Badges",           value: badges,                                   inline: false },
      )
      .setFooter({ text: `User ID: ${targetUser.id}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};