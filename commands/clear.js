const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "clear",
  description: "Clears the server queue",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["cl", "cls"],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id)

    if (!player || !player.queue || player.queue.length === 0) {
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );
    }

    const memberVoiceChannel = message.member.voice.channel
    const botVoiceChannel = message.guild.me.voice.channel

    if (!memberVoiceChannel) {
      return client.sendTime(
        message.channel,
        "❌ | **You must be in a voice channel to play something!**"
      );
    }

    if (botVoiceChannel && botVoiceChannel.id !== memberVoiceChannel.id) {
      return client.sendTime(
        message.channel,
        "❌ | **You must be in the same voice channel as me to use this command!**"
      );
    }

    player.queue.clear()
    await client.sendTime(message.channel, "✅ | **Cleared the queue!**")
  },

  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)

      if (!member.voice.channel) {
        return client.sendTime(
          interaction,
          "❌ | You must be in a voice channel to use this command."
        );
      }

      const player = await client.Manager.get(interaction.guild_id)

      if (!player || !player.queue || player.queue.length === 0) {
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        )
      }

      const botVoiceChannel = guild.me.voice.channel;

      if (botVoiceChannel && !botVoiceChannel.equals(member.voice.channel)) {
        return client.sendTime(
          interaction,
          "❌ | **You must be in the same voice channel as me to use this command!**"
        )
      }

      player.queue.clear();
      await client.sendTime(interaction, "✅ | **Cleared the queue!**")
    }
  }
}