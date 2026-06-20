const fs = require('fs');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '.gitingore', '.env')
});

const {
    REST,
    Routes
} = require('discord.js');

const commands = [];

const commandsPath =
    path.join(__dirname, 'src', 'commands');

const commandFiles =
    fs.readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const command =
        require(path.join(commandsPath, file));

    commands.push(
        command.data.toJSON()
    );

}

const rest = new REST({
    version: '10'
}).setToken(
    process.env.TOKEN
);

(async () => {

    try {

        console.log(
            'Commands registreren...'
        );

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            'Commands geregistreerd!'
        );

    } catch (error) {

        console.error(error);

    }

})();