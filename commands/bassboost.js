const { MessageEmbed } = require("discord.js")
const { TrackUtils } = require("erela.js")

const levels = {
  none: 0.0,
  low: 0.2,
  medium: 0.35,
  high: 0.5,
};

module.exports = {
  name: "bassboost",
  description: "Включает bass boost эффект",
  usage: "<none|low|medium|high>",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["bb", "bass"],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id)

    if (!player) {
      return client.sendTime(message.channel, "❌ | **Менчик, музыку то запусти...**")
    }

    const memberVoiceChannel = message.member.voice.channel;
    const botVoiceChannel = message.guild.me.voice.channel;

    if (!memberVoiceChannel) {
      return client.sendTime(message.channel, "❌ | **Надо быть в голосовом канале чтобы использовать эту команду.**")
    }

    if (botVoiceChannel && botVoiceChannel.id !== memberVoiceChannel.id) {
      return client.sendTime(message.channel, "❌ | **Ну бот в другом канале как бы...вооот**")
    }

    if (!args[0]) {
      return client.sendTime(message.channel, "**Выбери уровень для +ушей. \nДоступные уровни:** `none`, `low`, `medium`, `high`")
    }

    const level = args[0].toLowerCase();
    
    if (level in levels) {
      player.setEQ(
        ...new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }))
      );

      return client.sendTime(message.channel, `✅ | **Гуд лак, уровень - ** \`${level}\``)
    } else {
      return client.sendTime(message.channel, "❌ | **Неправильно блять, вот доступные:** `none`, `low`, `medium`, `high`")
    }
  },
  SlashCommand: {
    options: [
      {
        name: "level",
        description: "Please provide a bassboost level. Available Levels: low, medium, high or none",
        type: 3,
        required: true,
      },
    ],
    run: async (client, interaction, args, { GuildDB }) => {
      const player = await client.Manager.get(interaction.guild_id)
      const guild = client.guilds.cache.get(interaction.guild_id)
      const member = guild.members.cache.get(interaction.member.user.id)
      const voiceChannel = member.voice.channel

      if (!player) {
        return client.sendTime(interaction, "❌ | **Менчик, музыку то запусти...**")
      }

      if (!voiceChannel) {
        return client.sendTime(interaction, "❌ | **Надо быть в голосовом канале чтобы использовать эту команду.**")
      }

      const botVoiceChannel = guild.me.voice.channel

      if (botVoiceChannel && !botVoiceChannel.equals(voiceChannel)) {
        return client.sendTime(interaction, "❌ | **Ну бот в другом канале как бы...вооот**")
      }

      if (!args[0]) {
        return client.sendTime(interaction, "**Выбери уровень для +ушей. \nДоступные уровни:** `none`, `low`, `medium`, `high`")
      }

      const level = args[0].value.toLowerCase();

      if (level in levels) {
        player.setEQ(
          ...new Array(3).fill(null).map((_, i) => ({ band: i, gain: levels[level] }))
        )

        return client.sendTime(interaction, `✅ | **Гуд лак, уровень - ** \`${level}\``)
      } else {
        return client.sendTime(interaction, "❌ | **Неправильно блять, вот доступные:** `none`, `low`, `medium`, `high`")
      }
    }
  }
}
