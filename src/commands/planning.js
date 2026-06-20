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
    .setName('planning')
    .setDescription('Post een stream planning')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('planning_modal')
      .setTitle('📅 Stream Planning');

    const berichtInput = new TextInputBuilder()
      .setCustomId('planning_bericht')
      .setLabel('Planning bericht')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder('Typ hier je planningbericht...');

    const row = new ActionRowBuilder().addComponents(berichtInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};