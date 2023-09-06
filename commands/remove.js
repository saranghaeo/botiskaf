const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "remove",
  description: "Remove a song from the queue",
  usage: "[number]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["rm"],

  async run(client, message, args, { GuildDB }) {
    const player = await client.Manager.players.get(message.guild.id)

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );

    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **You must be in a voice channel to use this command!**"
      );

    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **You must be in the same voice channel as me to use this command!**"
      );

    if (!player.queue || !player.queue.length || player.queue.length === 0)
      return message.channel.send("There is nothing in the queue to remove")

    if (isNaN(args[0]) || args[0] < 1 || args[0] > player.queue.length)
      return message.channel.send(
        `❌ | **Please provide a valid track number to remove. Usage:** \`${client.botconfig.prefix}remove [track]\``
      );

    const removedTrack = player.queue[args[0] - 1]
    player.queue.remove(args[0] - 1)

    const removeEmbed = new MessageEmbed()
      .setDescription(`✅ | **Removed track \`${removedTrack.title}\` from the queue!**`)
      .setColor("GREEN")

    message.channel.send(removeEmbed)
  },

  SlashCommand: {
    options: [
      {
        name: "track",
        value: "[track]",
        type: 4,
        required: true,
        description: "Remove a song from the queue",
      },
    ],

    async run(client, interaction, args, { GuildDB }) {
      const player = await client.Manager.get(interaction.guild_id)
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)

      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **You must be in a voice channel to use this command.**"
        );

      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );

      if (!player.queue || !player.queue.length || player.queue.length === 0)
        return client.sendTime(interaction, "❌ | **Nothing is playing right now...**")

      if (isNaN(args[0]) || args[0] < 1 || args[0] > player.queue.length)
        return client.sendTime(
          interaction,
          `❌ | **Please provide a valid track number to remove. Usage:** \`${GuildDB.prefix}remove [track]\``
        );

      const removedTrack = player.queue[args[0] - 1]
      player.queue.remove(args[0] - 1)

      const removeEmbed = new MessageEmbed()
        .setDescription(`✅ | **Removed track \`${removedTrack.title}\` from the queue!**`)
        .setColor("GREEN")

      interaction.send(removeEmbed)
    },
  },
}