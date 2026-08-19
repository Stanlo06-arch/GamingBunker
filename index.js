require('dotenv').config();

const {
    Client,
    GatewayIntentBits
} = require('discord.js');

// ==================================================
// CLIENT
// ==================================================

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

// ==================================================
// EVENTS STARTEN
// ==================================================

ready(client);
guildMemberAdd(client);
voiceStateUpdate(client);

// ==================================================
// FUNCTIONS STARTEN
// ==================================================

botStatus(client);

// ==================================================
// LOGIN
// ==================================================

client.login(process.env.TOKEN);
