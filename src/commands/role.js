const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Geef of verwijder een rol')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Geef een rol aan een gebruiker')
        .addUserOption(option =>
          option
            .setName('gebruiker')
            .setDescription('De gebruiker')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName('rol')
            .setDescription('De rol')
            .setRequired(true)
        )
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Verwijder een rol van een gebruiker')
        .addUserOption(option =>
          option
            .setName('gebruiker')
            .setDescription('De gebruiker')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option
            .setName('rol')
            .setDescription('De rol')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const member = interaction.options.getMember('gebruiker');
    const role = interaction.options.getRole('rol');

    if (!member) {
      return interaction.reply({
        content: 'Ik kan deze gebruiker niet vinden.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: 'Ik heb geen permissie om rollen te beheren.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: 'Ik kan deze rol niet beheren. Zet mijn botrol hoger dan deze rol.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (subcommand === 'add') {
      await member.roles.add(role);

      return interaction.reply({
        content: `✅ ${role} gegeven aan ${member}.`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (subcommand === 'remove') {
      await member.roles.remove(role);

      return interaction.reply({
        content: `✅ ${role} verwijderd van ${member}.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};