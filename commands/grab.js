const { MessageEmbed } = require("discord.js")
const prettyMilliseconds = require("pretty-ms")

module.exports = {
  name: "grab",
  description: "Saves the current song to your Direct Messages",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["save"],
  run: async (client, message, args, { GuildDB }) => {
    const player = await client.Manager.get(message.guild.id);

    if (!player || !player.playing) {
      return client.sendTime(
        message.channel,
        "❌ | **Nothing is playing right now...**"
      );
    }

    if (!message.member.voice.channel) {
      return client.sendTime(
        message.channel,
        "❌ | **You must be in a voice channel to play something!**"
      );
    }

    if (
      message.guild.me.voice.channel &&
      message.member.voice.channel.id !==
        message.guild.me.voice.channel.id
    ) {
      return client.sendTime(
        message.channel,
        "❌ | **You must be in the same voice channel as me to use this command!**"
      );
    }

    let d;
    if (player.queue.current.duration == 9223372036854776000) {
      d = "Live"
    } else {
      d = prettyMilliseconds(player.queue.current.duration, {
        colonNotation: true,
      });
    }

    const GrabEmbed = new MessageEmbed()
      .setAuthor(
        `Song saved`,
        client.user.displayAvatarURL({
          dynamic: true,
        })
      )
      .setThumbnail(
        `https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`
      )
      .setURL(player.queue.current.uri)
      .setColor(client.botconfig.EmbedColor)
      .setTitle(`**${player.queue.current.title}**`)
      .addField(`⌛ Duration: `, `\`${d}\``, true)
      .addField(`🎵 Author: `, `\`${player.queue.current.author}\``, true)
      .addField(
        `▶ Play it:`,
        `\`${GuildDB ? GuildDB.prefix : client.botconfig.DefaultPrefix}play ${
          player.queue.current.uri
        }\``
      )
      .addField(`🔎 Saved in:`, `<#${message.channel.id}>`)
      .setFooter(
        `Requested by: ${player.queue.current.requester.tag}`,
        player.queue.current.requester.displayAvatarURL({
          dynamic: true,
        })
      );

    try {
      await message.author.send(GrabEmbed)
      client.sendTime(message.channel, "✅ | **Check your DMs!**")
    } catch (e) {
      return client.sendTime(message.channel, "**❌ Your DMs are disabled**")
    }
  },

  SlashCommand: {
    run: async (client, interaction, args, { GuildDB }) => {
      const guild = client.guilds.cache.get(interaction.guild_id)
      const user = client.users.cache.get(interaction.member.user.id)
      const member = guild.members.cache.get(interaction.member.user.id)
      const player = await client.Manager.get(interaction.guild_id)

      if (!player || !player.playing) {
        return client.sendTime(
          interaction,
          "❌ | **Nothing is playing right now...**"
        );
      }

      if (!member.voice.channel) {
        return client.sendTime(
          interaction,
          "❌ | **You must be in a voice channel to use this command.**"
        );
      }

      if (
        guild.me.voice.channel &&
        !guild.me.voice.channel.equals(member.voice.channel)
      ) {
        return client.sendTime(
          interaction,
          `❌ | **You must be in ${guild.me.voice.channel} to use this command.**`
        );
      }

      let d;
      if (player.queue.current.duration == 9223372036854776000) {
        d = "Live";
      } else {
        d = prettyMilliseconds(player.queue.current.duration, {
          colonNotation: true,
        });
      }

      const embed = new MessageEmbed()
        .setAuthor(`Song saved: `, client.user.displayAvatarURL())
        .setThumbnail(
          `https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`
        )
        .setURL(player.queue.current.uri)
        .setColor(client.botconfig.EmbedColor)
        .setTimestamp()
        .setTitle(`**${player.queue.current.title}**`)
        .addField(`⌛ Duration: `, `\`${d}\``, true)
        .addField(`🎵 Author: `, `\`${player.queue.current.author}\``, true)
        .addField(
          `▶ Play it:`,
          `\`${
            GuildDB ? GuildDB.prefix : client.botconfig.DefaultPrefix
          }play ${player.queue.current.uri}\``
        )
        .addField(`🔎 Saved in:`, `<#${interaction.channel_id}>`)
        .setFooter(
          `Requested by: ${player.queue.current.requester.tag}`,
          player.queue.current.requester.displayAvatarURL({
            dynamic: true,
          })
        );

      try {
        await user.send(embed)
        client.sendTime(interaction, "✅ | **Check your DMs!**")
      } catch (e) {
        return client.sendTime(
          interaction,
          "**❌ Your DMs are disabled**"
        );
      }
    },
  },
}