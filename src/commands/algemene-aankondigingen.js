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
    .setName('algemene-aankondigingen')
    .setDescription('Post een algemene aankondiging')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('announcements_modal')
      .setTitle('📢 Algemene Aankondiging');

    const berichtInput = new TextInputBuilder()
      .setCustomId('announcements_bericht')
      .setLabel('Aankondiging bericht')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder('Typ hier je aankondiging...');

    const row = new ActionRowBuilder().addComponents(berichtInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
