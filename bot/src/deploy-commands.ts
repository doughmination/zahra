// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

/**
 * deploy-commands.ts
 *
 * Registers all slash commands with Discord.
 * Run with:  npx dotenvx run -- npx ts-node src/deploy-commands.ts
 *
 * Pass --guild <GUILD_ID> for guild-scoped (instant) registration.
 * Omit --guild for global (up to 1hr propagation).
 */

import { REST, Routes } from "discord.js";
import chalk from "chalk";

import { command as banCmd }        from "./commands/ban";
import { command as kickCmd }       from "./commands/kick";
import { command as warnCmd }       from "./commands/warn";
import { command as muteCmd }       from "./commands/mute";
import { command as caseCmd }       from "./commands/case";
import { command as pardonCmd }     from "./commands/pardon";
import { command as serverinfoCmd } from "./commands/serverinfo";
import { command as userinfoCmd }   from "./commands/userinfo";
import { command as purgeCmd }      from "./commands/purge";
import { command as dashCmd }       from "./commands/dash";
import { command as supportCmd }    from "./commands/support";
import { command as linkCmd }  from "./commands/link";
import { command as adminCmd } from "./commands/admin";

const ALL_COMMANDS = [
  banCmd,
  kickCmd,
  warnCmd,
  muteCmd,
  caseCmd,
  pardonCmd,
  serverinfoCmd,
  userinfoCmd,
  purgeCmd,
  dashCmd,
  supportCmd,
  linkCmd,
  adminCmd,
];

const token    = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  console.error(chalk.red("❌ BOT_TOKEN or CLIENT_ID missing in .env"));
  process.exit(1);
}

const args           = process.argv.slice(2);
const guildFlagIndex = args.indexOf("--guild");
const guildId        = guildFlagIndex !== -1 ? args[guildFlagIndex + 1] : null;

const rest = new REST({ version: "10" }).setToken(token);
const body = ALL_COMMANDS.map((c) => c.data.toJSON());

(async () => {
  try {
    console.log(chalk.cyan(`🔄 Registering ${body.length} command(s)...`));

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
      console.log(chalk.greenBright(`✔ Commands registered to guild ${guildId} (instant)`));
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body });
      console.log(chalk.greenBright("✔ Commands registered globally (up to 1h to propagate)"));
    }
  } catch (err) {
    console.error(chalk.red("❌ Failed to register commands:"), err);
    process.exit(1);
  }
})();