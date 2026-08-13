const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '../../data/changelog.json');

function loadChangelog() {
  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, JSON.stringify([], null, 2));
    return [];
  }

  try {
    const raw = fs.readFileSync(changelogPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Changelog kon niet worden geladen:', error.message);
    return [];
  }
}

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
    const version = interaction.options.getString('versie');
    const newChanges = interaction.options
      .getString('wijzigingen')
      .split('|')
      .map(change => change.trim())
      .filter(Boolean);

    const changelog = loadChangelog();
    const existingIndex = changelog.findIndex(item => item.version === version);

    if (existingIndex >= 0) {
      const existing = changelog[existingIndex];
      const mergedChanges = [...new Set([...(existing.changes || []), ...newChanges])];

      changelog[existingIndex] = {
        ...existing,
        version,
        changes: mergedChanges
      };
    } else {
      changelog.unshift({
        version,
        changes: newChanges
      });
    }

    fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2));

    await interaction.reply({
      content: `✅ Changelog v${version} bijgewerkt.`,
      flags: MessageFlags.Ephemeral
    });
  }
};