const { EmbedBuilder } = require('discord.js');

const channels = require('../config/channels');
const assets = require('../config/assets');

module.exports = (client) => {

    client.on('guildMemberAdd', async (member) => {

        try {

            // ============================================
            // BEGRÜSSUNGS-CHANNEL
            // ============================================

            const channel = member.guild.channels.cache.get(
                channels.BEGRUESSUNG
            );

            if (!channel) {
                console.error(
                    '❌ Begrüßungs-Channel wurde nicht gefunden!'
                );
                return;
            }

            // ============================================
            // USER AVATAR
            // ============================================

            const userAvatar = member.user.displayAvatarURL({
                extension: 'png',
                size: 256
            });

            // ============================================
            // BEGRÜSSUNGS-EMBED
            // ============================================

            const embed = new EmbedBuilder()

                // Oben links
                .setAuthor({
                    name: 'Gaming Bunker',
                    iconURL: assets.GAMINGBUNKER_LOGO
                })

                // Oben rechts
                .setThumbnail(userAvatar)

                // Titel
                .setTitle('Willkommen auf GamingBunker')

                // Begrüßungstext
                .setDescription(
                    `Hey ${member}, 👋\n\n` +
                    `schön, dass du den Weg zu **GamingBunker** gefunden hast! 💜\n\n` +
                    `Mach es dir gemütlich, lern unsere Community kennen ` +
                    `und hab viel Spaß bei uns! 🎮`
                )

                // GamingBunker-Farbe
                .setColor(0x6F42C1)

                // Banner
                .setImage(assets.GAMINGBUNKER_BANNER)

                // Footer
                .setFooter({
                    text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕'
                })

                .setTimestamp();

            // ============================================
            // NACHRICHT SENDEN
            // ============================================

            await channel.send({
                embeds: [embed]
            });

            // ============================================
            // CONSOLE
            // ============================================

            console.log(
                `👋 ${member.user.tag} ist GamingBunker beigetreten.`
            );

        } catch (error) {

            console.error(
                '❌ Fehler beim Begrüßungssystem:',
                error
            );

        }

    });

};
