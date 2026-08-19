console.log('🔥🔥🔥 GAMINGBUNKER CODE WIRD AUSGEFÜHRT 🔥🔥🔥');

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

console.log('✅ CLIENT WURDE ERSTELLT');

client.once('ready', (client) => {

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎮 GAMINGBUNKER BOT');
    console.log(`✅ Eingeloggt als: ${client.user.tag}`);
    console.log(`🆔 Bot-ID: ${client.user.id}`);
    console.log('🚀 BOT IST ONLINE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

});

client.login(process.env.TOKEN)
    .then(() => {
        console.log('🔑 LOGIN WURDE GESTARTET');
    })
    .catch((error) => {
        console.error('❌ LOGIN FEHLER:', error);
    });
