const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "pause",
  description: "Pauses the music",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: [],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id)

    if (!player || !player.playing)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      )

    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **You must be in a voice channel to use this command!**"
      )

    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !==
        message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **You must be in the same voice channel as me to use this command!**"
      )

    if (player.paused)
      return client.sendTime(
        message.channel,
        "❌ | **Music is already paused!**"
      )

    player.pause(true)

    const embed = new MessageEmbed()
      .setAuthor(`Paused!`, client.botconfig.IconURL)
      .setColor(client.botconfig.EmbedColor)
      .setDescription(`Type \`${GuildDB.prefix}resume\` to continue playing!`)

    await message.channel.send(embed)
    await message.react("✅")
  },

  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | **You must be in a voice channel to use this command.**"
        )

      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **You must be in the same voice channel as me to use this command!**"
        )

      const player = await client.Manager.get(interaction.guild_id)

      if (!player || !player.playing)
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        )

      if (player.paused)
        return client.sendTime(interaction, "Music is already paused!")

      player.pause(true);
      client.sendTime(interaction, "**⏸ Paused!**")
    },
  },
}
