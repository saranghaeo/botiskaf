const { MessageEmbed } = require("discord.js")
const prettyMilliseconds = require("pretty-ms")
const _ = require("lodash")

module.exports = {
  name: "queue",
  description: "Shows all currently enqueued songs",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["q"],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id)

    if (!player)
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );

    if (!player.queue || !player.queue.length || player.queue === 0) {
      const currentTrack = player.queue.current

      const QueueEmbed = new MessageEmbed()
        .setAuthor("Currently playing", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(`[${currentTrack.title}](${currentTrack.uri})`)
        .addField("Requested by", `${currentTrack.requester}`, true)
        .setThumbnail(currentTrack.displayThumbnail())

      if (currentTrack.duration == 9223372036854776000) {
        QueueEmbed.addField("Duration", "`Live`", true)
      } else {
        const durationProgress = client.ProgressBar(
          player.position,
          currentTrack.duration,
          15
        );

        QueueEmbed.addField(
          "Duration",
          `${durationProgress.Bar} \`${prettyMilliseconds(
            player.position,
            { colonNotation: true }
          )} / ${prettyMilliseconds(currentTrack.duration, {
            colonNotation: true,
          })}\``,
          true
        )
      }

      return message.channel.send(QueueEmbed)
    }

    const Songs = player.queue.map((track, index) => {
      track.index = index;
      return track
    })

    const ChunkedSongs = _.chunk(Songs, 10) // How many songs to show per-page

    const Pages = ChunkedSongs.map((Tracks) => {
      const SongsDescription = Tracks
        .map((track) => {
          let duration
          if (track.duration == 9223372036854776000) {
            duration = "Live"
          } else {
            duration = prettyMilliseconds(track.duration, {
              colonNotation: true,
            });
          }

          return `\`${track.index + 1}.\` [${track.title}](${track.uri}) \n\`${duration}\` **|** Requested by: ${track.requester}\n`
        })
        .join("\n");

      const Embed = new MessageEmbed()
        .setAuthor("Queue", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(
          `**Currently Playing:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**Up Next:** \n${SongsDescription}\n\n`
        )
        .addField(
          "Total songs: \n",
          `\`${player.queue.totalSize - 1}\``,
          true
        );

      const queueDuration = player.queue.duration >= 9223372036854776000
        ? "Live"
        : prettyMilliseconds(player.queue.duration, { colonNotation: true })

      Embed
        .addField("Total length: \n", `\`${queueDuration}\``, true)
        .addField("Requested by:", `${player.queue.current.requester}`, true)

      const currentTrack = player.queue.current
      if (currentTrack.duration == 9223372036854776000) {
        Embed.addField("Current song duration:", "`Live`")
      } else {
        const durationProgress = client.ProgressBar(
          player.position,
          currentTrack.duration,
          15
        );

        Embed.addField(
          "Current song duration:",
          `${durationProgress.Bar} \`${prettyMilliseconds(
            player.position,
            { colonNotation: true }
          )} / ${prettyMilliseconds(currentTrack.duration, {
            colonNotation: true,
          })}\``
        );
      }

      Embed.setThumbnail(player.queue.current.displayThumbnail())

      return Embed
    });

    if (!Pages.length || Pages.length === 1)
      return message.channel.send(Pages[0])
    else client.Pagination(message, Pages)
  },
  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      const player = await client.Manager.get(interaction.guild_id)

      if (!player)
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );

      if (!player.queue || !player.queue.length || player.queue === 0) {
        const currentTrack = player.queue.current

        const QueueEmbed = new MessageEmbed()
          .setAuthor("Currently playing", client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(`[${currentTrack.title}](${currentTrack.uri})`)
          .addField("Requested by", `${currentTrack.requester}`, true)
          .setThumbnail(currentTrack.displayThumbnail())

        if (currentTrack.duration == 9223372036854776000) {
          QueueEmbed.addField("Duration", "`Live`", true)
        } else {
          const durationProgress = client.ProgressBar(
            player.position,
            currentTrack.duration,
            15
          );

          QueueEmbed.addField(
            "Duration",
            `${durationProgress.Bar} \`${prettyMilliseconds(
              player.position,
              { colonNotation: true }
            )} / ${prettyMilliseconds(currentTrack.duration, {
              colonNotation: true,
            })}\``,
            true
          );
        }

        return interaction.send(QueueEmbed)
      }

      const Songs = player.queue.map((track, index) => {
        track.index = index
        return track
      });

      const ChunkedSongs = _.chunk(Songs, 10) // How many songs to show per-page

      const Pages = ChunkedSongs.map((Tracks) => {
        const SongsDescription = Tracks
          .map((track) => {
            let duration;
            if (track.duration == 9223372036854776000) {
              duration = "Live"
            } else {
              duration = prettyMilliseconds(track.duration, {
                colonNotation: true,
              })
            }

            return `\`${track.index + 1}.\` [${track.title}](${track.uri}) \n\`${duration}\` **|** Requested by: ${track.requester}\n`
          })
          .join("\n")

        const Embed = new MessageEmbed()
          .setAuthor("Queue", client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `**Currently Playing:** \n[${player.queue.current.title}](${player.queue.current.uri}) \n\n**Up Next:** \n${SongsDescription}\n\n`
          )
          .addField(
            "Total songs: \n",
            `\`${player.queue.totalSize - 1}\``,
            true
          )

        const queueDuration = player.queue.duration >= 9223372036854776000
          ? "Live"
          : prettyMilliseconds(player.queue.duration, {
            colonNotation: true,
          })

        Embed
          .addField("Total length: \n", `\`${queueDuration}\``, true)
          .addField("Requested by:", `${player.queue.current.requester}`, true);

        const currentTrack = player.queue.current;
        if (currentTrack.duration == 9223372036854776000) {
          Embed.addField("Current song duration:", "`Live`");
        } else {
          const durationProgress = client.ProgressBar(
            player.position,
            currentTrack.duration,
            15
          )

          Embed.addField(
            "Current song duration:",
            `${durationProgress.Bar} \`${prettyMilliseconds(
              player.position,
              { colonNotation: true }
            )} / ${prettyMilliseconds(currentTrack.duration, {
              colonNotation: true,
            })}\``
          )
        }

        Embed.setThumbnail(player.queue.current.displayThumbnail())

        return Embed
      });

      if (!Pages.length || Pages.length === 1)
        return interaction.send(Pages[0])
      else client.Pagination(interaction, Pages)
    },
  },
}