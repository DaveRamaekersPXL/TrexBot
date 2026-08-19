const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const dataPath = path.join(__dirname, '../../data/alerts.json');

function loadData() {
  if (!fs.existsSync(dataPath)) {
    return {
      lastYouTubeVideoId: '',
      lastYouTubeTitle: '',
      lastTwitchStreamId: ''
    };
  }

  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    return {
      lastYouTubeVideoId: '',
      lastYouTubeTitle: '',
      lastTwitchStreamId: ''
    };
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube-status')
    .setDescription('Toont de laatste YouTube state die de bot heeft opgeslagen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const saved = loadData();
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`;

      const response = await axios.get(feedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'TrexBot/1.0'
        }
      });

      const parser = new XMLParser();
      const data = parser.parse(response.data);
      const entry = data?.feed?.entry;
      const latest = Array.isArray(entry) ? entry[0] : entry;

      const liveVideoId = latest?.['yt:videoId'] || 'onbekend';
      const liveTitle = latest?.title || 'onbekend';
      const savedVideoId = saved.lastYouTubeVideoId || 'geen';
      const savedTitle = saved.lastYouTubeTitle || 'geen';
      const isSynced = liveVideoId === savedVideoId;

      const embed = new EmbedBuilder()
        .setColor(isSynced ? '#2ecc71' : '#f39c12')
        .setTitle('📹 YouTube status')
        .addFields(
          { name: 'Opgeslagen video ID', value: String(savedVideoId), inline: false },
          { name: 'Opgeslagen titel', value: String(savedTitle), inline: false },
          { name: 'Live feed video ID', value: String(liveVideoId), inline: false },
          { name: 'Live feed titel', value: String(liveTitle), inline: false },
          {
            name: 'Status',
            value: isSynced
              ? '✅ Synced. De bot is klaar voor nieuwe uploads.'
              : '⚠️ Niet synced. De bot staat nog achter op de oude state.',
            inline: false
          }
        )
        .setFooter({ text: 'TrexBot' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('YouTube status command error:', error.message);
      await interaction.editReply({
        content: '❌ Ik kon de YouTube-feed niet ophalen. Controleer de bot-log of het kanaal-ID en de netwerkconnectie.'
      });
    }
  }
};
