/**
 * @file Images ListsImagesCommand - List all stored images  
 * **Aliases**: `listimg`, `li`
 * @module
 * @category images
 * @name listimages
 * @returns {MessageEmbed} List of all the images stored by the bot
 */

const Database = require('better-sqlite3'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {splitMessage} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class ListsImagesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'listimages',
      memberName: 'listimages',
      group: 'images',
      aliases: ['listimg', 'li'],
      description: 'List all stored images',
      guildOnly: false
    });
  }

  async run (msg) {
    try {
      const conn = new Database(path.join(__dirname, '../../data/databases/images.sqlite3'));
      let list = conn.prepare('SELECT * FROM storage').all();

      list = list.map(e => ({
        name: `\`${e.name}\``,
        image: `[Click to open](${e.image})`
      }));

      deleteCommandMessages(msg, this.client);

      if (list.map(e => `${e.name}: ${e.image}`).join('\n').length >= 2048) {
        const messages = [],
          splitTotal = splitMessage(stripIndents`${list.map(e => `${e.name}: ${e.image}`).join('\n')}`);

        for (const part in splitTotal) {
          messages.push(await msg.embed({
            title: 'Available images',
            description: splitTotal[part],
            color: msg.guild ? msg.guild.me.displayColor : 5759195,
            timestamp: new Date()
          }));

        }

        return messages;
      }

      return msg.embed({
        title: 'Available images',
        description: stripIndents`${list.map(e => `${e.name}: ${e.image}`).join('\n')}`,
        color: msg.guild ? msg.guild.me.displayColor : 5759195,
        timestamp: new Date()
      });
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no images saved yet. Start saving your first with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createimage\``);
      }

      console.error(err);

      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};