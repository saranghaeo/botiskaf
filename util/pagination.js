module.exports = async (msg, pages, client, emojiList = ["◀️", "⏹️", "▶️"], timeout = 120000) => {
  // Проверка наличия канала и страниц
  if (!msg || !msg.channel) throw new Error("Channel is inaccessible.");
  if (!pages || !Array.isArray(pages) || pages.length === 0) throw new Error("Pages are not given.");

  let page = 0;
  const embedMessage = await msg.channel.send(
    createPageEmbed(page)
  );

  // Добавление реакций к сообщению
  for (const emoji of emojiList) {
    await embedMessage.react(emoji);
  }

  // Создание реакционного коллектора
  const reactionCollector = embedMessage.createReactionCollector(
    (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
    { time: timeout }
  );

  // Обработка события сбора реакции
  reactionCollector.on("collect", (reaction) => {
    reaction.users.remove(msg.author);
    switch (reaction.emoji.name) {
      case emojiList[0]:
        page = page > 0 ? --page : pages.length - 1;
        break;
      case emojiList[1]:
        reactionCollector.stop();
        break;
      case emojiList[2]:
        page = page + 1 < pages.length ? ++page : 0;
        break;
    }
    embedMessage.edit(createPageEmbed(page));
  });

  // Обработка события завершения коллектора
  reactionCollector.on("end", () => {
    if (!embedMessage.deleted) {
      embedMessage.reactions.removeAll();
    }
  });

  // Функция для создания Embed сообщения для текущей страницы
  function createPageEmbed(pageIndex) {
    return pages[pageIndex].setFooter(
      `Page ${pageIndex + 1}/${pages.length}`,
      msg.author.displayAvatarURL({ dynamic: true })
    );
  }

  return embedMessage;
};