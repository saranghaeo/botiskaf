const { MessageEmbed } = require("discord.js")
const { TrackUtils } = require("erela.js")

module.exports = {
  name: "move",
  description: "Moves a track to a specified position.",
  usage: "[track number] [destination]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["m"],
  run: async (client, message, args, { GuildDB }) => {
    let player = await client.Manager.get(message.guild.id)
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );
    if (args.length !== 2 || isNaN(args[0]) || isNaN(args[1])) {
      return client.sendTime(
        message.channel,
        "❌ | **Invalid arguments. Please provide both track number and destination.**"
      )
    }

    // Parse input to integers
    const trackNum = parseInt(args[0]) - 1
    const dest = parseInt(args[1]) - 1

    if (trackNum < 0 || trackNum >= player.queue.length || dest < 0 || dest >= player.queue.length) {
      return client.sendTime(message.channel, "❌ | **Invalid track number or destination.**")
    }

    const track = player.queue[trackNum]
    player.queue.splice(trackNum, 1)
    player.queue.splice(dest, 0, track)
    
    client.sendTime(
      message.channel,
      `✅ | **${track.title}** has been moved to position ${dest + 1}.`
    );
  },

  SlashCommand: {
    options: [
      {
        name: "track",
        type: 4,
        required: true,
        description: "Track to move.",
      },
      {
        name: "position",
        type: 4,
        required: true,
        description: "Moves selected track to the specified position.",
      },
    ],
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)

      let player = await client.Manager.get(interaction.guild.id)
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );

      if (args.length !== 2 || isNaN(args[0].value) || isNaN(args[1].value)) {
        return client.sendTime(
          interaction,
          "❌ | **Invalid arguments. Please provide both track number and destination.**"
        );
      }

      // Parse input to integers
      const trackNum = parseInt(args[0].value) - 1
      const dest = parseInt(args[1].value) - 1

      if (trackNum < 0 || trackNum >= player.queue.length || dest < 0 || dest >= player.queue.length) {
        return client.sendTime(interaction, "❌ | **Invalid track number or destination.**")
      }

      const track = player.queue[trackNum]
      player.queue.splice(trackNum, 1)
      player.queue.splice(dest, 0, track)

      client.sendTime(
        interaction,
        `✅ | **${track.title}** has been moved to position ${dest + 1}.`
      );
    },
  },
}