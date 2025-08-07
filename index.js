require('dotenv').config();
const { Client, GatewayIntentBits, Events, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildScheduledEvents
    ]
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
    console.log(`✅ Ready! Logged in as ${readyClient.user.tag}`);
    console.log(`🎯 Bot is active in guild: ${process.env.GUILD_ID}`);
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'createevent') {
        await handleCreateEvent(interaction);
    }
});

async function handleCreateEvent(interaction) {
    try {
        // Defer the reply to give us more time to process
        await interaction.deferReply();

        // Get the Partiful link from the command
        const partifulLink = interaction.options.getString('link');

        // Validate that it's a Partiful link
        if (!partifulLink.includes('partiful.com')) {
            await interaction.editReply('❌ Please provide a valid Partiful event link.');
            return;
        }

        console.log(`🔍 Scraping Partiful event: ${partifulLink}`);

        // Scrape the Partiful event page
        const eventData = await scrapePartifulEvent(partifulLink);
        
        if (!eventData) {
            await interaction.editReply('❌ Failed to scrape event data from the Partiful link. Please check the link and try again.');
            return;
        }

        // Check if the date is in the future
        if (eventData.startTime <= new Date()) {
            await interaction.editReply('❌ Event date must be in the future.');
            return;
        }

        // Create the scheduled event
        const guild = interaction.guild;
        const member = await guild.members.fetch(interaction.user.id);
        const hostInfo = `Hosted by ${member.displayName}`;
        let fullDescription = `${hostInfo}\n\n${eventData.description}`;
        
        // Truncate description to prevent Discord API errors (50035)
        if (fullDescription.length > 950) {
            fullDescription = fullDescription.substring(0, 947) + '...';
        }
        
        const scheduledEvent = await guild.scheduledEvents.create({
            name: eventData.title,
            description: fullDescription,
            scheduledStartTime: eventData.startTime,
            scheduledEndTime: eventData.endTime,
            privacyLevel: 2, // GUILD_ONLY
            entityType: 3, // EXTERNAL
            entityMetadata: {
                location: partifulLink
            }
        });

        // Create success embed response
        const successEmbed = {
            color: 0x00ff00,
            title: '✅ Event Created Successfully!',
            fields: [
                {
                    name: '📅 Event Name',
                    value: eventData.title,
                    inline: true
                },
                {
                    name: '🕒 Start Time',
                    value: `<t:${Math.floor(eventData.startTime.getTime() / 1000)}:F>`,
                    inline: true
                },
                {
                    name: '🕛 End Time',
                    value: `<t:${Math.floor(eventData.endTime.getTime() / 1000)}:F>`,
                    inline: true
                },
                {
                    name: '📝 Description',
                    value: eventData.description.length > 1024 ? eventData.description.substring(0, 1021) + '...' : eventData.description,
                    inline: false
                },
                {
                    name: '🎉 Partiful Link',
                    value: `[View Original Event](${partifulLink})`,
                    inline: true
                },
                {
                    name: '🔗 Discord Event',
                    value: `[View Discord Event](https://discord.com/events/${guild.id}/${scheduledEvent.id})`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Created by ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL()
            }
        };

        await interaction.editReply({ embeds: [successEmbed] });

        console.log(`✅ Event "${eventData.title}" created by ${interaction.user.tag} in ${guild.name}`);

    } catch (error) {
        console.error('Error creating event:', error);
        
        let errorMessage = '❌ Failed to create event. ';
        
        if (error.code === 50013) {
            errorMessage += 'Bot lacks permissions to create events.';
        } else if (error.code === 50035) {
            errorMessage += 'Invalid event data provided.';
        } else if (error.message && error.message.includes('Request failed')) {
            errorMessage += 'Could not access the Partiful link. Please check the URL.';
        } else {
            errorMessage += 'Please try again later.';
        }

        await interaction.editReply(errorMessage);
    }
}

async function scrapePartifulEvent(url) {
    try {
        console.log(`🌐 Fetching Partiful page: ${url}`);
        
        // Fetch the HTML content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (response.status !== 200) {
            console.error(`❌ HTTP ${response.status} when fetching ${url}`);
            return null;
        }
        
        // Parse the HTML
        const $ = cheerio.load(response.data);
        
        // Extract the event title from <h1><span>
        const titleElement = $('h1 span').first();
        const title = titleElement.text().trim();
        
        if (!title) {
            console.error('❌ Could not find event title in <h1><span>');
            return null;
        }
        
        console.log(`📅 Found event title: "${title}"`);
        
        // Extract the time from nested div structure in the first <time> tag
        const timeElement = $('time').first();
        
        if (timeElement.length === 0) {
            console.error('❌ Could not find <time> tag');
            return null;
        }
        
        // Navigate: <time> -> first child <div> -> first child <div> -> second child <div>
        const firstDiv = timeElement.children('div').first();
        if (firstDiv.length === 0) {
            console.error('❌ Could not find first child <div> in <time> tag');
            return null;
        }
        
        const secondDiv = firstDiv.children('div').first();
        if (secondDiv.length === 0) {
            console.error('❌ Could not find first child <div> in first div');
            return null;
        }
        
        const timeDiv = secondDiv.children('div').eq(1); // Second child (index 1)
        if (timeDiv.length === 0) {
            console.error('❌ Could not find second child <div> containing time');
            return null;
        }
        
        const timeText = timeDiv.text().trim();
        if (!timeText) {
            console.error('❌ Could not find time text in nested div structure');
            return null;
        }
        
        console.log(`🕒 Found time text: "${timeText}"`);
        
        // Parse the time text and get date from datetime attribute as fallback for date info
        const datetimeAttr = timeElement.attr('datetime');
        let baseDate;
        
        if (datetimeAttr) {
            baseDate = new Date(datetimeAttr);
            console.log(`📅 Using base date from datetime attribute: ${baseDate.toDateString()}`);
        } else {
            console.error('❌ Could not find datetime attribute for base date');
            return null;
        }
        
        const timeInfo = parseTimeText(timeText, baseDate);
        if (!timeInfo) {
            console.error(`❌ Could not parse time text: "${timeText}"`);
            return null;
        }
        
        // Extract the event description
        // Find the first <div> that's a sibling of the first <h1>
        const h1Element = $('h1').first();
        const siblingDiv = h1Element.siblings('div').first();
        
        let description = 'No description available';
        
        if (siblingDiv.length > 0) {
            // Get the last child div of this sibling div
            const lastChildDiv = siblingDiv.children('div').last();
            
            if (lastChildDiv.length > 0) {
                // Find the span tag within this div
                const descriptionSpan = lastChildDiv.find('span').first();
                
                if (descriptionSpan.length > 0) {
                    const scrapedDescription = descriptionSpan.text().trim();
                    if (scrapedDescription) {
                        description = scrapedDescription;
                        console.log(`📝 Found event description: "${description.substring(0, 100)}${description.length > 100 ? '...' : ''}"`);
                    }
                }
            }
        }
        
        if (description === 'No description available') {
            console.log('⚠️ Could not find event description, using default');
        }
        
        console.log(`✅ Successfully scraped event: "${title}" from ${timeInfo.startTime.toISOString()} to ${timeInfo.endTime.toISOString()}`);
        
        return {
            title: title,
            startTime: timeInfo.startTime,
            endTime: timeInfo.endTime,
            description: description
        };
        
    } catch (error) {
        console.error('❌ Error scraping Partiful event:', error.message);
        return null;
    }
}

