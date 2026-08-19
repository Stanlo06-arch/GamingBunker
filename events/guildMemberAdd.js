const {
    EmbedBuilder
} = require('discord.js');

const channels = require('../config/channels');

module.exports = (client) => {

    client.on('guildMemberAdd', async (member) => {

        try {

            const channel = member.guild.channels.cache.get(
                channels.BEGRUESSUNG
            );

            if (!channel) {
                console.log('❌ Begrüßung-Channel nicht gefunden.');
                return;
            }

            const embed = new EmbedBuilder()

                // Oben links
                .setAuthor({
                    name: 'Gaming Bunker',
                    iconURL: member.guild.iconURL({
                        extension: 'png',
                        size: 128
                    }) || undefined
                })

                // User-Avatar oben rechts
                .setThumbnail(
                    member.user.displayAvatarURL({
                        extension: 'png',
                        size: 256
                    })
                )

                // Begrüßung
                .setTitle('Willkommen auf GamingBunker')

                .setDescription(
                    `Willkommen ${member} 👋\n\n` +
                    `Schön, dass du den Weg zu uns gefunden hast! 💜\n` +
                    `Mach es dir gemütlich, lern die Community kennen ` +
                    `und hab viel Spaß bei GamingBunker! 🎮`
                )

                // GamingBunker-Farbe
                .setColor(0x6F42C1)

                // Footer
                .setFooter({
                    text: 'Hostet by 𝓘𝓽𝓼  𝓢𝓽𝓪𝓷𝔃𝔂 ♕'
                })

                .setTimestamp();

            await channel.send({
                embeds: [embed]
            });

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
