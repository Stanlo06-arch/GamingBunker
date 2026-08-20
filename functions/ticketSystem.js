const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
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
// TICKET-PANEL
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

    const button = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId('ticket_create')
                .setLabel('Ticket erstellen')
                .setEmoji('🎫')
                .setStyle(ButtonStyle.Primary)

        );

    return {
        embeds: [embed],
        components: [button]
    };
}

// ======================================================
// TICKET-PANEL IM TICKET
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
// TICKET-BUTTONS
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

    const guild = interaction.guild;
    const member = interaction.member;

    // Prüfen, ob User bereits Ticket hat
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

    // Channel erstellen
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

    // Ticket speichern
    openTickets.set(ticketId, {

        ticketId,
        channelId: ticketChannel.id,
        userId: member.id,
        createdAt: Date.now()

    });

    // Ticket Embed senden
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
    // TICKET-LOG
    // ==================================================

    const logChannel = await guild.channels.fetch(
        channels.TICKET_LOG
    );

    if (logChannel) {

        const logEmbed = new EmbedBuilder()

            .setTitle('🎫 TICKET ERSTELLT')

            .setColor(0x57F287)

            .setDescription(
                `👤 **User**\n${member}\n\n` +

                `🆔 **Ticket ID**\n\`${ticketId}\`\n\n` +

                `📁 **Ticket**\n<#${ticketChannel.id}>\n\n` +

                `🕐 **Erstellt**\n` +
                `<t:${Math.floor(Date.now() / 1000)}:F>\n\n` +

                `📌 **Status**\n🟢 Offen`
            )

            .setFooter({
                text: 'GamingBunker Ticket-System',
                iconURL: assets.GAMINGBUNKER_LOGO
            });

        const logMessage = await logChannel.send({
            embeds: [logEmbed]
        });

        openTickets.get(ticketId).logMessageId =
            logMessage.id;
    }

    // Antwort
    await interaction.reply({
        content:
            `🎫 Dein Ticket wurde erstellt: <#${ticketChannel.id}>\n` +
            `🆔 Ticket-ID: \`${ticketId}\``,
        ephemeral: true
    });

}

// ======================================================
// TICKET SCHLIESSEN
// ======================================================

async function closeTicket(interaction) {

    const ticket = [...openTickets.values()]
        .find(
            ticket =>
                ticket.channelId === interaction.channel.id
        );

    if (!ticket) {

        return interaction.reply({
            content: '❌ Dieses Ticket wurde nicht gefunden.',
            ephemeral: true
        });

    }

    const logChannel = await interaction.guild.channels.fetch(
        channels.TICKET_LOG
    );

    // Log aktualisieren
    if (logChannel && ticket.logMessageId) {

        const logMessage =
            await logChannel.messages.fetch(
                ticket.logMessageId
            );

        const oldEmbed =
            logMessage.embeds[0];

        const updatedEmbed =
            EmbedBuilder.from(oldEmbed)

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
                );

        await logMessage.edit({
            embeds: [updatedEmbed]
        });
    }

    await interaction.reply({
        content:
            '🔒 Dieses Ticket wird in 10 Sekunden geschlossen.',
        ephemeral: false
    });

    setTimeout(async () => {

        openTickets.delete(ticket.ticketId);

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

}

// ======================================================
// PANEL STARTEN
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

            const panel = createTicketPanel();

            if (existingPanel) {

                await existingPanel.edit(panel);

                console.log(
                    '♻️ Ticket-Panel aktualisiert.'
                );

            } else {

                await channel.send(panel);

                console.log(
                    '✅ Ticket-Panel erstellt.'
                );

            }

        } catch (error) {

            console.error(
                '❌ Fehler beim Ticket-System:',
                error
            );

        }

    });

    // ==================================================
    // BUTTONS
    // ==================================================

    client.on('interactionCreate', async interaction => {

        if (!interaction.isButton()) return;

        if (interaction.customId === 'ticket_create') {

            await createTicket(interaction);
        }

        if (interaction.customId === 'ticket_close') {

            await closeTicket(interaction);
        }

    });

};
