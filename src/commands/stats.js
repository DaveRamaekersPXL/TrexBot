const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { getStats } = require('../utils/stats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Bekijk TrexBot statistieken'),

  async execute(interaction) {
    const stats = getStats();

    // Prefer Discord client uptime (ms) when available, otherwise fall back to process uptime (s).
    const uptimeMs = typeof interaction.client.uptime === 'number' && interaction.client.uptime
      ? interaction.client.uptime
      : Math.floor(process.uptime() * 1000);

    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    const embed = new EmbedBuilder()
      .setColor('#9df505')
      .setTitle('🦖 TrexBot Statistieken')
      .setDescription('Een overzicht van wat TrexBot heeft bijgehouden.')
      .addFields(
        { name: '👥 Leden', value: `${interaction.guild.memberCount}`, inline: true },
        { name: '📡 Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: '⏱️ Uptime', value: `${days}d ${hours}u ${minutes}m`, inline: true },

        { name: '🔴 Streams', value: `${stats.streamsDetected || 0}`, inline: true },
        { name: '📹 Uploads', value: `${stats.uploadsDetected || 0}`, inline: true },
        { name: '💡 Suggesties', value: `${stats.suggestionsCreated || 0}`, inline: true },
        { name: '📊 Polls', value: `${stats.pollsCreated || 0}`, inline: true }
      )
      .setFooter({
        text: 'TrexBot',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};