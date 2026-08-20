const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    UserSelectMenuBuilder,
    ChannelType,
    PermissionsBitField
} = require('discord.js');

const channels = require('../config/channels');
const assets = require('../config/assets');

const TICKET_CATEGORY_ID = '1540114068436680794';

const openTickets = new Map();
const usedTicketIds = new Set();

// ======================================================
// ZUFÄLLIGE 5-STELLIGE TICKET-ID
// ======================================================

function generateTicketId() {

    let ticketId;

    do {

        ticketId = Math.floor(
            10000 + Math.random() * 90000
        ).toString();

    } while (usedTicketIds.has(ticketId));

    usedTicketIds.add(ticketId);

    return ticketId;
}

// ======================================================
// TICKET PANEL
// ======================================================

function createTicketPanel() {

    const embed = new EmbedBuilder()

        .setAuthor({
            name: 'Gaming Bunker',
            iconURL: assets.GAMINGBUNKER_LOGO
        })

        .setThumbnail(
            assets.GAMINGBUNKER_LOGO
        )

        .setTitle('🎫 GAMINGBUNKER SUPPORT')

        .setDescription(
            'Du benötigst Hilfe oder hast ein Anliegen?\n\n' +
            'Erstelle ein Ticket und unser Support-Team ' +
            'kümmert sich schnellstmöglich um dein Anliegen.'
        )

        .setColor(0x6F42C1)

        .setImage(
            assets.GAMINGBUNKER_BANNER
        )

        .setFooter({
            text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',
            iconURL: assets.GAMINGBUNKER_LOGO
        });

    const row = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId('ticket_create')
                .setLabel('Ticket erstellen')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)

        );

    return {
        embeds: [embed],
        components: [row]
    };
}

// ======================================================
// TICKET EMBED
// ======================================================

function createTicketEmbed(ticketId, member) {

    return new EmbedBuilder()

        .setAuthor({
            name: 'Gaming Bunker',
            iconURL: assets.GAMINGBUNKER_LOGO
        })

        .setThumbnail(
            assets.GAMINGBUNKER_LOGO
        )

        .setTitle('🎫 GAMINGBUNKER SUPPORT')

        .setDescription(
            'Willkommen im **GamingBunker Support**!\n\n' +
            'Beschreibe dein Anliegen möglichst genau. ' +
            'Ein Teammitglied wird sich schnellstmöglich um dich kümmern.\n\n' +

            `🆔 **Ticket-ID:** \`${ticketId}\`\n` +
            `👤 **Erstellt von:** ${member}\n` +
            `📌 **Status:** 🟢 Offen`
        )

        .setColor(0x6F42C1)

        .setImage(
            assets.GAMINGBUNKER_BANNER
        )

        .setFooter({
            text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',
            iconURL: assets.GAMINGBUNKER_LOGO
        });
}

// ======================================================
// TICKET BUTTONS
// ======================================================

function createTicketButtons() {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Ticket schließen')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('ticket_add_user')
                .setLabel('User hinzufügen')
                .setEmoji('👤')
                .setStyle(ButtonStyle.Secondary)

        );
}

// ======================================================
// TICKET ERSTELLEN
// ======================================================

