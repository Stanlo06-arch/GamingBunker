const { ChannelType } = require('discord.js');

const channels = require('../config/channels');

// Hier werden alle temporären Talk-Channels gespeichert
const temporaryChannels = new Set();

module.exports = (client) => {

    client.on('voiceStateUpdate', async (oldState, newState) => {

        try {

            // ==========================================
            // USER BETRITT 🔊・Talk
            // ==========================================

            if (
                newState.channelId === channels.TALK &&
                oldState.channelId !== channels.TALK
            ) {

                const member = newState.member;

                if (!member) return;

                const createChannel = newState.channel;

                if (!createChannel) return;

                // ======================================
                // TEMPORÄREN CHANNEL ERSTELLEN
                // ======================================

                const tempChannel = await newState.guild.channels.create({
                    name: `🔊・${member.user.username}`,
                    type: ChannelType.GuildVoice,

                    // Genau dieselbe Kategorie wie 🔊・Talk
                    parent: createChannel.parentId,

                    reason: `Talk-to-Create für ${member.user.tag}`
                });

                // Channel als temporär markieren
                temporaryChannels.add(tempChannel.id);

                // ======================================
                // USER VERSCHIEBEN
                // ======================================

                await member.voice.setChannel(tempChannel);

                console.log(
                    `🔊 Talk erstellt: ${tempChannel.name}`
                );

                return;
            }

            // ==========================================
            // TEMPORÄREN TALK LEER?
            // ==========================================

            if (
                oldState.channel &&
                temporaryChannels.has(oldState.channelId)
            ) {

                const oldChannel = oldState.channel;

                if (oldChannel.members.size === 0) {

                    temporaryChannels.delete(
                        oldChannel.id
                    );

                    await oldChannel.delete(
                        'Temporärer Talk ist leer.'
                    );

                    console.log(
                        `🗑️ Talk gelöscht: ${oldChannel.name}`
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
