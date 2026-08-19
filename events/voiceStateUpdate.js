const {
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const channels = require('../config/channels');

module.exports = (client) => {

    client.on('voiceStateUpdate', async (oldState, newState) => {

        try {

            // ==========================================
            // TALK-TO-CREATE CHANNEL
            // ==========================================

            const CREATE_CHANNEL_ID = channels.TALK;

            // ==========================================
            // USER BETRITT "🔊・Talk"
            // ==========================================

            if (
                newState.channelId === CREATE_CHANNEL_ID &&
                oldState.channelId !== CREATE_CHANNEL_ID
            ) {

                const member = newState.member;

                if (!member) return;

                // ======================================
                // TEMPORÄREN TALK ERSTELLEN
                // ======================================

                const tempChannel = await newState.guild.channels.create({
                    name: `🔊・${member.user.username}'s Talk`,
                    type: ChannelType.GuildVoice,

                    parent: newState.channel?.parentId || null,

                    permissionOverwrites: [
                        {
                            id: newState.guild.roles.everyone.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.Connect
                            ]
                        }
                    ]
                });

                // ======================================
                // USER VERSCHIEBEN
                // ======================================

                await member.voice.setChannel(tempChannel);

                console.log(
                    `🔊 Talk erstellt: ${tempChannel.name} für ${member.user.tag}`
                );

                return;
            }

            // ==========================================
            // LEEREN TEMPORÄREN TALK LÖSCHEN
            // ==========================================

            if (
                oldState.channel &&
                oldState.channelId !== CREATE_CHANNEL_ID &&
                oldState.channel.members.size === 0 &&
                oldState.channel.name.startsWith('🔊・')
            ) {

                await oldState.channel.delete(
                    'Temporärer Talk ist leer'
                );

                console.log(
                    `🗑️ Temporärer Talk gelöscht: ${oldState.channel.name}`
                );
            }

        } catch (error) {

            console.error(
                '❌ Fehler beim Talk-to-Create-System:',
                error
            );

        }

    });

};
