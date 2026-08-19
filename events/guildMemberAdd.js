const { EmbedBuilder } = require('discord.js');

const channels = require('../config/channels');
const assets = require('../config/assets');

module.exports = (client) => {

    console.log('✅ guildMemberAdd.js wurde geladen!');

    client.on('guildMemberAdd', async (member) => {

        try {

            // ==================================================
            // BEGRÜSSUNGS-CHANNEL
            // ==================================================

            const channel = await member.guild.channels.fetch(
                channels.BEGRUESSUNG
            );

            if (!channel) {
                console.error(
                    '❌ Begrüßungs-Channel nicht gefunden!'
                );
                return;
            }

            // ==================================================
            // USER AVATAR
            // ==================================================

            const userAvatar = member.user.displayAvatarURL({
                extension: 'png',
                size: 256
            });

            // ==================================================
            // WELCOME EMBED
            // ==================================================

            const embed = new EmbedBuilder()

                // ----------------------------------------------
                // OBEN LINKS
                // ----------------------------------------------

                .setAuthor({
                    name: 'Gaming Bunker',
                    iconURL: assets.GAMINGBUNKER_LOGO
                })

                // ----------------------------------------------
                // OBEN RECHTS
                // User-Avatar
                // ----------------------------------------------

                .setThumbnail(userAvatar)

                // ----------------------------------------------
                // TITEL
                // ----------------------------------------------

                .setTitle('Willkommen auf GamingBunker')

                // ----------------------------------------------
                // BEGRÜSSUNG
                // ----------------------------------------------

                .setDescription(
                    `Hey ${member}, 👋\n\n` +
                    `schön, dass du den Weg zu **GamingBunker** gefunden hast! 💜\n\n` +
                    `Mach es dir gemütlich, lern unsere Community kennen ` +
                    `und hab viel Spaß bei uns! 🎮`
                )

                // ----------------------------------------------
                // GAMINGBUNKER BLAU / LILA
                // ----------------------------------------------

                .setColor(0x6F42C1)

                // ----------------------------------------------
                // BANNER
                // ----------------------------------------------

                .setImage(
                    assets.GAMINGBUNKER_BANNER
                )

                // ----------------------------------------------
                // FOOTER
                // ----------------------------------------------

                .setFooter({
                    text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',
                    iconURL: assets.GAMINGBUNKER_LOGO
                })

                .setTimestamp();

            // ==================================================
            // SENDEN
            // ==================================================

            await channel.send({
                embeds: [embed]
            });

            console.log(
                `👋 ${member.user.tag} ist GamingBunker beigetreten.`
            );

        } catch (error) {

            console.error(
                '❌ Fehler beim GamingBunker-Begrüßungssystem:',
                error
            );

        }

    });

};
