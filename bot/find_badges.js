const { Client, GatewayIntentBits } = require('discord.js');

// 1. Paste your bot token and your user ID here
const TOKEN = 'YOUR_BOT_TOKEN_HERE';
const MY_USER_ID = '1125844710511104030'; 

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`\n✅ Connected as: ${client.user.tag}`);

    try {
        // We fetch with { force: true } to bypass any local cache
        const user = await client.users.fetch(MY_USER_ID, { force: true });
        
        // This is the raw JSON direct from the Discord API
        const rawJson = await client.rest.get(`/users/${MY_USER_ID}`);

        console.log("\n================ [ RAW DISCORD API JSON ] ================");
        console.log(JSON.stringify(rawJson, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value, 2
        ));
        console.log("========================================================\n");

        console.log("--- KEY ANALYSIS ---");
        console.log(`Public Flags: ${rawJson.public_flags ?? "None"}`);
        console.log(`Collectibles Field: ${rawJson.collectibles ? "Found!" : "Missing/Null"}`);
        console.log(`Avatar Decoration: ${rawJson.avatar_decoration_data ? "Found!" : "None"}`);

        if (!rawJson.public_flags && !rawJson.collectibles) {
            console.log("\n💡 RESULT: Discord is not sending Quest or Orbs data to the bot.");
            console.log("In 2026, these are stored in the 'Profile' object, which is hidden from Bots.");
        }

    } catch (err) {
        console.error("Failed to fetch data:", err);
    } finally {
        client.destroy();
    }
});

client.login(TOKEN);