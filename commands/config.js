const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "config",
  description: "Edit the bot settings",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: ["ADMINISTRATOR"],
  },
  aliases: ["conf"],
  run: async (client, message, args, { GuildDB }) => {
    try {
      // Создаем встроенное сообщение с настройками сервера
      const Config = new MessageEmbed()
        .setAuthor("Server Config", client.botconfig.IconURL)
        .setColor(client.botconfig.EmbedColor)
        .addField("Prefix", GuildDB.prefix, true)
        .addField("DJ Role", GuildDB.DJ ? `<@&${GuildDB.DJ}>` : "Not Set", true)
        .setDescription(`
          What would you like to edit?
  
          :one: - Server Prefix
          :two: - DJ Role
        `)

      // Отправляем сообщение с настройками и добавляем реакции
      const ConfigMessage = await message.channel.send(Config)
      await ConfigMessage.react("1️⃣")
      await ConfigMessage.react("2️⃣")

      // Ждем реакцию от пользователя
      const filter = (reaction, user) =>
        user.id === message.author.id &&
        ["1️⃣", "2️⃣"].includes(reaction.emoji.name)

      const emoji = await ConfigMessage.awaitReactions(filter, {
        max: 1,
        errors: ["time"],
        time: 30000,
      });

      // Получаем выбранную реакцию
      const em = emoji.first()

      // Очищаем реакции
      ConfigMessage.reactions.removeAll();

      if (em && em.emoji.name === "1️⃣") {
        // Пользователь выбрал изменение префикса
        await message.channel.send("What do you want to change the prefix to?")
        const prefix = await message.channel.awaitMessages({
          max: 1,
          time: 30000,
          errors: ["time"],
          filter: (msg) => msg.author.id === message.author.id,
        });

        if (!prefix.first()) {
          return message.channel.send("You took too long to respond.")
        }

        const newPrefix = prefix.first().content

        // Обновляем префикс в базе данных
        await client.database.guild.set(message.guild.id, {
          prefix: newPrefix,
          DJ: GuildDB.DJ,
        })

        message.channel.send(`Successfully saved guild prefix as \`${newPrefix}\``)
      } else if (em && em.emoji.name === "2️⃣") {
        // Пользователь выбрал изменение роли DJ
        await message.channel.send("Please mention the role you want `DJ's` to have.")
        const role = await message.channel.awaitMessages({
          max: 1,
          time: 30000,
          errors: ["time"],
          filter: (msg) => msg.author.id === message.author.id,
        })

        if (!role.first()) {
          return message.channel.send("You took too long to respond.")
        }

        const mentionedRole = role.first().mentions.roles.first()

        // Обновляем роль DJ в базе данных
        await client.database.guild.set(message.guild.id, {
          prefix: GuildDB.prefix,
          DJ: mentionedRole ? mentionedRole.id : null,
        });

        if (mentionedRole) {
          message.channel.send(`Successfully saved DJ role as <@&${mentionedRole.id}>`)
        } else {
          message.channel.send("DJ role has been cleared.")
        }
      }
    } catch (error) {
      // Обрабатываем ошибки при ожидании реакции
      console.error(error);
      message.channel.send("❌ | **You took too long to respond. If you want to edit the settings, run the command again!**")
    }
  },

  SlashCommand: {
    options: [
      {
        name: "prefix",
        description: "Check or set the bot's prefix",
        type: 1,
        required: false,
        options: [
          {
            name: "symbol",
            description: "Set the bot's prefix",
            type: 3,
            required: false,
          },
        ],
      },
      {
        name: "djrole",
        description: "Check or set the DJ role",
        type: 1,
        required: false,
        options: [
          {
            name: "role",
            description: "Set the DJ role",
            type: 8,
            required: false,
          },
        ],
      },
    ],
    run: async (client, interaction, args, { GuildDB }) => {
      try {
        const config = interaction.data.options[0].name
        const member = await interaction.guild.members.fetch(interaction.user.id)

        if (config === "prefix") {
          if (
            interaction.data.options[0].options &&
            interaction.data.options[0].options[0]
          ) {
            // Устанавливаем новый префикс
            const newPrefix = interaction.data.options[0].options[0].value
            await client.database.guild.set(interaction.guild.id, {
              prefix: newPrefix,
              DJ: GuildDB.DJ,
            })
            client.sendTime(
              interaction,
              `The prefix has now been set to \`${newPrefix}\``
            )
          } else {
            // Выводим текущий префикс
            client.sendTime(
              interaction,
              `The prefix of this server is \`${GuildDB.prefix}\``
            )
          }
        } else if (config === "djrole") {
          if (
            interaction.data.options[0].options &&
            interaction.data.options[0].options[0]
          ) {
            const roleId = interaction.data.options[0].options[0].value
            const role = interaction.guild.roles.cache.get(roleId)
            
            if (!role) {
              return client.sendTime(interaction, "Role not found.")
            }
            
            await client.database.guild.set(interaction.guild.id, {
              prefix: GuildDB.prefix,
              DJ: roleId,
            })

            client.sendTime(
              interaction,
              `Successfully changed the DJ role of this server to ${role.name}`
            )
          } else {
            // Выводим текущую роль DJ
            const role = interaction.guild.roles.cache.get(GuildDB.DJ);
            client.sendTime(
              interaction,
              `The DJ role of this server is ${role ? role.name : "Not Set"}`
            );
          }
        }
      } catch (error) {
        console.error(error)
        client.sendTime(
          interaction,
          "❌ | **You took too long to respond. If you want to edit the settings, run the command again!**"
        )
      }
    }
  }
}