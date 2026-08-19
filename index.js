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

// Events
const ready = require('./events/ready');
const guildMemberAdd = require('./events/guildMemberAdd');

ready(client);
guildMemberAdd(client);
botStatus(client);

// Login
client.login(process.env.TOKEN);
