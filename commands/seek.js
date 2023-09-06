const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "seek",
  description: "Seek to a position in the song",
  usage: "<time s/m/h>",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["forward"],

  async run(client, message, args, { GuildDB }) {
    const player = await client.Manager.get(message.guild.id)

    if (!player)
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
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **You must be in the same voice channel as me to use this command!**"
      )

    if (!player.queue.current.isSeekable)
      return client.sendTime(
        message.channel,
        "❌ | **I'm not able to seek this song!**"
      )

    const SeekTo = client.ParseHumanTime(args.join(" "))

    if (!SeekTo)
      return client.sendTime(
        message.channel,
        `**Usage - **\`${GuildDB.prefix}seek <number s/m/h>\` \n**Example - **\`${GuildDB.prefix}seek 2m 10s\``
      )

    player.seek(SeekTo * 1000)
    message.react("✅")
  },
}