const fs = require('fs');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});
const { startAlerts } = require('./events/alerts');
const { startBirthdays } = require('./events/birthdays');
const { Client, Collection, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('clientReady', () => {
  console.log(`${client.user.tag} is online!`);
  startAlerts(client);
  startBirthdays(client);
});

client.on('guildMemberAdd', async member => {

  const channel = await member.guild.channels.fetch(
    process.env.WELCOME_CHANNEL_ID
  );

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('👋 Welkom!')
    .setDescription(
      `Welkom ${member} op de server van DeyTrex!\n\n` +
      `Lees zeker even de regels in <#${process.env.REGELS_CHANNEL_ID}> en kies welke rollen je wilt ontvangen in <#${process.env.ROLLEN_CHANNEL_ID}>.`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({
      text: 'TrexBot',
      iconURL: client.user.displayAvatarURL()
    })
    .setTimestamp();

  await channel.send({
    embeds: [embed]
  });

});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    let roleId;
    let roleName;

    if (interaction.customId === 'stream_role') {
      roleId = process.env.STREAM_ROLE_ID;
      roleName = 'Streams';
    }

    if (interaction.customId === 'upload_role') {
      roleId = process.env.UPLOAD_ROLE_ID;
      roleName = 'Uploads';
    }

    if (interaction.customId === 'planning_role') {
      roleId = process.env.PLANNING_ROLE_ID;
      roleName = 'Planning';
    }

    if (interaction.customId === 'announcements_role') {
      roleId = process.env.ANNOUNCEMENTS_ROLE_ID;
      roleName = 'Algemene aankondigingen';
    }

    if (!roleId) return;

    const member = interaction.member;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);

      return interaction.reply({
        content: `❌ Je ontvangt geen **${roleName}** meldingen meer.`,
        flags: MessageFlags.Ephemeral
      });
    }

    await member.roles.add(roleId);

    return interaction.reply({
      content: `✅ Je ontvangt nu **${roleName}** meldingen.`,
      flags: MessageFlags.Ephemeral
    });
  }
  if (interaction.isModalSubmit()) {

  if (interaction.customId === 'planning_modal') {

    const bericht =
      interaction.fields.getTextInputValue(
        'planning_bericht'
      );

    const embed = new EmbedBuilder()
      .setColor('#9146FF')
      .setTitle('📅 Stream Planning')
      .setDescription(bericht)
      .setFooter({
        text: 'TrexBot',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      content: '✅ Planning geplaatst.',
      flags: MessageFlags.Ephemeral
    });

    await interaction.channel.send({
      content: `<@&${process.env.PLANNING_ROLE_ID}>`,
      embeds: [embed]
    });

    return;
  }

  if (interaction.customId === 'announcements_modal') {

    const bericht =
      interaction.fields.getTextInputValue(
        'announcements_bericht'
      );

    const embed = new EmbedBuilder()
      .setColor('#e6ff0a')
      .setTitle('📢 Algemene Aankondiging')
      .setDescription(bericht)
      .setFooter({
        text: 'TrexBot',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      content: '✅ Aankondiging geplaatst.',
      flags: MessageFlags.Ephemeral
    });

    await interaction.channel.send({
      content: `<@&${process.env.ANNOUNCEMENTS_ROLE_ID}>`,
      embeds: [embed]
    });

    return;
  }

  if (interaction.customId === 'everyone_modal') {

    const bericht =
      interaction.fields.getTextInputValue(
        'everyone_bericht'
      );

    const embed = new EmbedBuilder()
      .setColor('#9df505')
      .setTitle('📣 @everyone Aankondiging')
      .setDescription(bericht)
      .setFooter({
        text: 'TrexBot',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({
      content: '✅ @everyone aankondiging geplaatst.',
      flags: MessageFlags.Ephemeral
    });

    await interaction.channel.send({
      content: '@everyone',
      allowedMentions: {
        parse: ['everyone']
      },
      embeds: [embed]
    });

    return;
  }
}
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied) return;

    await interaction.reply({
      content: 'Er ging iets mis.',
      flags: MessageFlags.Ephemeral
    });
  }
});

client.login(process.env.TOKEN);
