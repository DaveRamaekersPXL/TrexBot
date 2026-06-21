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

    // Show both client uptime (since Discord connection) and process uptime (since Node process start)
    const clientUptimeMs = typeof interaction.client.uptime === 'number' && interaction.client.uptime
      ? interaction.client.uptime
      : 0;

    const processUptimeMs = Math.floor(process.uptime() * 1000);

    function formatUptime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) return `${days}d ${hours}u ${minutes}m`;
      if (hours > 0) return `${hours}u ${minutes}m ${seconds}s`;
      if (minutes > 0) return `${minutes}m ${seconds}s`;
      return `${seconds}s`;
    }

    const embed = new EmbedBuilder()
      .setColor('#9df505')
      .setTitle('🦖 TrexBot Statistieken')
      .setDescription('Een overzicht van wat TrexBot heeft bijgehouden.')
      .addFields(
        { name: '👥 Leden', value: `${interaction.guild.memberCount}`, inline: true },
        { name: '📡 Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: '⏱️ Connected', value: `${clientUptimeMs ? formatUptime(clientUptimeMs) : '—'}`, inline: true },
        { name: '🖥️ Process', value: `${formatUptime(processUptimeMs)}`, inline: true },

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