const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Information about the bot",
  usage: "[command]",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: [],
  },
  aliases: ["command", "commands", "cmd"],
  run: async (client, message, args, { GuildDB }) => {
    const prefix = GuildDB ? GuildDB.prefix : client.botconfig.DefaultPrefix;
    const commandName = args[0];

    // Если нет указанной команды, выводим список доступных команд
    if (!commandName) {
      const commandList = client.commands.map((cmd) => {
        const usage = cmd.usage ? ` ${cmd.usage}` : "";
        return `\`${prefix}${cmd.name}${usage}\` - ${cmd.description}`;
      });

      const helpEmbed = new MessageEmbed()
        .setAuthor(`Commands of ${client.user.username}`, client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .setDescription(commandList.join("\n"))
        .setFooter(`To get info of each command type ${prefix}help [Command]`);

      message.channel.send(helpEmbed);
    } else {
      // Если указана конкретная команда, выводим информацию о ней
      const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

      if (!command) {
        return client.sendTime(message.channel, `❌ | Unable to find that command.`)
      }

      const aliases = command.aliases.join(", ");
      const usage = command.usage ? ` ${command.usage}` : ""

      const commandEmbed = new MessageEmbed()
        .setAuthor(`Command: ${command.name}`, client.botconfig.IconURL)
        .setDescription(command.description)
        .setColor("GREEN")
        .addField("Aliases", `\`${aliases}\``, true)
        .addField("Usage", `\`${prefix}${command.name}${usage}\``, true)
        .addField("Permissions", `Member: ${command.permissions.member.join(", ")}\nBot: ${command.permissions.channel.join(", ")}`, true)
        .setFooter(`Prefix - ${prefix}`)

      message.channel.send(commandEmbed)
    }
  },

  SlashCommand: {
    options: [
      {
        name: "command",
        description: "Get information on a specific command",
        type: 3,
        required: false,
      },
    ],
    run: async (client, interaction, args, { GuildDB }) => {
      const prefix = GuildDB ? GuildDB.prefix : client.botconfig.DefaultPrefix
      const commandName = args && args[0] ? args[0].value : null

      // Если нет указанной команды, выводим список доступных команд
      if (!commandName) {
        const commandList = client.commands.map((cmd) => {
          const usage = cmd.usage ? ` ${cmd.usage}` : ""
          return `\`${prefix}${cmd.name}${usage}\` - ${cmd.description}`
        });

        const helpEmbed = new MessageEmbed()
          .setAuthor(`Commands of ${client.user.username}`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(commandList.join("\n"))

        interaction.send(helpEmbed)
      } else {
        // Если указана конкретная команда, выводим информацию о ней
        const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

        if (!command) {
          return client.sendTime(interaction, `❌ | Unable to find that command.`)
        }

        const aliases = command.aliases.join(", ")
        const usage = command.usage ? ` ${command.usage}` : ""

        const commandEmbed = new MessageEmbed()
          .setAuthor(`Command: ${command.name}`, client.botconfig.IconURL)
          .setDescription(command.description)
          .setColor("GREEN")
          .addField("Aliases", aliases, true)
          .addField("Usage", `\`${prefix}${command.name}${usage}\``, true)
          .addField("Permissions", `Member: ${command.permissions.member.join(", ")}\nBot: ${command.permissions.channel.join(", ")}`, true)
          .setFooter(`Prefix - ${prefix}`)

        interaction.send(commandEmbed)
      }
    },
  },
}