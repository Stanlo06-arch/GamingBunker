const { EmbedBuilder } = require('discord.js');

const channels = require('../config/channels');
const assets = require('../config/assets');

let statusMessage = null;

// ======================================================
// UPTIME FORMATIEREN
// ======================================================

function formatUptime() {

    let seconds = Math.floor(process.uptime());

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    parts.push(`${seconds}s`);

    return parts.join(' ');
}

// ======================================================
// STATUS BESTIMMEN
// ======================================================

function getStatus(ping) {

    if (ping < 150) {

        return {
            emoji: '🟢',
            text: 'Online',
            color: 0x57F287
        };

    }

    if (ping < 300) {

        return {
            emoji: '🟡',
            text: 'Hohe Latenz',
            color: 0xFEE75C
        };

    }

    return {
        emoji: '🔴',
        text: 'Fehler',
        color: 0xED4245
    };
}

// ======================================================
// STATUS PANEL AKTUALISIEREN
// ======================================================

async function updateBotStatus(client) {

    try {

        const channel = await client.channels.fetch(
            channels.LOGS
        );

        if (!channel) {

            console.error(
                '❌ Logs-Channel wurde nicht gefunden!'
            );

            return;
        }

        // --------------------------------------------------
        // PING
        // --------------------------------------------------

        const ping = Math.max(
            0,
            Math.round(client.ws.ping)
        );

        // --------------------------------------------------
        // STATUS
        // --------------------------------------------------

        const status = getStatus(ping);

        // --------------------------------------------------
        // SERVER
        // --------------------------------------------------

        const serverCount = client.guilds.cache.size;

        // --------------------------------------------------
        // UPTIME
        // --------------------------------------------------

        const uptime = formatUptime();

        // --------------------------------------------------
        // EMBED
        // --------------------------------------------------

        const embed = new EmbedBuilder()

            // GamingBunker Logo + Name
            .setAuthor({
                name: 'Gaming Bunker',
                iconURL: assets.GAMINGBUNKER_LOGO
            })

            // Titel
            .setTitle('SERVER LOGS')

            // Status
            .setDescription(
                '🤖 **BOT STATUS**'
            )

            // Werte
            .addFields(
                {
                    name: '🟢 Status',
                    value: `${status.emoji} \`${status.text}\``,
                    inline: true
                },
                {
                    name: '📡 Ping',
                    value: `\`${ping}ms\``,
                    inline: true
                },
                {
                    name: '🌐 Server',
                    value: `\`${serverCount}\``,
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: `\`${uptime}\``,
                    inline: false
                }
            )

            // Statusfarbe
            .setColor(status.color)

            // GamingBunker Banner
            .setImage(assets.GAMINGBUNKER_BANNER)

            // Footer
            .setFooter({
                text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕'
            })

            .setTimestamp();

        // ==================================================
        // VORHANDENE NACHRICHT AKTUALISIEREN
        // ==================================================

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

        // ==================================================
        // BEIM BOT-NEUSTART ALTE NACHRICHT SUCHEN
        // ==================================================

        const messages = await channel.messages.fetch({
            limit: 20
        });

        const existingMessage = messages.find(
            message =>
                message.author.id === client.user.id &&
                message.embeds.length > 0 &&
                message.embeds[0].title === 'SERVER LOGS'
        );

        if (existingMessage) {

            statusMessage = existingMessage;

            await statusMessage.edit({
                embeds: [embed]
            });

            console.log(
                '♻️ Vorhandenes SERVER LOGS Panel aktualisiert.'
            );

            return;
        }

        // ==================================================
        // NEUE NACHRICHT
        // ==================================================

        statusMessage = await channel.send({
            embeds: [embed]
        });

        console.log(
            '✅ SERVER LOGS Panel erstellt.'
        );

    } catch (error) {

        console.error(
            '❌ Fehler beim SERVER LOGS Panel:',
            error
        );

    }
}

// ======================================================
// START
// ======================================================

module.exports = (client) => {

    client.once('ready', async () => {

        console.log(
            '📊 SERVER LOGS Status-System gestartet.'
        );

        // Sofort aktualisieren
        await updateBotStatus(client);

        // Alle 60 Sekunden
        setInterval(() => {

            updateBotStatus(client);

        }, 60 * 1000);

    });

};
