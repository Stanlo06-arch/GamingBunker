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
// USER-LISTE ERSTELLEN
// ======================================================

function getAvailableUsers(guild, ticket) {

    return guild.members.cache
        .filter(member => {

            // Bot-Accounts nicht anzeigen
            if (member.user.bot) {
                return false;
            }

            // Ticket-Ersteller nicht anzeigen
            if (member.id === ticket.userId) {
                return false;
            }

            // Bereits berechtigte User nicht anzeigen
            const permissions =
                interactionPermissionCheck(member);

            return !permissions;

        })
        .sort(
            (a, b) =>
                a.user.username.localeCompare(
                    b.user.username
                )
        );

}


// ======================================================
// BERECHTIGUNG PRÜFEN
// ======================================================

function interactionPermissionCheck(member) {

    // Diese Funktion wird später über den Channel geprüft.
    // Deshalb hier zunächst false.
    return false;
}


// ======================================================
// USER AUSWAHL PANEL
// ======================================================

async function showUserSelector(
    interaction,
    page = 0
) {

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

    const guild = interaction.guild;

    // Alle normalen User
    const users = guild.members.cache
        .filter(member => {

            if (member.user.bot) {
                return false;
            }

            if (member.id === ticket.userId) {
                return false;
            }

            return true;

        })
        .sort(
            (a, b) =>
                a.user.username.localeCompare(
                    b.user.username
                )
        );

    const userArray = [...users.values()];

    const perPage = 5;

    const totalPages = Math.max(
        1,
        Math.ceil(
            userArray.length / perPage
        )
    );

    // Seite begrenzen
    if (page < 0) {
        page = 0;
    }

    if (page >= totalPages) {
        page = totalPages - 1;
    }

    const start = page * perPage;

    const pageUsers =
        userArray.slice(
            start,
            start + perPage
        );

    // ==================================================
    // USER BUTTONS
    // ==================================================

    const userRow = new ActionRowBuilder();

    for (const member of pageUsers) {

        userRow.addComponents(

            new ButtonBuilder()

                .setCustomId(
                    `ticket_user_${ticket.ticketId}_${member.id}`
                )

                .setLabel(
                    member.user.username
                        .slice(0, 80)
                )

                .setEmoji('👤')

                .setStyle(
                    ButtonStyle.Secondary
                )

        );

    }

    // ==================================================
    // NAVIGATION
    // ==================================================

    const navigationRow =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `ticket_users_prev_${ticket.ticketId}_${page}`
                    )

                    .setLabel('Zurück')

                    .setEmoji('◀️')

                    .setStyle(
                        ButtonStyle.Secondary
                    )

                    .setDisabled(
                        page === 0
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        `ticket_users_page_${ticket.ticketId}`
                    )

                    .setLabel(
                        `Seite ${page + 1} / ${totalPages}`
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    )

                    .setDisabled(true),

                new ButtonBuilder()

                    .setCustomId(
                        `ticket_users_next_${ticket.ticketId}_${page}`
                    )

                    .setLabel('Weiter')

                    .setEmoji('▶️')

                    .setStyle(
                        ButtonStyle.Secondary
                    )

                    .setDisabled(
                        page >= totalPages - 1
                    )

            );

    // ==================================================
    // PANEL
    // ==================================================

    const description =
        pageUsers.length > 0

            ? 'Wähle einen User aus, der Zugriff auf dieses Ticket bekommen soll.'
            : 'Keine weiteren User verfügbar.';

    const embed =
        new EmbedBuilder()

            .setAuthor({
                name: 'Gaming Bunker',
                iconURL: assets.GAMINGBUNKER_LOGO
            })

            .setThumbnail(
                assets.GAMINGBUNKER_LOGO
            )

            .setTitle('👤 USER HINZUFÜGEN')

            .setDescription(
                `${description}\n\n` +
                `📄 **Seite:** ${page + 1} / ${totalPages}`
            )

            .setColor(0x6F42C1)

            .setFooter({
                text:
                    'GamingBunker • User hinzufügen',
                iconURL:
                    assets.GAMINGBUNKER_LOGO
            });

    const components = [];

    if (pageUsers.length > 0) {
        components.push(userRow);
    }

    components.push(
        navigationRow
    );

    // Erste Antwort
    if (!interaction.replied && !interaction.deferred) {

        await interaction.reply({

            embeds: [embed],

            components,

            ephemeral: true

        });

    } else {

        await interaction.editReply({

            embeds: [embed],

            components

        });

    }

}