async function createTicket(interaction) {

    try {

        const guild = interaction.guild;
        const member = interaction.member;

        // Prüfen, ob bereits ein Ticket existiert
        const existingTicket = [...openTickets.values()]
            .find(ticket => ticket.userId === member.id);

        if (existingTicket) {

            return interaction.reply({
                content:
                    `❌ Du hast bereits ein offenes Ticket: <#${existingTicket.channelId}>`,
                ephemeral: true
            });

        }

        const ticketId = generateTicketId();

        // ==================================================
        // TICKET CHANNEL ERSTELLEN
        // ==================================================

        const ticketChannel = await guild.channels.create({

            name: `🎫・ticket-${member.user.username}`,

            type: ChannelType.GuildText,

            parent: TICKET_CATEGORY_ID,

            permissionOverwrites: [

                {
                    id: guild.roles.everyone.id,

                    deny: [
                        PermissionsBitField.Flags.ViewChannel
                    ]
                },

                {
                    id: member.id,

                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }

            ]

        });

        // ==================================================
        // TICKET SPEICHERN
        // ==================================================

        openTickets.set(ticketId, {

            ticketId,
            channelId: ticketChannel.id,
            userId: member.id,
            createdAt: Date.now()

        });

        // ==================================================
        // TICKET PANEL SENDEN
        // ==================================================

        await ticketChannel.send({

            content: `${member}`,

            embeds: [
                createTicketEmbed(
                    ticketId,
                    member
                )
            ],

            components: [
                createTicketButtons()
            ]

        });

        // ==================================================
        // TICKET LOG
        // ==================================================

        const logChannel = await guild.channels.fetch(
            channels.TICKET_LOG
        );

        if (logChannel) {

            const logEmbed = new EmbedBuilder()

                .setAuthor({
                    name: 'Gaming Bunker',
                    iconURL: assets.GAMINGBUNKER_LOGO
                })

                .setThumbnail(
                    assets.GAMINGBUNKER_LOGO
                )

                .setTitle('🎫 TICKET ERSTELLT')

                .setColor(0x6F42C1)

                .setDescription(
                    `👤 **User**\n` +
                    `${member}\n\n` +

                    `🆔 **Ticket ID**\n` +
                    `\`${ticketId}\`\n\n` +

                    `📁 **Ticket**\n` +
                    `<#${ticketChannel.id}>\n\n` +

                    `🕐 **Erstellt**\n` +
                    `<t:${Math.floor(Date.now() / 1000)}:F>\n\n` +

                    `📌 **Status**\n` +
                    `🟢 Offen`
                )

                .setImage(
                    assets.GAMINGBUNKER_BANNER
                )

                .setFooter({
                    text: 'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',
                    iconURL: assets.GAMINGBUNKER_LOGO
                });

            const logMessage = await logChannel.send({
                embeds: [logEmbed]
            });

            openTickets.get(ticketId).logMessageId =
                logMessage.id;
        }

        // ==================================================
        // ANTWORT
        // ==================================================

        await interaction.reply({

            content:
                `🎫 Dein Ticket wurde erstellt: <#${ticketChannel.id}>\n` +
                `🆔 Ticket-ID: \`${ticketId}\``,

            ephemeral: true

        });

    } catch (error) {

        console.error(
            '❌ Fehler beim Erstellen des Tickets:',
            error
        );

        if (!interaction.replied && !interaction.deferred) {

            await interaction.reply({
                content:
                    '❌ Beim Erstellen des Tickets ist ein Fehler aufgetreten.',
                ephemeral: true
            });

        }

    }

}

// ======================================================
// USER AUSWAHL ÖFFNEN
// ======================================================

async function openUserSelector(interaction) {

    const ticket = [...openTickets.values()]
        .find(
            ticket =>
                ticket.channelId === interaction.channel.id
        );

    if (!ticket) {

        return interaction.reply({
            content:
                '❌ Dieses Ticket wurde nicht gefunden.',
            ephemeral: true
        });

    }

    const select = new UserSelectMenuBuilder()

        .setCustomId(
            `ticket_select_user_${ticket.ticketId}`
        )

        .setPlaceholder(
            '👤 User auswählen'
        )

        .setMinValues(1)

        .setMaxValues(1);

    const row = new ActionRowBuilder()
        .addComponents(select);

    await interaction.reply({

        content:
            '👤 **User hinzufügen**\n\n' +
            'Wähle den User aus, der Zugriff auf dieses Ticket bekommen soll.',

        components: [row],

        ephemeral: true

    });

}

// ======================================================
// USER HINZUFÜGEN
// ======================================================

async function addUserToTicket(interaction) {

    const ticketId =
        interaction.customId.replace(
            'ticket_select_user_',
            ''
        );

    const ticket = openTickets.get(ticketId);

    if (!ticket) {

        return interaction.update({
            content:
                '❌ Dieses Ticket ist nicht mehr geöffnet.',
            components: []
        });

    }

    const userId = interaction.values[0];

    // Nicht den Ticket-Ersteller erneut hinzufügen
    if (userId === ticket.userId) {

        return interaction.update({
            content:
                '❌ Dieser User hat bereits Zugriff auf das Ticket.',
            components: []
        });

    }

    const member =
        await interaction.guild.members
            .fetch(userId);

    if (!member) {

        return interaction.update({
            content:
                '❌ User konnte nicht gefunden werden.',
            components: []
        });

    }

    // ==================================================
    // USER BERECHTIGEN
    // ==================================================

    await interaction.channel.permissionOverwrites.edit(
        userId,
        {

            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true

        }
    );

    await interaction.update({

        content:
            `✅ ${member} wurde zum Ticket hinzugefügt.`,

        components: []

    });

    // Nachricht im Ticket
    await interaction.channel.send({

        content:
            `👤 ${member} wurde von ${interaction.user} zum Ticket hinzugefügt.`

    });

}

// ======================================================
// TICKET SCHLIESSEN
// ======================================================

