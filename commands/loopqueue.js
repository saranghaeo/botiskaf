const { MessageEmbed } = require("discord.js")
const { TrackUtils } = require("erela.js")

module.exports = {
  name: "loopqueue",
  description: "Loop the whole queue",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["lq", "repeatqueue", "rq"],
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

    // Включаем или выключаем повторение очереди
    if (player.queueRepeat) {
      player.setQueueRepeat(false)
      client.sendTime(message.channel, `:repeat: Queue Loop \`disabled\``)
    } else {
      player.setQueueRepeat(true)
      client.sendTime(message.channel, `:repeat: Queue Loop \`enabled\``)
    }
  },
  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      // Получаем текущего плеера сервера
      const player = await client.Manager.get(interaction.guild_id)
      
      // Получаем сервер и пользователя из взаимодействия
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)
      const voiceChannel = member.voice.channel
      const awaitchannel = client.channels.cache.get(interaction.channel_id)

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
          "❌ | **You must be in a voice channel to use this command.**"
        );
      
      // Проверяем, находится ли бот в том же голосовом канале, что и пользователь
      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(voiceChannel)
      )
        return client.sendTime(
          interaction,
          "❌ | **You must be in the same voice channel as me to use this command!**"
        );

      // Включаем или выключаем повторение очереди
      if (player.queueRepeat) {
        player.setQueueRepeat(false);
        client.sendTime(interaction, `:repeat: **Queue Loop** \`disabled\``)
      } else {
        player.setQueueRepeat(true);
        client.sendTime(interaction, `:repeat: **Queue Loop** \`enabled\``)
      }
    },
  },
}