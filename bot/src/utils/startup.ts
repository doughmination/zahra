// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import {
  Client,
  GatewayIntentBits,
  Collection,
  ChatInputCommandInteraction,
  Events,
} from "discord.js";
import chalk from "chalk";
import { initDb } from "../db/client";
import { startOAuthServer } from "../oauth/server";
import type { Command } from "./types";

// ── Command imports ───────────────────────────────────────────────────────────
import { command as banCmd }        from "../commands/ban";
import { command as kickCmd }       from "../commands/kick";
import { command as warnCmd }       from "../commands/warn";
import { command as muteCmd }       from "../commands/mute";
import { command as caseCmd }       from "../commands/case";
import { command as pardonCmd }     from "../commands/pardon";
import { command as serverinfoCmd } from "../commands/serverinfo";
import { command as userinfoCmd }   from "../commands/userinfo";
import { command as purgeCmd }      from "../commands/purge";
import { command as dashCmd }       from "../commands/dash";
import { command as supportCmd }    from "../commands/support";
import { command as linkCmd }       from "../commands/link";
import { command as adminCmd }      from "../commands/admin";

const ALL_COMMANDS: Command[] = [
  banCmd, kickCmd, warnCmd, muteCmd, caseCmd, pardonCmd,
  serverinfoCmd, userinfoCmd, purgeCmd, dashCmd, supportCmd,
  linkCmd, adminCmd,
];

const token = process.env.BOT_TOKEN;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function startup(): Promise<void> {
  if (!token) {
    console.error(chalk.red("❌ BOT_TOKEN missing in .env"));
    process.exit(1);
  }

  console.log(chalk.bgBlack.greenBright.bold(`
╔════════════════════════════════════════════════════════════╗
║ Zahra - Feature Rich Discord Bot - Open Source and Free    ║
║ Forever                                                    ║
╚════════════════════════════════════════════════════════════╝
`));

  try {
    await initDb();
  } catch (err) {
    console.error(chalk.red("❌ Database initialisation failed:"), err);
    process.exit(1);
  }

  const commands = new Collection<string, Command>();
  for (const cmd of ALL_COMMANDS) commands.set(cmd.data.name, cmd);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, async () => {
    const user       = client.user!;
    const guildCount = client.guilds.cache.size;

    await user.setPresence({
      activities: [{ name: `🏰 Serving ${guildCount} servers`, type: 4 }],
      status: "online",
    });

    console.log(chalk.greenBright.bold(`✔ Logged in as ${user.tag} (${user.id})`));
    console.log(chalk.greenBright(`✔ ${commands.size} command(s) loaded: ${[...commands.keys()].join(", ")}`));

    // Start the OAuth HTTP server now that the Discord client is ready
    // (it needs the client to assign roles and edit interactions)
    startOAuthServer(client);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const cmd = commands.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.execute(interaction as ChatInputCommandInteraction, client);
    } catch (err) {
      console.error(chalk.red(`❌ /${interaction.commandName}:`), err);
      const msg = "❌ An unexpected error occurred. Please try again later.";
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => void 0);
      } else {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => void 0);
      }
    }
  });

  process.on("SIGINT",  () => shutdown(client));
  process.on("SIGTERM", () => shutdown(client));

  console.log(chalk.greenBright("⏳ Starting in 10 seconds..."));
  await sleep(10_000);
  await client.login(token);
}

async function shutdown(client: Client): Promise<void> {
  console.log(chalk.yellow("🛑 Shutting down..."));
  try {
    await client.user?.setPresence({ status: "invisible" });
  } catch { /* best-effort */ }
  await sleep(2_000);
  process.exit(0);
}