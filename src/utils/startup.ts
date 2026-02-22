import { Client, GatewayIntentBits } from "discord.js";
import chalk from "chalk";

const token = process.env.BOT_TOKEN;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  const bootStates = ["Booting.", "Booting..", "Booting...", "Booting...."];
  let bootIndex = 0;

  const bootAnimation = setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(
      chalk.bgBlack.greenBright(`🚀 ${bootStates[bootIndex]}`)
    );
    bootIndex = (bootIndex + 1) % bootStates.length;
  }, 400);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.once("clientReady", async () => {
    clearInterval(bootAnimation);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const user = client.user;
    if (!user) return;

    const guildCount = client.guilds.cache.size;

    await user.setPresence({
      activities: [
        {
          name: `🏰 Serving ${guildCount} servers`,
          type: 4
        }
      ],
      status: "online"
    });

    console.log(
      chalk.bgBlack.greenBright.bold(
        `✔ Logged in as ${user.tag} (${user.id})`
      )
    );
  });

  async function shutdown() {
    console.log(chalk.yellow("🛑 Shutting down..."));

    if (client.user) {
      await client.user.setPresence({
        activities: [
          {
            name: "🛑 Shutting down, please wait",
            type: 4
          }
        ],
        status: "dnd"
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