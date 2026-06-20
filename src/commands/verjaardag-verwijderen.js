const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const dataPath = path.join(__dirname, '../../data/birthdays.json');

function loadData() {
  if (!fs.existsSync(dataPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error('Birthdays data kon niet worden geladen, start met lege state:', error.message);
    return {};
  }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verjaardag-verwijderen')
    .setDescription('Verwijder je eigen opgeslagen verjaardag'),

  async execute(interaction) {
    const targetUser = interaction.user;

    const data = loadData();

    if (!data[targetUser.id]) {
      return interaction.reply({
        content: 'Er is geen verjaardag opgeslagen voor jou.',
        flags: MessageFlags.Ephemeral
      });
    }

    delete data[targetUser.id];
    saveData(data);

    return interaction.reply({
      content: '✅ Je verjaardag is verwijderd.',
      flags: MessageFlags.Ephemeral
    });
  }
};