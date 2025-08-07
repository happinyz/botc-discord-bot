# Discord Event Creator Bot

A Discord bot that automatically creates Discord Events when users type the `/createevent` slash command.

## Features

- 🎯 **Slash Command Integration**: Uses Discord's modern slash command system
- 📅 **Event Creation**: Creates scheduled Discord events with custom details
- 🔒 **Permission Control**: Requires administrator permissions to use
- ⏰ **Date/Time Parsing**: Supports flexible date and time input
- 🎨 **Rich Embeds**: Beautiful response messages with event details
- 🛡️ **Error Handling**: Comprehensive error handling and validation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env` file has been created with your bot credentials:
- `DISCORD_TOKEN`: Your bot token
- `CLIENT_ID`: Your bot's client ID
- `GUILD_ID`: Your Discord server ID

### 3. Deploy Slash Commands
Before running the bot, deploy the slash commands to your server:
```bash
npm run deploy-commands
```

### 4. Start the Bot
```bash
npm start
```

## Usage

### Creating an Event
Use the `/createevent` command with the following options:

- **name** (required): The name of your event
- **date** (required): Event date in YYYY-MM-DD format
- **time** (optional): Event time in HH:MM format (24-hour, defaults to 20:00)
- **description** (optional): Event description

### Example Commands
```
/createevent name:"Weekly Game Night" date:"2024-08-15" time:"19:30" description:"Join us for fun games!"
/createevent name:"Team Meeting" date:"2024-08-10"
```

## Bot Permissions Required

Make sure your bot has the following permissions in your Discord server:
- `Manage Events` - To create scheduled events
- `Use Slash Commands` - To register and respond to commands
- `Send Messages` - To send response messages
- `Embed Links` - To send rich embed responses

## Project Structure

```
discord-event-bot/
├── index.js              # Main bot file
├── deploy-commands.js     # Slash command deployment
├── package.json          # Project dependencies
├── .env                  # Environment variables (keep secure!)
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## Error Handling

The bot includes comprehensive error handling for:
- Invalid date formats
- Past dates
- Missing permissions
- Discord API errors
- Network issues

## Security Notes

- The `.env` file contains sensitive information and is excluded from git
- Never share your bot token publicly
- The bot requires administrator permissions to create events

## Troubleshooting

1. **Bot not responding**: Check if the bot is online and has proper permissions
2. **Command not found**: Make sure you ran `npm run deploy-commands`
3. **Permission errors**: Verify the bot has "Manage Events" permission
4. **Date errors**: Use YYYY-MM-DD format for dates

## Support

If you encounter any issues, check the console logs for detailed error messages.
