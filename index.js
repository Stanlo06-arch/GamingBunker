require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.User,
        Partials.GuildMember
    ]
});

// Events
const ready = require('./events/ready');
const guildMemberAdd = require('./events/guildMemberAdd');

ready(client);
guildMemberAdd(client);

client.login(process.env.TOKEN);
