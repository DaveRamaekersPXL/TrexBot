const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test de bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        

    async execute(interaction) {
        await interaction.reply('🏓 Pong!');
    }
};