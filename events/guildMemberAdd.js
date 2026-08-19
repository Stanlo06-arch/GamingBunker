module.exports = (client) => {

    client.on('guildMemberAdd', async (member) => {

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔥 NEUES MITGLIED ERKANNT!');
        console.log(`👤 User: ${member.user.tag}`);
        console.log(`🆔 User-ID: ${member.id}`);
        console.log(`🏠 Server: ${member.guild.name}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    });

};
