const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "disconnect",
  description: "Stop the music and leave the voice channel",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["leave", "exit", "quit", "dc", "stop"],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id)

    if (!message.member.voice.channel) {
      return client.sendTime(
        message.channel,
        "❌ | **You must be in a voice channel to use this command**"
      );
    }

    if (!player) {
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );
    }

    await message.react("✅");
    player.destroy()
    return client.sendTime(message.channel, ":notes: | **Disconnected!**")
  },

  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)

      if (!member.voice.channel) {
        return client.sendTime(
          interaction,
          "❌ | **You must be in a voice channel to use this command.**"
        );
      }

      const player = await client.Manager.get(interaction.guild_id)

      if (!player) {
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );
      }

      player.destroy();
      await client.sendTime(interaction, ":notes: | **Disconnected!**")
    },
  },
}