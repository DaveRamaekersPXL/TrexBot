const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Maak een poll')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('poll_modal')
      .setTitle('📊 Nieuwe Poll');

    const vraagInput = new TextInputBuilder()
      .setCustomId('poll_vraag')
      .setLabel('Vraag')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('Welke game spelen we volgende stream?');

    const optiesInput = new TextInputBuilder()
      .setCustomId('poll_opties')
      .setLabel('Opties, gescheiden met komma')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder('GeoGuessr, ETS2, Assetto Corsa');

    modal.addComponents(
      new ActionRowBuilder().addComponents(vraagInput),
      new ActionRowBuilder().addComponents(optiesInput)
    );

    await interaction.showModal(modal);
  }
};