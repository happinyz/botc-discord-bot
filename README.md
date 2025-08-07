# Discord Partiful Bot

A Discord bot that automatically creates Discord Events by scraping Partiful event pages when users type the `/partiful` slash command.

## Features

- 🎯 **Slash Command Integration**: Uses Discord's modern `/partiful` slash command
- 🌐 **Partiful Integration**: Scrapes event details directly from Partiful event pages
- 📅 **Smart Event Creation**: Creates Discord events with accurate titles, descriptions, and times
- ⏰ **Flexible Time Parsing**: Handles both single times ("8:30pm") and time ranges ("3:00pm – 7:00pm")
- 👤 **Host Attribution**: Shows "Hosted by [Username]" in event descriptions
- 🎨 **Rich Embeds**: Beautiful response messages with event details and links
- 🔒 **Permission Control**: Requires administrator permissions to use
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

### Creating an Event from Partiful
Use the `/partiful` command with a Partiful event link:

- **link** (required): The Partiful event URL to scrape

### Example Commands
```
/partiful link:https://partiful.com/e/your-event-id
```

### What the Bot Does
When you provide a Partiful link, the bot will:
1. **Scrape the event title** from the page
2. **Extract event description** and prepend "Hosted by [Your Name]"
3. **Parse event times** (handles both single times and ranges)
4. **Create a Discord event** with all the scraped information
5. **Set the location** to the original Partiful link

## Bot Permissions Required

Make sure your bot has the following permissions in your Discord server:
- `Manage Events` - To create scheduled events
- `Use Slash Commands` - To register and respond to commands
- `Send Messages` - To send response messages
- `Embed Links` - To send rich embed responses

## Project Structure

```
discord-partiful-bot/
├── index.js              # Main bot file with Partiful scraping logic
├── deploy-commands.js     # Slash command deployment
├── package.json          # Project dependencies (includes axios, cheerio)
├── .env                  # Environment variables (keep secure!)
├── .gitignore           # Git ignore file
└── README.md            # This file
```

## How It Works

The bot uses web scraping to extract information from Partiful pages:
1. **HTML Parsing**: Uses Cheerio to parse the Partiful event page
2. **Title Extraction**: Finds the event name in `<h1><span>` tags
3. **Time Parsing**: Extracts time from nested `<div>` structure in `<time>` tags
4. **Description Scraping**: Gets event description from specific div hierarchy
5. **Discord Integration**: Creates events using Discord.js with scraped data

## Error Handling

The bot includes comprehensive error handling for:
- Invalid Partiful URLs
- Failed web scraping (network issues, page structure changes)
- Missing event data (title, time, description)
- Discord API errors (permissions, rate limits)
- Description length limits (truncated to 950 characters)

## Security Notes

- The `.env` file contains sensitive information and is excluded from git
- Never share your bot token publicly
- The bot requires administrator permissions to create events
- Uses proper User-Agent headers for web scraping

## Troubleshooting

1. **Bot not responding**: Check if the bot is online and has proper permissions
2. **Command not found**: Make sure you ran `npm run deploy-commands`
3. **Permission errors**: Verify the bot has "Manage Events" permission
4. **Scraping errors**: Check console logs for detailed error messages
5. **Invalid Partiful link**: Ensure the URL is a valid partiful.com event page

## Support

If you encounter any issues, check the console logs for detailed error messages.