// ======================================================
// USER AUS TICKET HINZUFÜGEN
// ======================================================

async function addUserToTicket(
    interaction,
    ticketId,
    userId
) {

    const ticket =
        openTickets.get(ticketId);

    if (!ticket) {

        return interaction.reply({

            content:
                '❌ Dieses Ticket wurde nicht gefunden.',

            ephemeral: true

        });

    }

    // User holen
    let member;

    try {

        member =
            await interaction.guild.members.fetch(
                userId
            );

    } catch {

        return interaction.reply({

            content:
                '❌ Dieser User konnte nicht gefunden werden.',

            ephemeral: true

        });

    }

    // ==================================================
    // BERECHTIGUNG
    // ==================================================

    try {

        await interaction.channel.permissionOverwrites.edit(
            userId,
            {

                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true

            }
        );

    } catch (error) {

        console.error(
            '❌ Berechtigung konnte nicht gesetzt werden:',
            error
        );

        return interaction.reply({

            content:
                '❌ Der User konnte nicht zum Ticket hinzugefügt werden.',

            ephemeral: true

        });

    }

    // ==================================================
    // BESTÄTIGUNG
    // ==================================================

    await interaction.update({

        content:
            `✅ ${member} wurde zum Ticket hinzugefügt.`,

        embeds: [],

        components: []

    });

    // Nachricht im Ticket
    await interaction.channel.send({

        content:
            `👤 ${member} wurde von ${interaction.user} zum Ticket hinzugefügt.`

    });

}


// ======================================================
// TICKET ERSTELLEN
// ======================================================

