const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog-add')
    .setDescription('Voeg een changelog item toe')
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addStringOption(option =>
      option
        .setName('versie')
        .setDescription('Bijvoorbeeld 1.2.0')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('wijzigingen')
        .setDescription(
          'Gebruik | tussen wijzigingen'
        )
        .setRequired(true)
    ),

  async execute(interaction) {

    const version =
      interaction.options.getString('versie');

    const changes =
      interaction.options
        .getString('wijzigingen')
        .split('|')
        .map(x => x.trim());

    const changelogPath = path.join(
      __dirname,
      '../../data/changelog.json'
    );

    const changelog = JSON.parse(
      fs.readFileSync(changelogPath, 'utf8')
    );

    changelog.unshift({
      version,
      changes
    });

    fs.writeFileSync(
      changelogPath,
      JSON.stringify(changelog, null, 2)
    );

    await interaction.reply({
      content:
        `✅ Changelog v${version} toegevoegd.`,
      flags: MessageFlags.Ephemeral
    });
  }
};