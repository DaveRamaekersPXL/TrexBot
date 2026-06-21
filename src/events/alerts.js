const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { EmbedBuilder } = require('discord.js');
const { incrementStat } = require('../utils/stats');

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/alerts.json');

function loadData() {
  if (!fs.existsSync(dataPath)) {
    return {
      lastYouTubeVideoId: '',
      lastTwitchStreamId: ''
    };
  }

  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error('Alerts data kon niet worden geladen, start met lege state:', error.message);
    return {
      lastYouTubeVideoId: '',
      lastTwitchStreamId: ''
    };
  }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

let alertData = loadData();


let twitchAccessToken = null;

async function getTwitchToken() {
  const res = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
  );

  twitchAccessToken = res.data.access_token;
}

async function checkTwitchLive(client) {
  try {
    if (!twitchAccessToken) {
      await getTwitchToken();
    }

    const res = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${process.env.TWITCH_USERNAME}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${twitchAccessToken}`
        }
      }
    );

    const stream = res.data.data[0];
    if (!stream) {
        console.log('Twitch live status: offline');
        return;
    }

    console.log(`Twitch live status: LIVE (${stream.id})`);

    if (alertData.lastTwitchStreamId === stream.id) {
        return;
    }

    const channel = await client.channels.fetch(process.env.LIVE_ALERT_CHANNEL_ID);

    const thumbnail = stream.thumbnail_url
      .replace('{width}', '1280')
      .replace('{height}', '720');

    const twitchUrl = `https://twitch.tv/${process.env.TWITCH_USERNAME}`;
    const youtubeUrl = process.env.YOUTUBE_CHANNEL_URL;

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`🔴 ${stream.user_name} is LIVE!`)
      .setURL(twitchUrl)
      .setDescription(
        `${stream.title || 'Kom gezellig kijken!'}\n\n` +
        `📺 **Twitch:** ${twitchUrl}\n` +
        `▶️ **YouTube:** ${youtubeUrl}`
      )
      .addFields(
        { name: 'Game', value: stream.game_name || 'Onbekend', inline: true }
      )
      .setImage(thumbnail)
        .setFooter({
            text: 'TrexBot',
            iconURL: client.user.displayAvatarURL()
        })
      .setTimestamp();

    await channel.send({
      content: `<@&${process.env.STREAM_ROLE_ID}>`,
      embeds: [embed]
    });
    incrementStat('streamsDetected');
    alertData.lastTwitchStreamId = stream.id;
    saveData(alertData);

  } catch (error) {
    console.error('Twitch alert error:', error.response?.data || error.message);
    twitchAccessToken = null;
  }
}

async function checkYouTubeUpload(client) {
  try {
    const feedUrl =
      `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`;

    const res = await axios.get(feedUrl);
    console.log('YouTube Channel ID:', process.env.YOUTUBE_CHANNEL_ID);

    const parser = new XMLParser();
    const data = parser.parse(res.data);
    const entry = data.feed.entry;

    if (!entry) return;

    const latest = Array.isArray(entry) ? entry[0] : entry; 
    const videoId = latest['yt:videoId'];
    console.log('Laatste YouTube video ID:', videoId);
    const title = latest.title;
   
    if (/\blive\b/i.test(title)) {
        console.log('Live/VOD overgeslagen:', title);
        alertData.lastYouTubeVideoId = videoId;
        saveData(alertData);
        return;

    }
    const description = latest["media:group"]?.["media:description"] || "";
    if (description.toLowerCase().includes('#nederlands')) {
        console.log('Short overgeslagen:', title);
        alertData.lastYouTubeVideoId = videoId;
        saveData(alertData);
        return;
    }
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    if (!alertData.lastYouTubeVideoId) {
       alertData.lastYouTubeVideoId = videoId;
       saveData(alertData);
       return;
    }

    if (videoId === alertData.lastYouTubeVideoId) return;

    const channel = await client.channels.fetch(process.env.YOUTUBE_UPLOAD_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor('#0065a8')
      .setTitle('📹 Check de nieuwe upload!')
      .setDescription(title)
      .setURL(videoUrl)
      .setImage(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
      .setFooter({
        text: 'TrexBot',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    await channel.send({
      content: `<@&${process.env.UPLOAD_ROLE_ID}>`,
      embeds: [embed]
    });
    incrementStat('uploadsDetected');

    alertData.lastYouTubeVideoId = videoId;
    saveData(alertData);

  } catch (error) {
    console.error('YouTube upload error:', error.response?.data || error.message);
  }
}

function startAlerts(client) {
  console.log('✅ Alerts systeem gestart');

  checkTwitchLive(client);
  checkYouTubeUpload(client);

  setInterval(() => {
    console.log('🔍 Twitch check uitgevoerd');
    checkTwitchLive(client);
  }, 60 * 1000);

  setInterval(() => {
    console.log('🔍 YouTube upload check uitgevoerd');
    checkYouTubeUpload(client);
  },  2 * 60 * 1000);
}

module.exports = { startAlerts };