const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

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

function formatDate(date) {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function chunkLines(lines, maxLength = 3500) {
  const chunks = [];
  let currentChunk = '';

  for (const line of lines) {
    const nextChunk = currentChunk ? `${currentChunk}\n${line}` : line;

    if (nextChunk.length > maxLength && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = line;
      continue;
    }

    currentChunk = nextChunk;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verjaardagen')
    .setDescription('Toon alle opgeslagen verjaardagen'),

  async execute(interaction) {
    const birthdayData = loadData();

    const entries = Object.entries(birthdayData)
      .map(([userId, entry]) => {
        const birthdate = parseBirthdate(entry.birthdate);

        if (!birthdate) {
          return null;
        }

        return {
          userId,
          name: entry.name || userId,
          birthdate,
          birthdateText: formatDate(birthdate)
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const monthDiff = a.birthdate.getUTCMonth() - b.birthdate.getUTCMonth();

        if (monthDiff !== 0) {
          return monthDiff;
        }

        return a.birthdate.getUTCDate() - b.birthdate.getUTCDate();
      });

    if (!entries.length) {
      return interaction.reply({
        content: 'Er zijn nog geen verjaardagen opgeslagen.',
      });
    }

    const lines = entries
      .map(entry => `• ${entry.name} - ${entry.birthdateText}`);
    const chunks = chunkLines(lines);
    const embeds = chunks.map((chunk, index) =>
      new EmbedBuilder()
        .setColor('#9146FF')
        .setTitle('🎂 Verjaardagen')
        .setDescription(chunk)
        .setFooter({
          text: `TrexBot • ${entries.length} opgeslagen verjaardag${entries.length === 1 ? '' : 'en'} • Pagina ${index + 1}/${chunks.length}`,
          iconURL: interaction.client.user.displayAvatarURL()
        })
    );

    return interaction.reply({
      embeds
    });
  }
};