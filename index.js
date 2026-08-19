require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ==================================================
// BOT ONLINE
// ==================================================

client.once('ready', () => {

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎮 GAMINGBUNKER BOT');
    console.log(`✅ Eingeloggt als: ${client.user.tag}`);
    console.log(`🆔 Bot-ID: ${client.user.id}`);
    console.log('🚀 Bot ist online!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    client.user.setPresence({
        activities: [
            {
                name: 'GamingBunker 🎮',
                type: 3
            }
        ],
        status: 'online'
    });

});

// ==================================================
// LOGIN
// ==================================================

client.login(process.env.TOKEN);
