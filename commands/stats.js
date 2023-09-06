const { MessageEmbed } = require("discord.js")
const moment = require("moment")
const { version: discordjsVersion } = require("discord.js")
const { version: botVersion } = require("../package.json")
const { usagePercent } = require("cpu-stat")

module.exports = {
  name: "stats",
  description: "Get information about the bot",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["about", "ping", "info"],
  
  async run(client, message) {
    const uptime = moment.duration(client.uptime).format(" D[d], H[h], m[m]")
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

    const embed = new MessageEmbed()
      .setColor(client.botconfig.EmbedColor)
      .setTitle(`Stats from \`${client.user.username}\``)
      .addFields(
        {
          name: ":ping_pong: Ping",
          value: `┕\`${Math.round(client.ws.ping)}ms\``,
          inline: true,
        },
        {
          name: ":clock1: Uptime",
          value: `┕\`${uptime}\``,
          inline: true,
        },
        {
          name: ":file_cabinet: Memory",
          value: `┕\`${memoryUsage}mb\``,
          inline: true,
        },
        {
          name: ":homes: Servers",
          value: `┕\`${client.guilds.cache.size}\``,
          inline: true,
        },
        {
          name: ":busts_in_silhouette: Users",
          value: `┕\`${client.users.cache.size}\``,
          inline: true,
        },
        {
          name: ":control_knobs: API Latency",
          value: `┕\`${client.ws.ping}ms\``,
          inline: true,
        },
        {
          name: ":robot: Version",
          value: `┕\`v${botVersion}\``,
          inline: true,
        },
        {
          name: ":blue_book: Discord.js",
          value: `┕\`v${discordjsVersion}\``,
          inline: true,
        },
        {
          name: ":green_book: Node",
          value: `┕\`${process.version}\``,
          inline: true,
        }
      );

    try {
      cpuStat.usagePercent(async function (err, percent, seconds) {
        if (err) {
          return console.log(err)
        }
        message.channel.send(embed)
      })
    } catch (e) {
      console.log(String(e.stack).bgRed)
      client.sendError(message.channel, "Something went wrong.")
    }
  },

  SlashCommand: {
    async run(client, interaction) {
      const uptime = moment.duration(client.uptime).format(" D[d], H[h], m[m]")
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

      const embed = new MessageEmbed()
        .setColor(client.botconfig.EmbedColor)
        .setTitle(`Stats from \`${client.user.username}\``)
        .addFields(
          {
            name: ":ping_pong: Ping",
            value: `┕\`${Math.round(client.ws.ping)}ms\``,
            inline: true,
          },
          {
            name: ":clock1: Uptime",
            value: `┕\`${uptime}\``,
            inline: true,
          },
          {
            name: ":file_cabinet: Memory",
            value: `┕\`${memoryUsage}mb\``,
            inline: true,
          },
          {
            name: ":homes: Servers",
            value: `┕\`${client.guilds.cache.size}\``,
            inline: true,
          },
          {
            name: ":busts_in_silhouette: Users",
            value: `┕\`${client.users.cache.size}\``,
            inline: true,
          },
          {
            name: ":control_knobs: API Latency",
            value: `┕\`${client.ws.ping}ms\``,
            inline: true,
          },
          {
            name: ":robot: Version",
            value: `┕\`v${botVersion}\``,
            inline: true,
          },
          {
            name: ":blue_book: Discord.js",
            value: `┕\`v${discordjsVersion}\``,
            inline: true,
          },
          {
            name: ":green_book: Node",
            value: `┕\`${process.version}\``,
            inline: true,
          }
        )

      try {
        cpuStat.usagePercent(async function (err, percent, seconds) {
          if (err) {
            return console.log(err)
          }
          interaction.send(embed)
        });
      } catch (e) {
        console.log(String(e.stack).bgRed)
        client.sendError(interaction, "Something went wrong.")
      }
    },
  },
}