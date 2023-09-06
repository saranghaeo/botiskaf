const { MessageEmbed } = require("discord.js")

module.exports = async (client, oldState, newState) => {
  // Get guild and player
  const guildId = newState.guild.id
  const player = client.Manager.get(guildId)

  // Check if the bot is active (return otherwise)
  if (!player || player.state !== "CONNECTED") return

  // Prepare the data for state change
  const stateChange = {
    type: null,
    channel: null,
    members: [],
  };

  // Determine the state change type
  if (oldState.channel === null && newState.channel !== null) {
    stateChange.type = "JOIN"
  } else if (oldState.channel !== null && newState.channel === null) {
    stateChange.type = "LEAVE"
  } else if (oldState.channel !== null && newState.channel !== null) {
    stateChange.type = "MOVE"
  } else {
    return // No change
  }

  // Check if server mute changed
  if (newState.serverMute !== oldState.serverMute) {
    player.pause(newState.serverMute)
    return
  }

  // Handle move type
  if (stateChange.type === "MOVE") {
    if (oldState.channel.id === player.voiceChannel) {
      stateChange.type = "LEAVE"
    }
    if (newState.channel.id === player.voiceChannel) {
      stateChange.type = "JOIN"
    }
  }

  // Double-triggered for MOVE events, handle JOIN and LEAVE
  if (stateChange.type === "JOIN") {
    stateChange.channel = newState.channel
  }
  if (stateChange.type === "LEAVE") {
    stateChange.channel = oldState.channel
  }

  // Check if the bot's voice channel is involved (return otherwise)
  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannel) {
    return
  }

  // Filter current users based on being a bot
  stateChange.members = stateChange.channel.members.filter(
    (member) => !member.user.bot
  );

  switch (stateChange.type) {
    case "JOIN":
      if (stateChange.members.size === 1 && player.paused) {
        const emb = new MessageEmbed()
          .setAuthor(`Resuming paused queue`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(
            `Resuming playback because all of you left me with music to play all alone`
          );
        const msg2 = await client.channels.cache
          .get(player.textChannel)
          .send(emb)
        player.setNowplayingMessage(msg2)
        player.pause(false)
      }
      break;
    case "LEAVE":
      if (
        stateChange.members.size === 0 &&
        !player.paused &&
        player.playing
      ) {
        player.pause(true)
        const emb = new MessageEmbed()
          .setAuthor(`Paused!`, client.botconfig.IconURL)
          .setColor(client.botconfig.EmbedColor)
          .setDescription(`The player has been paused because everybody left`)
        await client.channels.cache.get(player.textChannel).send(emb)
      }
      break
  }
}