module.exports = (client) => {

    client.once('ready', () => {

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎮 GamingBunker Bot');
        console.log(`✅ Eingeloggt als: ${client.user.tag}`);
        console.log(`🆔 Bot-ID: ${client.user.id}`);
        console.log('🚀 Bot ist online!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        client.user.setPresence({
            activities: [
                {
                    name: 'GamingBunker 🎮',
                    type: 3
                }
            ],
            status: 'online'
        });

    });

};