async function createTicket(interaction) {

    try {

        const guild = interaction.guild;
        const member = interaction.member;

        // Prüfen ob bereits Ticket existiert
        const existingTicket =
            [...openTickets.values()]
                .find(
                    ticket =>
                        ticket.userId === member.id
                );

        if (existingTicket) {

            return interaction.reply({

                content:
                    `❌ Du hast bereits ein offenes Ticket: <#${existingTicket.channelId}>`,

                ephemeral: true

            });

        }

        const ticketId =
            generateTicketId();

        // ==================================================
        // CHANNEL ERSTELLEN
        // ==================================================

        const ticketChannel =
            await guild.channels.create({

                name:
                    `🎫・ticket-${member.user.username}`,

                type:
                    ChannelType.GuildText,

                parent:
                    TICKET_CATEGORY_ID,

                permissionOverwrites: [

                    {
                        id:
                            guild.roles.everyone.id,

                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    },

                    {
                        id:
                            member.id,

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

        openTickets.set(

            ticketId,

            {

                ticketId,

                channelId:
                    ticketChannel.id,

                userId:
                    member.id,

                createdAt:
                    Date.now()

            }

        );

        // ==================================================
        // TICKET PANEL
        // ==================================================

        await ticketChannel.send({

            content:
                `${member}`,

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
        // LOG
        // ==================================================

        const logChannel =
            await guild.channels.fetch(
                channels.TICKET_LOG
            );

        if (logChannel) {

            const logEmbed =
                new EmbedBuilder()

                    .setAuthor({
                        name:
                            'Gaming Bunker',

                        iconURL:
                            assets.GAMINGBUNKER_LOGO
                    })

                    .setThumbnail(
                        assets.GAMINGBUNKER_LOGO
                    )

                    .setTitle(
                        '🎫 TICKET ERSTELLT'
                    )

                    .setColor(
                        0x6F42C1
                    )

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

                        text:
                            'Hostet by 𝓘𝓽𝓼 𝓢𝓽𝓪𝓷𝔃𝔂 ♕',

                        iconURL:
                            assets.GAMINGBUNKER_LOGO

                    });

            const logMessage =
                await logChannel.send({

                    embeds: [
                        logEmbed
                    ]

                });

            openTickets
                .get(ticketId)
                .logMessageId =
                    logMessage.id;

        }

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

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({

                content:
                    '❌ Beim Erstellen des Tickets ist ein Fehler aufgetreten.',

                ephemeral: true

            });

        }

    }

}


// ======================================================
// TICKET SCHLIESSEN
// ======================================================

async function closeTicket(interaction) {

    try {

        const ticket =
            [...openTickets.values()]
                .find(
                    ticket =>
                        ticket.channelId ===
                        interaction.channel.id
                );

        if (!ticket) {

            return interaction.reply({

                content:
                    '❌ Dieses Ticket wurde nicht gefunden.',

                ephemeral: true

            });

        }

        // ==================================================
        // LOG AKTUALISIEREN
        // ==================================================

        const logChannel =
            await interaction.guild.channels.fetch(
                channels.TICKET_LOG
            );

        if (
            logChannel &&
            ticket.logMessageId
        ) {

            const logMessage =
                await logChannel.messages.fetch(
                    ticket.logMessageId
                );

            const updatedEmbed =
                new EmbedBuilder()

                    .setAuthor({

                        name:
                            'Gaming Bunker',

                        iconURL:
                            assets.GAMINGBUNKER_LOGO

                    })

                    .setThumbnail(
                        assets.GAMINGBUNKER_LOGO
                    )

                    .setTitle(
                        `🎫 TICKET #${ticket.ticketId}`
                    )

                    .setColor(
                        0xED4245
                    )

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

        await interaction.reply({

            content:
                '🔒 Dieses Ticket wird in **10 Sekunden** geschlossen.'

        });

        setTimeout(
            async () => {

                openTickets.delete(
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

            },

            10000

        );

    } catch (error) {

        console.error(
            '❌ Fehler beim Schließen:',
            error
        );

    }

}


// ======================================================
// START
// ======================================================

module.exports = (client) => {

    client.once(
        'ready',
        async () => {

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

                        limit:
                            20

                    });

                const existingPanel =
                    messages.find(

                        message =>

                            message.author.id ===
                            client.user.id &&

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

        }
    );


    // ==================================================
    // INTERACTIONS
    // ==================================================

    client.on(
        'interactionCreate',
        async interaction => {

            // ------------------------------------------
            // BUTTONS
            // ------------------------------------------

            if (interaction.isButton()) {

                // Ticket erstellen
                if (
                    interaction.customId ===
                    'ticket_create'
                ) {

                    return createTicket(
                        interaction
                    );

                }

                // User hinzufügen
                if (
                    interaction.customId ===
                    'ticket_add_user'
                ) {

                    return showUserSelector(
                        interaction,
                        0
                    );

                }

                // Ticket schließen
                if (
                    interaction.customId ===
                    'ticket_close'
                ) {

                    return closeTicket(
                        interaction
                    );

                }


                // --------------------------------------
                // NÄCHSTE SEITE
                // --------------------------------------

                if (
                    interaction.customId
                        .startsWith(
                            'ticket_users_next_'
                        )
                ) {

                    const parts =
                        interaction.customId
                            .split('_');

                    const ticketId =
                        parts[3];

                    const currentPage =
                        parseInt(parts[4]);

                    return showUserSelector(

                        interaction,

                        currentPage + 1

                    );

                }


                // --------------------------------------
                // VORHERIGE SEITE
                // --------------------------------------

                if (
                    interaction.customId
                        .startsWith(
                            'ticket_users_prev_'
                        )
                ) {

                    const parts =
                        interaction.customId
                            .split('_');

                    const ticketId =
                        parts[3];

                    const currentPage =
                        parseInt(parts[4]);

                    return showUserSelector(

                        interaction,

                        currentPage - 1

                    );

                }


                // --------------------------------------
                // USER AUSWÄHLEN
                // --------------------------------------

                if (
                    interaction.customId
                        .startsWith(
                            'ticket_user_'
                        )
                ) {

                    const parts =
                        interaction.customId
                            .split('_');

                    const ticketId =
                        parts[2];

                    const userId =
                        parts[3];

                    return addUserToTicket(

                        interaction,

                        ticketId,

                        userId

                    );

                }

            }

        }
    );

};
