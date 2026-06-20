const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('everyone-aankondiging')
    .setDescription('Post een aankondiging met @everyone')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('everyone_modal')
      .setTitle('📣 @everyone Aankondiging');

    const berichtInput = new TextInputBuilder()
      .setCustomId('everyone_bericht')
      .setLabel('Aankondiging bericht')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder('Typ hier je aankondiging...');

    const row = new ActionRowBuilder().addComponents(berichtInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};