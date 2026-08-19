const { ChannelType } = require('discord.js');

const channels = require('../config/channels');

// Temporäre Talk-Channels
const temporaryChannels = new Set();

module.exports = (client) => {

    client.on('voiceStateUpdate', async (oldState, newState) => {

        try {

            // ==================================================
            // NEUEN TALK ERSTELLEN
            // ==================================================

            if (
                newState.channelId === channels.TALK &&
                oldState.channelId !== channels.TALK
            ) {

                const member = newState.member;
                const createChannel = newState.channel;

                if (!member || !createChannel) return;

                const tempChannel = await newState.guild.channels.create({
                    name: `🔊・${member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: createChannel.parentId,
                    reason: `Talk-to-Create für ${member.user.tag}`
                });

                temporaryChannels.add(tempChannel.id);

                await member.voice.setChannel(tempChannel);

                console.log(
                    `🔊 Talk erstellt: ${tempChannel.name} (${tempChannel.id})`
                );
            }

            // ==================================================
            // LEERE TEMPORÄRE CHANNELS PRÜFEN
            // ==================================================

            for (const channelId of temporaryChannels) {

                const tempChannel =
                    newState.guild.channels.cache.get(channelId);

                if (!tempChannel) {
                    temporaryChannels.delete(channelId);
                    continue;
                }

                // Niemand mehr drin
                if (tempChannel.members.size === 0) {

                    console.log(
                        `🗑️ Leerer Talk wird gelöscht: ${tempChannel.name}`
                    );

                    temporaryChannels.delete(channelId);

                    await tempChannel.delete(
                        'Temporärer Talk ist leer.'
                    );
                }
            }

        } catch (error) {

            console.error(
                '❌ Fehler im Talk-to-Create-System:',
                error
            );

        }

    });

};
