// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import type { User, GuildMember } from "discord.js";

// ── Custom Badges ────────────────────────────────────────────────────────────

/** The bot owner's Discord ID, displayed with a crown badge */
export const BOT_OWNER_ID = "1125844710511104030";

/**
 * Discord IDs of the bot's developers.
 * The Owner ID is also included here.
 */
export const BOT_DEVELOPER_IDS: string[] = [
    "1125844710511104030", // Owner
    "1474568910736199825",
];

export const ZAHRA_ID = "1475052462410043514";

/** Custom Bots I've Made */
export const BOT_IDS: string[] = [
    "1475052462410043514", // Zahra
    "1470035010592440393", // Robot
    "1466359948777885799", // OnlyMeows
    "1462829528790597684", // Shortcuts
    "1469693643106291915", // Modding SSO
];

export const GIRLS_BOTS: string[] = [
    "1475380726643032064", // GayBot
    "1449095867372933181", // BanSync
    "1456858864551985378", // RaidGuardian
    "1442680671880351795", // Booster Bot
];

export const GIRLS_MODS: string[] = [
    "855122091791089664",
    "908055723659898902",
    "1019663199404040194",
    "1269452254167957670",
    "1168620183494070465",
    "1195135576693801051",
    "626499091903283230",
    "751168915417071749",
    "527709099186716673",
    "1255312849442570260",
    "810257561596461166",
    "652597508027187240",
    "1275507540578275400",
    "1372852461521342476",
];

// ── Badge Maps ────────────────────────────────────────────────────────────────

export const discordBadgeMap: Record<string, string> = {
    Staff: "<:staff:1475970990268878949> Discord Staff",
    Partner: "<:partner:1475971086117245200> Partnered Server Owner",
    Hypesquad: "<:events:1475971154220023955> HypeSquad Events",
    BugHunterLevel1: "<:bug1:1475970519458386071> Bug Hunter",
    BugHunterLevel2: "<:bug2:1475970549325758664> Golden Bug Hunter",
    HypeSquadOnlineHouse1: "<:bravery:1475970032751345684> HypeSquad Bravery",
    HypeSquadOnlineHouse2: "<:brilliance:1475969999830253589> HypeSquad Brilliance",
    HypeSquadOnlineHouse3: "<:balance:1475970066099998740> HypeSquad Balance",
    PremiumEarlySupporter: "<:earlyNitro:1475970814066163894> Early Nitro User",
    VerifiedDeveloper: "<:verified:1475971385770905767> Verified Early Bot Developer",
    CertifiedModerator: "<:moderator:1475971723521425428> Discord Moderator Program Alumni",
};

// ── Badge Resolution ──────────────────────────────────────────────────────────

/**
 * Resolves all badges (Zahra custom + Discord) for a given user.
 * Returns a newline-joined string, or "None" if the user has no badges.
 */
export function resolveBadges(user: User, member?: GuildMember | null): string {
    const zahraBadges: string[] = [];
    const nitroBadges: string[] = [];

    if (member?.premiumSince) {
        nitroBadges.push("<:nitro:1475978769347903508> Discord Nitro");
    }

    if (user.id === BOT_OWNER_ID) {
        zahraBadges.push("<:round:1475949812787580999> Zahra Bot Owner");
    }

    if (BOT_DEVELOPER_IDS.includes(user.id)) {
        zahraBadges.push("<:round:1475949812787580999> Zahra Developer");
    }

    if (user.id === ZAHRA_ID) {
        zahraBadges.push("<:round:1475949812787580999> Zahra");
    }

    if (BOT_IDS.includes(user.id)) {
        zahraBadges.push("<:butterfly:1475950160302571581> Doughmination Bot");
    }

    if (GIRLS_BOTS.includes(user.id) || GIRLS_MODS.includes(user.id)) {
        zahraBadges.push("<:girls:1475950689158041600> Girls Network");
    }

    const discordBadges = (user.flags?.toArray() ?? [])
        .filter((f) => f in discordBadgeMap)
        .map((f) => discordBadgeMap[f as keyof typeof discordBadgeMap]);

    return [...zahraBadges, ...nitroBadges, ...discordBadges].join("\n") || "None";
}