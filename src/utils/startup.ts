// Copyright (c) 2026 Girls Network
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
import type { Command } from "./types";

// ── Import commands ──────────────────────────────────────────────────────────
import { command as banCmd }  from "../commands/ban";
import { command as kickCmd } from "../commands/kick";
import { command as warnCmd } from "../commands/warn";
import { command as muteCmd } from "../commands/mute";
import { command as caseCmd } from "../commands/case";

const ALL_COMMANDS: Command[] = [banCmd, kickCmd, warnCmd, muteCmd, caseCmd];

// ── Helpers ──────────────────────────────────────────────────────────────────

const token = process.env.BOT_TOKEN;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default async function startup() {
  if (!token) {
    console.error(chalk.red("❌ BOT_TOKEN missing in .env"));
    process.exit(1);
  }

  console.log(
    chalk.bgBlack.greenBright.bold(`
╔════════════════════════════════════════════════════════════╗
║ Zahra - Feature Rich Discord Bot - Open Source and Free    ║
║ Forever                                                    ║
╚════════════════════════════════════════════════════════════╝
`)
  );

  // Boot animation
  const bootStates = ["Booting.", "Booting..", "Booting...", "Booting...."];
  let bootIndex = 0;
  const bootAnimation = setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(chalk.bgBlack.greenBright(`🚀 ${bootStates[bootIndex]}`));
    bootIndex = (bootIndex + 1) % bootStates.length;
  }, 400);

  // Init database
  try {
    await initDb();
  } catch (err) {
    clearInterval(bootAnimation);
    console.error(chalk.red("❌ Database initialisation failed:"), err);
    process.exit(1);
  }

  // Build command map
  const commands = new Collection<string, Command>();
  for (const cmd of ALL_COMMANDS) {
    commands.set(cmd.data.name, cmd);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // ── Ready ──────────────────────────────────────────────────────────────────
  client.once(Events.ClientReady, async () => {
    clearInterval(bootAnimation);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const user = client.user;
    if (!user) return;

    const guildCount = client.guilds.cache.size;

    await user.setPresence({
      activities: [{ name: `🏰 Serving ${guildCount} servers`, type: 4 }],
      status: "online",
    });

    console.log(
      chalk.bgBlack.greenBright.bold(`✔ Logged in as ${user.tag} (${user.id})`)
    );
    console.log(
      chalk.greenBright(`✔ Loaded ${commands.size} command(s): ${[...commands.keys()].join(", ")}`)
    );
  });

  // ── Interaction handler ────────────────────────────────────────────────────
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = commands.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.execute(interaction as ChatInputCommandInteraction, client);
    } catch (err) {
      console.error(chalk.red(`❌ Error in /${interaction.commandName}:`), err);

      const msg = "❌ An unexpected error occurred. Please try again later.";
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => void 0);
      } else {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => void 0);
      }
    }
  });

  // ── Shutdown ───────────────────────────────────────────────────────────────
  async function shutdown() {
    console.log(chalk.yellow("🛑 Shutting down..."));

    if (client.user) {
      await client.user.setPresence({
        activities: [{ name: "🛑 Shutting down, please wait", type: 4 }],
        status: "dnd",
      });
    }

    await sleep(5_000);
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(chalk.greenBright("⏳ Booting in 10 seconds..."));
  await sleep(10_000);
  await client.login(token);
}