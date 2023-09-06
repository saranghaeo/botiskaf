const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "volume",
  description: "Check or change the current volume",
  usage: "<volume>",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["vol", "v"],
  
  async run(client, message, args, { GuildDB }) {
    const player = await client.Manager.get(message.guild.id)

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      )

    if (!args[0])
      return client.sendTime(
        message.channel,
        `🔉 | Current volume \`${player.volume}\`.`
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

    const vol = parseInt(args[0])

    if (isNaN(vol) || vol < 1 || vol > 100) {
      return client.sendTime(
        message.channel,
        "❌ | **Please choose a number between `1-100`**"
      )
    }

    player.setVolume(vol)
    client.sendTime(
      message.channel,
      `🔉 | **Volume set to** \`${player.volume}\``
    )
  },

  SlashCommand: {
    options: [
      {
        name: "amount",
        value: "amount",
        type: 4,
        required: false,
        description: "Enter a volume from 1-100. Default is 100.",
      },
    ],
    
    async run(client, interaction, args, { GuildDB }) {
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)
      const player = await client.Manager.get(interaction.guild_id)

      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | You must be in a voice channel to use this command."
        )

      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **You must be in the same voice channel as me to use this command!**"
        )

      if (!args[0].value)
        return client.sendTime(
          interaction,
          `🔉 | Current volume \`${player.volume}\`.`
        )

      const vol = parseInt(args[0].value)

      if (isNaN(vol) || vol < 1 || vol > 100)
        return client.sendTime(
          interaction,
          "❌ | **Please choose a number between `1-100`**"
        );

      player.setVolume(vol)
      client.sendTime(interaction, `🔉 | **Volume set to** \`${player.volume}\``)
    },
  },
}
