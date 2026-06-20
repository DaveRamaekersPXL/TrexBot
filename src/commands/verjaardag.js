const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

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

function parseBirthdate(input) {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verjaardag')
    .setDescription('Sla je verjaardag op')
    .addStringOption(option =>
      option
        .setName('datum')
        .setDescription('Je geboortedatum in YYYY-MM-DD formaat')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('datum', true);
    const birthdate = parseBirthdate(input);

    if (!birthdate) {
      return interaction.reply({
        content: 'Gebruik een geldige datum in het formaat `YYYY-MM-DD`, bijvoorbeeld `2000-04-18`.',
        flags: MessageFlags.Ephemeral
      });
    }

    const data = loadData();

    data[interaction.user.id] = {
      birthdate: input,
      name: interaction.member?.displayName || interaction.user.username,
      lastAnnounced: data[interaction.user.id]?.lastAnnounced || ''
    };

    saveData(data);

    return interaction.reply({
      content: `✅ Je verjaardag is opgeslagen als ${input}.`,
      flags: MessageFlags.Ephemeral
    });
  }
};