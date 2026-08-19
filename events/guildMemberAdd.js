module.exports = (client) => {

    console.log('✅ guildMemberAdd.js wurde geladen!');

    client.on('guildMemberAdd', async (member) => {

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔥 GUILDMEMBERADD AUSGELÖST!');
        console.log(`👤 User: ${member.user.tag}`);
        console.log(`🆔 User-ID: ${member.id}`);
        console.log(`🏠 Server: ${member.guild.name}`);
        console.log(`🆔 Server-ID: ${member.guild.id}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    });

};
