require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('Create a Discord event from a Partiful event link')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The Partiful event link to scrape')
                .setRequired(true))
        .setDefaultMemberPermissions('0') // Requires administrator permissions
        .toJSON()
];

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`🚀 Started refreshing ${commands.length} application (/) commands.`);

        // Register commands to the specific guild
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands for guild ${process.env.GUILD_ID}.`);
        console.log('Commands deployed:');
        data.forEach(command => {
            console.log(`  - /${command.name}: ${command.description}`);
        });

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
