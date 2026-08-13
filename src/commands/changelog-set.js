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
    .setName('changelog-aanpassen')
    .setDescription('Schrijf de volledige changelog handmatig over.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('json')
        .setDescription('Gebruik JSON, voorbeeld: [{"version":"1.3.0","changes":["...","..."]}]')
        .setRequired(true)
    ),

  async execute(interaction) {
    const rawJson = interaction.options.getString('json');

    try {
      const parsed = JSON.parse(rawJson);

      if (!Array.isArray(parsed)) {
        throw new Error('De JSON moet een array zijn.');
      }

      for (const item of parsed) {
        if (!item || typeof item.version !== 'string' || !Array.isArray(item.changes)) {
          throw new Error('Elke changelog-item moet een version-string en een changes-array hebben.');
        }
      }

      fs.writeFileSync(changelogPath, JSON.stringify(parsed, null, 2));

      await interaction.reply({
        content: '✅ Changelog handmatig aangepast.',
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Ongeldige JSON: ${error.message}`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
