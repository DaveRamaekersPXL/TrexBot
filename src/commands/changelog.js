const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Bekijk de laatste TrexBot updates'),

  async execute(interaction) {

    const changelogPath = path.join(
      __dirname,
      '../../data/changelog.json'
    );

    const changelog = JSON.parse(
      fs.readFileSync(changelogPath, 'utf8')
    );

    const embed = new EmbedBuilder()
      .setColor('#9df505')
      .setTitle('🦖 TrexBot Changelog')
      .setDescription(
        'Hier vind je alle recente updates van TrexBot.'
      );

    for (const version of changelog) {

      embed.addFields({
        name: `📦 v${version.version}`,
        value:
          version.changes
            .map(change => `• ${change}`)
            .join('\n')
      });

    }

    embed
      .setFooter({
        text: 'TrexBot',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};