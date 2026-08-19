const { EmbedBuilder } = require('discord.js');

const channels = require('../config/channels');
const assets = require('../config/assets');

let statusMessage = null;

// ======================================================
// UPTIME
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

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    parts.push(`${seconds}s`);

    return parts.join(' ');
}

// ======================================================
// STATUS
// ======================================================

function getStatus(ping) {

    if (ping < 150) {
        return {
            emoji: '🟢',
            text: 'Online'
        };
    }

    if (ping < 300) {
        return {
            emoji: '🟡',
            text: 'Hohe Latenz'
        };
    }

    return {
        emoji: '🔴',
        text: 'Fehler'
    };
}

// ======================================================
// PANEL
// ======================================================

async function updateBotStatus(client) {

    try {

        const channel = await client.channels.fetch(
            channels.LOGS
        );

        if (!channel) {
            console.error('❌ Logs-Channel nicht gefunden!');
            return;
        }

        const ping = Math.max(
            0,
            Math.round(client.ws.ping)
        );

        const serverCount = client.guilds.cache.size;
        const uptime = formatUptime();
        const status = getStatus(ping);

        const embed = new EmbedBuilder()

            // ==========================================
            // OBEN LINKS
            // ==========================================

            .setAuthor({
                name: 'Gaming Bunker',
                iconURL: assets.GAMINGBUNKER_LOGO
            })

            // ==========================================
            // OBEN RECHTS
            // ==========================================

            .setThumbnail(
                assets.GAMINGBUNKER_LOGO
            )

            // ==========================================
            // TITEL
            // ==========================================

            .setTitle('SERVER LOGS')

            // ==========================================
            // BOT STATUS - NUR EINMAL
            // ==========================================

            .addFields({
                name: 'BOT STATUS',
                value: `${status.emoji} \`${status.text}\``,
                inline: false
            })

            // ==========================================
            // INFOS
            // ==========================================

            .addFields(
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
                    inline: true
                }
            )

            // ==========================================
            // GAMINGBUNKER BLAU/LILA
            // ==========================================

            .setColor(0x6F42C1)

            // ==========================================
            // BANNER
            // ==========================================

            .setImage(
                assets.GAMINGBUNKER_BANNER
            )

            // ==========================================
            // FOOTER
            // ==========================================

            .setFooter({
                text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',
                iconURL: assets.GAMINGBUNKER_LOGO
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
        // ALTE STATUS-NACHRICHT SUCHEN
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
                '♻️ SERVER LOGS Panel aktualisiert.'
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

        await updateBotStatus(client);

        setInterval(() => {
            updateBotStatus(client);
        }, 60 * 1000);

    });

};
