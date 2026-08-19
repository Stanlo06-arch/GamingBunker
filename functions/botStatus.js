const {
    EmbedBuilder
} = require('discord.js');

const channels = require('../config/channels');

let statusMessage = null;

function formatUptime(seconds) {

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    parts.push(`${seconds}s`);

    return parts.join(' ');
}

async function updateBotStatus(client) {

    try {

        const channel = client.channels.cache.get(
            channels.LOGS
        );

        if (!channel) {
            console.error('❌ Logs-Channel nicht gefunden!');
            return;
        }

        const ping = Math.round(client.ws.ping);

        const serverCount = client.guilds.cache.size;

        const uptime = formatUptime(
            Math.floor(process.uptime())
        );

        const embed = new EmbedBuilder()

            .setTitle('SERVER LOGS')

            .setDescription(
                `**BOT STATUS**\n\n` +
                `Ping: \`${ping}ms\`\n` +
                `Server: \`${serverCount}\`\n` +
                `Uptime: \`${uptime}\`\n` +
                `Status: 🟢 \`Online\``
            )

            .setColor(0x57F287)

            .setTimestamp();

        // Bereits vorhandene Status-Nachricht bearbeiten
        if (statusMessage) {

            await statusMessage.edit({
                embeds: [embed]
            });

            return;
        }

        // Neue Nachricht erstellen
        statusMessage = await channel.send({
            embeds: [embed]
        });

        console.log('✅ Bot-Status-Panel erstellt.');

    } catch (error) {

        console.error(
            '❌ Fehler beim Bot-Status-Panel:',
            error
        );

    }
}

module.exports = (client) => {

    // Erste Aktualisierung
    updateBotStatus(client);

    // Alle 60 Sekunden aktualisieren
    setInterval(() => {
        updateBotStatus(client);
    }, 60 * 1000);

};
