const { MessageEmbed } = require("discord.js")
const prettyMilliseconds = require("pretty-ms")

module.exports = {
  name: "nowplaying",
  description: "See what song is currently playing",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["np", "nowplaying", "now playing"],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id)
    if (!player || !player.queue.current)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );

    const song = player.queue.current;
    const isLiveStream = song.duration === 9223372036854776000

    const QueueEmbed = new MessageEmbed()
      .setAuthor("Currently playing", client.botconfig.IconURL)
      .setColor(client.botconfig.EmbedColor)
      .setDescription(`[${song.title}](${song.uri})`)
      .addField("Requested by", `${song.requester}`, true)
      .setThumbnail(song.displayThumbnail())

    if (isLiveStream) {
      QueueEmbed.addField("Duration", "`Live`");
    } else {
      const progress = client.ProgressBar(player.position, song.duration, 15)
      const formattedDuration = prettyMilliseconds(song.duration, {
        colonNotation: true,
      });

      QueueEmbed.addField(
        "Duration",
        `${progress.Bar} \`${prettyMilliseconds(player.position, {
          colonNotation: true,
        })} / ${formattedDuration}\``
      );
    }

    return message.channel.send(QueueEmbed)
  },

  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      const player = await client.Manager.get(interaction.guild_id)
      if (!player || !player.queue.current)
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );

      const song = player.queue.current
      const isLiveStream = song.duration === 9223372036854776000

      const QueueEmbed = new MessageEmbed()
        .setAuthor("Currently playing", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(`[${song.title}](${song.uri})`)
        .addField("Requested by", `${song.requester}`, true)
        .setThumbnail(song.displayThumbnail())

      if (isLiveStream) {
        QueueEmbed.addField("Duration", "`Live`")
      } else {
        const progress = client.ProgressBar(player.position, song.duration, 15)
        const formattedDuration = prettyMilliseconds(song.duration, {
          colonNotation: true,
        })

        QueueEmbed.addField(
          "Duration",
          `${progress.Bar} \`${prettyMilliseconds(player.position, {
            colonNotation: true,
          })} / ${formattedDuration}\``
        )
      }

      return interaction.send(QueueEmbed)
    },
  },
}