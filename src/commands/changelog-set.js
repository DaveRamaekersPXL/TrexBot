const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
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

function formatChangelogForEditor(changelog) {
  if (!Array.isArray(changelog) || changelog.length === 0) {
    return '1.0.0\n- Eerste wijziging';
  }

  return changelog
    .map(entry => {
      const version = entry?.version || 'onbekend';
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      return [
        `${version}`,
        ...changes.map(change => `- ${change}`)
      ].join('\n');
    })
    .join('\n\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog-aanpassen')
    .setDescription('Open de volledige changelog in een editor om deze eenvoudig aan te passen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const changelog = loadChangelog();
    const editorText = formatChangelogForEditor(changelog);

    const modal = new ModalBuilder()
      .setCustomId('changelog_edit_modal')
      .setTitle('Changelog aanpassen');

    const changelogInput = new TextInputBuilder()
      .setCustomId('changelog_text')
      .setLabel('Changelog (versie + bullet punten)')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(editorText)
      .setRequired(true)
      .setPlaceholder('1.3.0\n- item 1\n- item 2\n\n1.4.0\n- item 3');

    const actionRow = new ActionRowBuilder().addComponents(changelogInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  }
};
