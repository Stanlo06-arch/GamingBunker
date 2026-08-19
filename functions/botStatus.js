const { EmbedBuilder } = require('discord.js');
const channels = require('../config/channels');

let statusMessage = null;

function formatUptime() {
    let seconds = Math.floor(process.uptime());

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
            console.error(
                `❌ Logs-Channel ${channels.LOGS} nicht gefunden!`
            );
            return;
        }

        const ping = Math.max(0, Math.round(client.ws.ping));
        const serverCount = client.guilds.cache.size;
        const uptime = formatUptime();

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

        // Alte Nachricht aktualisieren
        if (statusMessage) {

            try {

                await statusMessage.edit({
                    embeds: [embed]
                });

                return;

            } catch {

                statusMessage = null;

            }
        }

        // Neue Nachricht erstellen
        statusMessage = await channel.send({
            embeds: [embed]
        });

        console.log('✅ SERVER LOGS Status-Panel gesendet.');

    } catch (error) {

        console.error(
            '❌ Fehler beim SERVER LOGS Panel:',
            error
        );

    }
}

module.exports = (client) => {

    client.once('ready', async () => {

        console.log('📊 Bot-Status-System gestartet.');

        await updateBotStatus(client);

        setInterval(() => {
            updateBotStatus(client);
        }, 60 * 1000);

    });

};
