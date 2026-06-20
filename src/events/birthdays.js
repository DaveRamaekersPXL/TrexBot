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

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getBirthdayKey(date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function calculateAge(birthdate, today = new Date()) {
  let age = today.getUTCFullYear() - birthdate.getUTCFullYear();
  const birthdayThisYear = new Date(Date.UTC(today.getUTCFullYear(), birthdate.getUTCMonth(), birthdate.getUTCDate()));

  if (today < birthdayThisYear) {
    age -= 1;
  }

  return age;
}

async function pruneMissingMembers(client, birthdayData) {
  const guild = client.guilds.cache.first();

  if (!guild) {
    return false;
  }

  let changed = false;

  for (const userId of Object.keys(birthdayData)) {
    const member = await guild.members.fetch(userId).catch(() => null);

    if (member) {
      continue;
    }

    delete birthdayData[userId];
    changed = true;
  }

  return changed;
}

async function checkBirthdays(client) {
  const birthdayData = loadData();
  const today = new Date();
  const todayKey = getTodayKey(today);
  const todayBirthdayKey = getBirthdayKey(today);
  const generalChannelId = process.env.ALGEMEEN_CHANNEL_ID;
  const birthdayRoleId = process.env.BIRTHDAY_ROLE_ID;

  if (!generalChannelId) {
    console.log('ALGEMEEN_CHANNEL_ID ontbreekt, verjaardagberichten worden overgeslagen.');
    return;
  }

  const channel = await client.channels.fetch(generalChannelId).catch(() => null);

  if (!channel) {
    console.log('Algemene kanaal kon niet worden gevonden, verjaardagberichten worden overgeslagen.');
    return;
  }

  let changed = false;

  changed = (await pruneMissingMembers(client, birthdayData)) || changed;

  for (const [userId, entry] of Object.entries(birthdayData)) {
    const birthdate = parseBirthdate(entry.birthdate);

    if (!birthdate) {
      continue;
    }

    if (getBirthdayKey(birthdate) !== todayBirthdayKey) {
      continue;
    }

    if (entry.lastAnnounced === todayKey) {
      continue;
    }

    const guild = client.guilds.cache.first();

    if (!guild) {
      return;
    }

    const member = await guild.members.fetch(userId).catch(() => null);
    const displayName = member?.toString() || member?.displayName || member?.user?.username || entry.name || 'iemand';
    const age = calculateAge(birthdate, today);

    if (member && birthdayRoleId && !member.roles.cache.has(birthdayRoleId)) {
      await member.roles.add(birthdayRoleId).catch(error => {
        console.error(`Birthday role kon niet worden toegevoegd aan ${userId}:`, error.message);
      });
    }

    await channel.send(`Happy birthday! ${displayName} is ${age} jaar geworden!🥳`);

    birthdayData[userId].lastAnnounced = todayKey;
    changed = true;
  }

  if (changed) {
    saveData(birthdayData);
  }
}

function startBirthdays(client) {
  console.log('✅ Birthdays systeem gestart');

  checkBirthdays(client);

  setInterval(() => {
    console.log('🔍 Birthday check uitgevoerd');
    checkBirthdays(client);
  }, 60 * 60 * 1000);
}

module.exports = { startBirthdays };