async function closeTicket(interaction) {

    try {

        const ticket = [...openTickets.values()]
            .find(
                ticket =>
                    ticket.channelId === interaction.channel.id
            );

        if (!ticket) {

            return interaction.reply({
                content:
                    '❌ Dieses Ticket wurde nicht gefunden.',
                ephemeral: true
            });

        }

        // ==================================================
        // LOG CHANNEL
        // ==================================================

        const logChannel =
            await interaction.guild.channels.fetch(
                channels.TICKET_LOG
            );

        if (logChannel && ticket.logMessageId) {

            const logMessage =
                await logChannel.messages.fetch(
                    ticket.logMessageId
                );

            const updatedEmbed = new EmbedBuilder()

                .setAuthor({
                    name: 'Gaming Bunker',
                    iconURL: assets.GAMINGBUNKER_LOGO
                })

                .setThumbnail(
                    assets.GAMINGBUNKER_LOGO
                )

                .setTitle(
                    `🎫 TICKET #${ticket.ticketId}`
                )

                .setColor(0xED4245)

                .setDescription(

                    `👤 **User**\n` +
                    `<@${ticket.userId}>\n\n` +

                    `🆔 **Ticket ID**\n` +
                    `\`${ticket.ticketId}\`\n\n` +

                    `📁 **Ticket**\n` +
                    `#${interaction.channel.name}\n\n` +

                    `🕐 **Erstellt**\n` +
                    `<t:${Math.floor(ticket.createdAt / 1000)}:F>\n\n` +

                    `🕐 **Geschlossen**\n` +
                    `<t:${Math.floor(Date.now() / 1000)}:F>\n\n` +

                    `👮 **Geschlossen von**\n` +
                    `${interaction.user}\n\n` +

                    `📌 **Status**\n` +
                    `🔴 Geschlossen`

                )

                .setImage(
                    assets.GAMINGBUNKER_BANNER
                )

                .setFooter({

                    text:
                        'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',

                    iconURL:
                        assets.GAMINGBUNKER_LOGO

                });

            await logMessage.edit({

                embeds: [
                    updatedEmbed
                ]

            });

        }

        // ==================================================
        // TICKET SCHLIESSEN
        // ==================================================

        await interaction.reply({

            content:
                '🔒 Dieses Ticket wird in **10 Sekunden** geschlossen.',

        });

        setTimeout(async () => {

            openTickets.delete(
                ticket.ticketId
            );

            usedTicketIds.delete(
                ticket.ticketId
            );

            try {

                await interaction.channel.delete(
                    'Ticket geschlossen'
                );

            } catch (error) {

                console.error(
                    '❌ Ticket konnte nicht gelöscht werden:',
                    error
                );

            }

        }, 10000);

    } catch (error) {

        console.error(
            '❌ Fehler beim Schließen des Tickets:',
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                content:
                    '❌ Beim Schließen des Tickets ist ein Fehler aufgetreten.',

                ephemeral: true

            });

        }

    }

}

// ======================================================
// START
// ======================================================

module.exports = (client) => {

    client.once('ready', async () => {

        try {

            const channel =
                await client.channels.fetch(
                    channels.TICKET
                );

            if (!channel) {

                console.error(
                    '❌ Ticket-Channel nicht gefunden!'
                );

                return;

            }

            const messages =
                await channel.messages.fetch({
                    limit: 20
                });

            const existingPanel =
                messages.find(

                    message =>

                        message.author.id === client.user.id &&

                        message.embeds.length > 0 &&

                        message.embeds[0].title ===
                            '🎫 GAMINGBUNKER SUPPORT'

                );

            const panel =
                createTicketPanel();

            if (existingPanel) {

                await existingPanel.edit(
                    panel
                );

                console.log(
                    '♻️ Ticket-Panel aktualisiert.'
                );

            } else {

                await channel.send(
                    panel
                );

                console.log(
                    '✅ Ticket-Panel erstellt.'
                );

            }

        } catch (error) {

            console.error(
                '❌ Fehler beim Ticket-Panel:',
                error
            );

        }

    });

    // ==================================================
    // INTERACTIONS
    // ==================================================

    client.on(
        'interactionCreate',
        async interaction => {

            if (!interaction.isButton() &&
                !interaction.isUserSelectMenu()) {
                return;
            }

            // Ticket erstellen
            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_create'
            ) {

                await createTicket(
                    interaction
                );

                return;
            }

            // User hinzufügen
            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_add_user'
            ) {

                await openUserSelector(
                    interaction
                );

                return;
            }

            // User ausgewählt
            if (
                interaction.isUserSelectMenu() &&
                interaction.customId.startsWith(
                    'ticket_select_user_'
                )
            ) {

                await addUserToTicket(
                    interaction
                );

                return;
            }

            // Ticket schließen
            if (
                interaction.isButton() &&
                interaction.customId === 'ticket_close'
            ) {

                await closeTicket(
                    interaction
                );

            }

        }
    );

};
