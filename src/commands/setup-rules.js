const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-rules')
    .setDescription('Plaats het regelsbericht')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const rulesText =
      '## **Welkom bij de Deytrex Discord!**\n\n' +
      ' ### Om het hier een gezellige plek te houden, hebben we een aantal regels: ###\n\n' +
      ' - Heb respect voor elkaar\n' +
      ' - Geen zelfpromotie\n' +
      ' - Geen racistische opmerkingen\n' +
      ' - Geen politieke uitlatingen\n' +
      ' - Niet spammen\n' +
      ' - Geen NSFW-content posten\n\n' +
      'Alvast bedankt voor het respecteren van deze regels en nog veel plezier in deze community!\n\n' +
      'Gebruik <#' + process.env.ROLLEN_CHANNEL_ID + '> om te kiezen welke meldingen je wilt ontvangen!\n\n' +
      '## **Disclaimer**\n' +
      'Vanaf het moment dat je onze Discord-server joint, ga je akkoord met onze regels. Indien je deze niet respecteert, zijn de moderators te allen tijde bevoegd om in te grijpen. Ga niet in discussie over genomen beslissingen. Heb je vragen of opmerkingen, dan kun je altijd contact opnemen met een moderator.';

    const embed = new EmbedBuilder()
      .setColor('#e6ff0a')
      .setTitle('📜 Regels')
      .setDescription(rulesText)
      .setFooter({
        text: 'Deytrex moderators',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    const targetChannel = process.env.REGELS_CHANNEL_ID
      ? await interaction.guild.channels.fetch(process.env.REGELS_CHANNEL_ID).catch(() => null)
      : interaction.channel;

    if (!targetChannel) {
      return interaction.reply({
        content: 'Ik kan het regelskanaal niet vinden.',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.reply({
      content: '✅ Regelsbericht geplaatst.',
      flags: MessageFlags.Ephemeral
    });

    await targetChannel.send({
      embeds: [embed]
    });
  }
};