const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const channels = require('../config/channels');
const assets = require('../config/assets');

let bunkerPanelMessage = null;

async function createBunkerPanel(client) {

    try {

        const channel = await client.channels.fetch(
            channels.VERWALTUNG
        );

        if (!channel) {
            console.error('❌ Verwaltung-Channel nicht gefunden!');
            return;
        }

        // ==================================================
        // EMBED
        // ==================================================

        const embed = new EmbedBuilder()

            .setAuthor({
                name: 'Gaming Bunker',
                iconURL: assets.GAMINGBUNKER_LOGO
            })

            // Logo oben rechts
            .setThumbnail(
                assets.GAMINGBUNKER_LOGO
            )

            .setTitle('BUNKER PANEL')

            .setDescription(
                'Willkommen im **GamingBunker**.\n\n' +
                'Über die Buttons kannst du die verschiedenen ' +
                'Bereiche des Bunkers verwalten.'
            )

            // GamingBunker Blau/Lila
            .setColor(0x6F42C1)

            // Banner
            .setImage(
                assets.GAMINGBUNKER_BANNER
            )

            // Footer
            .setFooter({
                text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',
                iconURL: assets.GAMINGBUNKER_LOGO
            });

        // ==================================================
        // BUTTONS
        // ==================================================

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('bunker_announcement')
                    .setLabel('Ankündigung')
                    .setEmoji('📢')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('bunker_shop')
                    .setLabel('Shop')
                    .setEmoji('🛍️')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('bunker_orders')
                    .setLabel('Bestellungen')
                    .setEmoji('📦')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('bunker_giveaways')
                    .setLabel('Giveaways')
                    .setEmoji('🎁')
                    .setStyle(ButtonStyle.Primary)
            );

        // ==================================================
        // ALTES PANEL SUCHEN
        // ==================================================

        const messages = await channel.messages.fetch({
            limit: 20
        });

        const existingMessage = messages.find(
            message =>
                message.author.id === client.user.id &&
                message.embeds.length > 0 &&
                message.embeds[0].title === 'BUNKER PANEL'
        );

        // ==================================================
        // VORHANDENES PANEL AKTUALISIEREN
        // ==================================================

        if (existingMessage) {

            bunkerPanelMessage = existingMessage;

            await bunkerPanelMessage.edit({
                embeds: [embed],
                components: [row]
            });

            console.log(
                '♻️ BUNKER PANEL aktualisiert.'
            );

            return;
        }

        // ==================================================
        // NEUES PANEL
        // ==================================================

        bunkerPanelMessage = await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log(
            '✅ BUNKER PANEL erstellt.'
        );

    } catch (error) {

        console.error(
            '❌ Fehler beim BUNKER PANEL:',
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
            '🏠 BUNKER PANEL System gestartet.'
        );

        await createBunkerPanel(client);

    });

};