function parseTimeText(timeText, baseDate) {
    try {
        // Remove extra whitespace and normalize
        const cleanTimeText = timeText.replace(/\s+/g, '');

        // Check if it's a time range (contains ' - ')
        if (cleanTimeText.includes('–')) {
            const [startTimeStr, endTimeStr] = cleanTimeText.split('–');
            
            const startTime = parseTimeString(startTimeStr.trim(), baseDate);
            const endTime = parseTimeString(endTimeStr.trim(), baseDate);
            
            if (!startTime || !endTime) {
                return null;
            }
            
            console.log(`🕰️ Parsed time range: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`);
            
            return {
                startTime: startTime,
                endTime: endTime
            };
        } else {
            // Single time - add 3 hours for end time
            const startTime = parseTimeString(cleanTimeText, baseDate);
            
            if (!startTime) {
                return null;
            }
            
            const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
            
            console.log(`🕰️ Parsed single time: ${startTime.toLocaleTimeString()} (end: ${endTime.toLocaleTimeString()})`);
            
            return {
                startTime: startTime,
                endTime: endTime
            };
        }
    } catch (error) {
        console.error('❌ Error parsing time text:', error.message);
        return null;
    }
}

function parseTimeString(timeStr, baseDate) {
    try {
        // Match time patterns like "8:30am", "3:00pm", "10:00AM", etc.
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/);
        
        if (!timeMatch) {
            console.error(`❌ Invalid time format: "${timeStr}"`);
            return null;
        }
        
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toLowerCase();
        
        // Convert to 24-hour format
        if (ampm === 'pm' && hours !== 12) {
            hours += 12;
        } else if (ampm === 'am' && hours === 12) {
            hours = 0;
        }
        
        // Create new date with the parsed time
        const eventDate = new Date(baseDate);
        eventDate.setHours(hours, minutes, 0, 0);
        
        return eventDate;
    } catch (error) {
        console.error(`❌ Error parsing time string "${timeStr}":`, error.message);
        return null;
    }
}

// Error handling
client.on(Events.Error, error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
