const { MessageEmbed } = require("discord.js")
const { TrackUtils } = require("erela.js")

module.exports = {
  name: "loop",
  description: "Loop the current song",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["l", "repeat"],
  run: async (client, message, args, { GuildDB }) => {
    // Получаем текущего плеера сервера
    const player = await client.Manager.get(message.guild.id)
    
    // Проверяем, есть ли плеер
    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );
    
    // Проверяем, находится ли пользователь в голосовом канале
    if (!message.member.voice.channel)
      return client.sendTime(
        message.channel,
        "❌ | **You must be in a voice channel to use this command!**"
      );
    
    // Проверяем, находится ли бот в том же голосовом канале, что и пользователь
    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    )
      return client.sendTime(
        message.channel,
        "❌ | **You must be in the same voice channel as me to use this command!**"
      );

    // Включаем или выключаем повторение трека
    if (player.trackRepeat) {
      player.setTrackRepeat(false)
      client.sendTime(message.channel, `🔂  \`Disabled\``)
    } else {
      player.setTrackRepeat(true)
      client.sendTime(message.channel, `🔂 \`Enabled\``)
    }
  },
  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      // Получаем сервер и пользователя из взаимодействия
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)
      
      // Получаем плеер сервера
      const player = await client.Manager.get(interaction.guild_id)
      
      // Проверяем, есть ли плеер
      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );
      
      // Проверяем, находится ли пользователь в голосовом канале
      if (!member.voice.channel)
        return client.sendTime(
          interaction,
          "❌ | You must be in a voice channel to use this command."
        );
      
      // Проверяем, находится ли бот в том же голосовом канале, что и пользователь
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      )
        return client.sendTime(
          interaction,
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );

      // Включаем или выключаем повторение трека
      if (player.trackRepeat) {
        player.setTrackRepeat(false)
        client.sendTime(interaction, `🔂 \`Disabled\``)
      } else {
        player.setTrackRepeat(true)
        client.sendTime(interaction, `🔂 \`Enabled\``)
      }
    },
  },
}
