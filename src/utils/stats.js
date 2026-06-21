const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '../../data/stats.json');

const defaultStats = {
  streamsDetected: 0,
  uploadsDetected: 0,
  suggestionsCreated: 0,
  pollsCreated: 0
};

function ensureStatsFile() {
  fs.mkdirSync(path.dirname(statsPath), { recursive: true });

  if (!fs.existsSync(statsPath)) {
    fs.writeFileSync(statsPath, JSON.stringify(defaultStats, null, 2));
  }
}

function getStats() {
  ensureStatsFile();

  try {
    return JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  } catch {
    return { ...defaultStats };
  }
}

function saveStats(stats) {
  fs.mkdirSync(path.dirname(statsPath), { recursive: true });
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

function incrementStat(key) {
  const stats = getStats();

  if (typeof stats[key] !== 'number') {
    stats[key] = 0;
  }

  stats[key] += 1;
  saveStats(stats);
}

module.exports = {
  getStats,
  saveStats,
  incrementStat
};