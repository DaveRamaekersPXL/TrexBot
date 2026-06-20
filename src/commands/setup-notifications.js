const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-notifications')
    .setDescription('Maak het notificatiepaneel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#9146FF')
      .setTitle('🔔 Meldingen')
      .setDescription(
        'Klik op een knop om meldingen aan of uit te zetten.\n\n' +
        '🔔  **Algemene aankondigingen** - Algemene updates en aankondigingen\n'+
        '📅 **Planning** - Stream planning updates\n' +
        '🔴 **Streams** - Twitch/YouTube live meldingen\n' +
        '📹 **Uploads** - Nieuwe YouTube video’s' 
      )
      .setFooter({
        text: 'TrexBot',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('stream_role')
        .setLabel('Streams')
        .setEmoji('🔴')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('upload_role')
        .setLabel('Uploads')
        .setEmoji('📹')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('planning_role')
        .setLabel('Planning')
        .setEmoji('📅')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('announcements_role')
        .setLabel('Algemene aankondigingen')
        .setEmoji('🔔')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
        content: '✅ Notificatiepaneel aangemaakt.',
      flags: MessageFlags.Ephemeral
    });

    await interaction.channel.send({
        embeds: [embed],
        components: [row]
    });
  }
};