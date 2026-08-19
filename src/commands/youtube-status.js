const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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

function getYouTubeUploadsPlaylistId(channelId) {
  if (!channelId || !channelId.startsWith('UC') || channelId.length < 3) {
    return null;
  }

  return `UU${channelId.slice(2)}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube-status')
    .setDescription('Toont de laatste YouTube state die de bot heeft opgeslagen.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      if (!process.env.YOUTUBE_API_KEY || !process.env.YOUTUBE_CHANNEL_ID) {
        return interaction.editReply({
          content: '❌ YOUTUBE_API_KEY of YOUTUBE_CHANNEL_ID ontbreekt in de .env.'
        });
      }

      const uploadsPlaylistId = getYouTubeUploadsPlaylistId(process.env.YOUTUBE_CHANNEL_ID);
      if (!uploadsPlaylistId) {
        return interaction.editReply({
          content: '❌ Ongeldige YOUTUBE_CHANNEL_ID. Verwacht een kanaal-ID die met UC begint.'
        });
      }

      const saved = loadData();
      const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          playlistId: uploadsPlaylistId,
          part: 'snippet,contentDetails',
          maxResults: 1
        },
        timeout: 15000
      });

      const latest = response.data?.items?.[0];

      const liveVideoId = latest?.contentDetails?.videoId || 'onbekend';
      const liveTitle = latest?.snippet?.title || 'onbekend';
      const savedVideoId = saved.lastYouTubeVideoId || 'geen';
      const savedTitle = saved.lastYouTubeTitle || 'geen';
      const isSynced = liveVideoId === savedVideoId;

      const embed = new EmbedBuilder()
        .setColor(isSynced ? '#2ecc71' : '#f39c12')
        .setTitle('📹 YouTube status')
        .addFields(
          { name: 'Opgeslagen video ID', value: String(savedVideoId), inline: false },
          { name: 'Opgeslagen titel', value: String(savedTitle), inline: false },
          { name: 'Live API video ID', value: String(liveVideoId), inline: false },
          { name: 'Live API titel', value: String(liveTitle), inline: false },
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
        content: '❌ Ik kon de YouTube Data API niet ophalen. Controleer de bot-log, API-key en kanaal-ID.'
      });
    }
  }
};
