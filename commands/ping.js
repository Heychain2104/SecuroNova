const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Comprueba si SecuroNova está funcionando.'),

    async execute(interaction) {
        await interaction.reply('🏓 ¡Pong! SecuroNova está funcionando.');
    }
};