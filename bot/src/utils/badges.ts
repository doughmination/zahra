// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import type { User, GuildMember } from "discord.js";
import { getUserByDiscordId, getDonorLinks } from "../db/users";

// ── Static identity constants ─────────────────────────────────────────────────

export const BOT_OWNER_ID = "1125844710511104030";

export const BOT_DEVELOPER_IDS: string[] = [
  "1125844710511104030",
];

export const ZAHRA_ID = "1475052462410043514";

export const BOT_IDS: string[] = [
  "1475052462410043514", // Zahra
  "1470035010592440393", // Robot
  "1466359948777885799", // OnlyMeows
  "1462829528790597684", // Shortcuts
  "1469693643106291915", // Modding SSO
];

export const discordBadgeMap: Record<string, string> = {
  Staff:                 "<:staff:1475970990268878949> Discord Staff",
  Partner:               "<:partner:1475971086117245200> Partnered Server Owner",
  Hypesquad:             "<:events:1475971154220023955> HypeSquad Events",
  BugHunterLevel1:       "<:bug1:1475970519458386071> Bug Hunter",
  BugHunterLevel2:       "<:bug2:1475970549325758664> Golden Bug Hunter",
  HypeSquadOnlineHouse1: "<:bravery:1475970032751345684> HypeSquad Bravery",
  HypeSquadOnlineHouse2: "<:brilliance:1475969999830253589> HypeSquad Brilliance",
  HypeSquadOnlineHouse3: "<:balance:1475970066099998740> HypeSquad Balance",
  PremiumEarlySupporter: "<:earlyNitro:1475970814066163894> Early Nitro User",
  VerifiedDeveloper:     "<:verified:1475971385770905767> Verified Early Bot Developer",
  CertifiedModerator:    "<:moderator:1475971723521425428> Discord Moderator Program Alumni",
  QuestCompleted:        "<:quest:1476544779297755247> Completed a Quest",
  OrbsApprentice:        "<:orbs:1476544780505845915> Discord Orbs Apprentice"
};

const PLATFORM_LABEL: Record<string, string> = {
  github:  "GitHub Sponsors",
  patreon: "Patreon",
};

// ── Badge resolution ──────────────────────────────────────────────────────────

export async function resolveBadges(user: User, member?: GuildMember | null): Promise<string> {
  const zahraBadges:   string[] = [];
  const nitroBadges:   string[] = [];
  const discordBadges: string[] = [];

  if (member?.premiumSince) {
    nitroBadges.push("<:nitro:1475978769347903508> Discord Nitro");
  }

  // Bot owner / developer
  if (user.id === BOT_OWNER_ID) {
    zahraBadges.push("<:round:1475949812787580999> Zahra Bot Owner");
  } else if (BOT_DEVELOPER_IDS.includes(user.id)) {
    zahraBadges.push("<:round:1475949812787580999> Zahra Developer");
  }

  if (user.id === ZAHRA_ID) {
    zahraBadges.push("<:round:1475949812787580999> Zahra");
  }

  if (BOT_IDS.includes(user.id)) {
    zahraBadges.push("<:butterfly:1475950160302571581> Doughmination Bot");
  }

  // DB-driven badges
  try {
    const [record, donorLinks] = await Promise.all([
      getUserByDiscordId(user.id),
      getDonorLinks(user.id),
    ]);

    if (record?.is_donor) {
      if (donorLinks.length > 0) {
        for (const link of donorLinks) {
          const label = PLATFORM_LABEL[link.platform] ?? link.platform;
          zahraBadges.push(
            `<:donor:1476514226536452118> Donor via ${label} (${link.platform_username})`
          );
        }
      } else {
        // Manually granted, no OAuth link
        zahraBadges.push("<:donor:1476514226536452118> Donor");
      }
    }

    if (record?.is_girls_bot) {
      zahraBadges.push("<:girls:1475950689158041600> Girls Network Bot");
    } else if (record?.is_girls_mod) {
      zahraBadges.push("<:girls:1475950689158041600> Girls Mod");
    } else if (record?.is_girls_network) {
      zahraBadges.push("<:girls:1475950689158041600> Girls Network");
    }

    if (record?.is_friend) {
      zahraBadges.push("<:butterfly:1475950160302571581> Friend");
    }
  } catch {
    // DB unavailable — static badges still shown
  }

  for (const flag of user.flags?.toArray() ?? []) {
    if (flag in discordBadgeMap) {
      discordBadges.push(discordBadgeMap[flag]);
    }
  }

  return [...zahraBadges, ...nitroBadges, ...discordBadges].join("\n") || "None";
}