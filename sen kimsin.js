const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('senkimsin')
    .setDescription('Bot kendini tanıtır.'),

  async execute(interaction) {
    await interaction.reply('Sa ben ARA, loglama ile falan uğraşıyom işte.');
  }
};
