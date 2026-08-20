require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ==================================================
// EVENTS
// ==================================================

const ready = require('./events/ready');
const guildMemberAdd = require('./events/guildMemberAdd');
const voiceStateUpdate = require('./events/voiceStateUpdate');

// ==================================================
// FUNCTIONS
// ==================================================

const botStatus = require('./functions/botStatus');
const bunkerPanel = require('./functions/bunkerPanel');

// ==================================================
// START
// ==================================================

ready(client);
guildMemberAdd(client);
voiceStateUpdate(client);

botStatus(client);
bunkerPanel(client);

// ==================================================
// LOGIN
// ==================================================

client.login(process.env.TOKEN);
