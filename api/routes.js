const api = require("express").Router();
const { Collection } = require("discord.js");
const { join } = require("path");
let config;
try {
  //Config for testing
  config = require("../dev-config");
} catch {
  //Config for production
  config = require("../botconfig");
}
const Auth = require("./Middlewares/Auth");
const fs = require("fs");

let CommandsDir = join(__dirname, "..", "commands");
let Commands = [];

fs.readdir(CommandsDir, (err, files) => {
  if (err) this.log(err);
  else
    files.forEach((file) => {
      let cmd = require(CommandsDir + "/" + file);
      if (!cmd.name || !cmd.description || !cmd.run) return;
      Commands.push({
        name: cmd.name,
        aliases: cmd.aliases,
        usage: cmd.usage,
        description: cmd.description,
      });
    });
});

api.get("/api/info", (req, res) => {
  res.send({
    ClientID: config.ClientID,
    Permissions: config.Permissions,
    Scopes: config.Scopes,
    Website: config.Website,
    CallbackURL: config.CallbackURL,
  });
});

api.get("/api/commands", (req, res) => {
  res.send({ commands: Commands });
});

api.get("/logout", (req, res) => {
  if (req.user) req.logout();
  res.redirect("/");
});

module.exports = api;
