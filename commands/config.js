const { MessageEmbed, MessageReaction } = require("discord.js");

module.exports = {
  name: "config",
  description: "Edit the bot settings",
  usage: "",
  permissions: {
    channel: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
    member: ["ADMINISTRATOR"],
  },
  aliases: ["conf"],
  /**
   * @param {import("../structures/DiscordMusicBot")} client
   * @param {import("discord.js").Message} message
   * @param {string[]} args
   * @param {*} param3
   */
  run: async (client, message, args, { GuildDB }) => {
    // Создаем встроенное сообщение с настройками сервера
    let Config = new MessageEmbed()
      .setAuthor("Server Config", client.botconfig.IconURL)
      .setColor(client.botconfig.EmbedColor)
      .addField("Prefix", GuildDB.prefix, true)
      .addField("DJ Role", GuildDB.DJ ? `<@&${GuildDB.DJ}>` : "Not Set", true)
      .setDescription(`
What would you like to edit?

:one: - Server Prefix
:two: - DJ Role
`);

    // Отправляем сообщение с настройками и добавляем реакции
    let ConfigMessage = await message.channel.send(Config);
    await ConfigMessage.react("1️⃣");
    await ConfigMessage.react("2️⃣");

    try {
      // Ждем реакцию от пользователя
      let emoji = await ConfigMessage.awaitReactions(
        (reaction, user) =>
          user.id === message.author.id &&
          ["1️⃣", "2️⃣"].includes(reaction.emoji.name),
        { max: 1, errors: ["time"], time: 30000 }
      );

      // Получаем выбранную реакцию
      let em = emoji.first();

      // Очищаем реакции
      ConfigMessage.reactions.removeAll();

      if (em._emoji.name === "1️⃣") {
        // Пользователь выбрал изменение префикса
        await client.sendTime(
          message.channel,
          "What do you want to change the prefix to?"
        );
        let prefix = await message.channel.awaitMessages(
          (msg) => msg.author.id === message.author.id,
          { max: 1, time: 30000, errors: ["time"] }
        );
        if (!prefix.first()) {
          return client.sendTime(
            message.channel,
            "You took too long to respond."
          );
        }
        prefix = prefix.first().content;

        // Обновляем префикс в базе данных
        await client.database.guild.set(message.guild.id, {
          prefix: prefix,
          DJ: GuildDB.DJ,
        });

        client.sendTime(
          message.channel,
          `Successfully saved guild prefix as \`${prefix}\``
        );
      } else {
        // Пользователь выбрал изменение роли DJ
        await client.sendTime(
          message.channel,
          "Please mention the role you want `DJ's` to have."
        );
        let role = await message.channel.awaitMessages(
          (msg) => msg.author.id === message.author.id,
          { max: 1, time: 30000, errors: ["time"] }
        );
        if (!role.first()) {
          return client.sendTime(
            message.channel,
            "You took too long to respond."
          );
        }
        role = role.first().mentions.roles.first();

        // Обновляем роль DJ в базе данных
        await client.database.guild.set(message.guild.id, {
          prefix: GuildDB.prefix,
          DJ: role.id,
        });

        client.sendTime(
          message.channel,
          `Successfully saved DJ role as <@&${role.id}>`
        );
      }
    } catch (error) {
      // Обрабатываем ошибки при ожидании реакции
      console.error(error);
      ConfigMessage.reactions.removeAll();
      client.sendTime(
        message.channel,
        "❌ | **You took too long to respond. If you want to edit the settings, run the command again!**"
      );
      ConfigMessage.delete(Config);
    }
  },

  SlashCommand: {
    options: [
      {
        name: "prefix",
        description: "Check the bot's prefix",
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
        name: "dj",
        description: "Check the DJ role",
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
    /**
     * @param {import("../structures/DiscordMusicBot")} client
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {*} param3
     */
    run: async (client, interaction, args, { GuildDB }) => {
      let config = interaction.data.options[0].name;
      let member = await interaction.guild.members.fetch(interaction.user_id);
      //TODO: if no admin perms return...
      if (config === "prefix") {
        // Действия с префиксом
        if (
          interaction.data.options[0].options &&
          interaction.data.options[0].options[0]
        ) {
          // Устанавливаем новый префикс
          let prefix = interaction.data.options[0].options[0].value;
          await client.database.guild.set(interaction.guild.id, {
            prefix: prefix,
            DJ: GuildDB.DJ,
          });
          client.sendTime(
            interaction,
            `The prefix has now been set to \`${prefix}\``
          );
        } else {
          // Выводим текущий префикс
          client.sendTime(
            interaction,
            `The prefix of this server is \`${GuildDB.prefix}\``
          );
        }
      } else if (config === "djrole") {
        // Действия с ролью DJ
        if (
          interaction.data.options[0].options &&
          interaction.data.options[0].options[0]
        ) {
          let role = interaction.guild.roles.cache.get(
            interaction.data.options[0].options[0].value
          );
          await client.database.guild.set(interaction.guild.id, {
            prefix: GuildDB.prefix,
            DJ: role.id,
          });
          client.sendTime(
            interaction,
            `Successfully changed the DJ role of this server to ${role.name}`
          );
        } else {
          // Выводим текущую роль DJ
          let role = interaction.guild.roles.cache.get(GuildDB.DJ);
          client.sendTime(
            interaction,
            `The DJ role of this server is ${role.name}`
          );
        }
      }
    },
  },
};
