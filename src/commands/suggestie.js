const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestie')
    .setDescription('Stuur een suggestie naar de community')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('suggestie_modal')
      .setTitle('💡 Nieuwe suggestie');

    const titelInput = new TextInputBuilder()
      .setCustomId('suggestie_titel')
      .setLabel('Titel')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('Korte titel van je idee');

    const berichtInput = new TextInputBuilder()
      .setCustomId('suggestie_bericht')
      .setLabel('Suggestie')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder('Leg je suggestie hier uit...');

    modal.addComponents(
      new ActionRowBuilder().addComponents(titelInput),
      new ActionRowBuilder().addComponents(berichtInput)
    );

    await interaction.showModal(modal);
  }
};