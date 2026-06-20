const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Verwijder een aantal recente berichten')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(option =>
      option
        .setName('aantal')
        .setDescription('Aantal berichten om te verwijderen (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('aantal', true);

    if (!interaction.channel || !interaction.channel.isTextBased() || typeof interaction.channel.bulkDelete !== 'function') {
      return interaction.reply({
        content: 'Dit commando werkt alleen in tekstkanalen.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: 'Ik heb geen permissie om berichten te verwijderen.',
        flags: MessageFlags.Ephemeral
      });
    }

    const deletedMessages = await interaction.channel.bulkDelete(amount, true);

    return interaction.reply({
      content: `🧹 ${deletedMessages.size} bericht${deletedMessages.size === 1 ? '' : 'en'} verwijderd.`,
      flags: MessageFlags.Ephemeral
    });
  }
};
