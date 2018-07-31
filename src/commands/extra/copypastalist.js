/**
 * @file Extra EmbedCommand - Get a list of all copypastas  
 * **Aliases**: `cplist`, `copylist`, `pastalist`
 * @module
 * @category extra
 * @name copypastalist
 * @returns {MessageEmbed} List of all available copypastas
 */

const Database = require('better-sqlite3'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {splitMessage} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class CopyPastaListCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'copypastalist',
      memberName: 'copypastalist',
      group: 'extra',
      aliases: ['cplist', 'copylist', 'pastalist'],
      description: 'Get a list of all copypastas',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run (msg) {
    const conn = new Database(path.join(__dirname, '../../data/databases/pastas.sqlite3'));

    try {
      let list = conn.prepare('SELECT name FROM pastas;').all().map(p => p.name);

      list = list.map(e => `- \`${e}\``);

      deleteCommandMessages(msg, this.client);

      if (list.join('\n').length >= 2048) {
        const messages = [],
          splitTotal = splitMessage(stripIndents`${list.join('\n')}`);

        for (const part in splitTotal) {
          messages.push(await msg.embed({
            title: 'Available Copypastas',
            description: splitTotal[part],
            color: msg.guild ? msg.guild.me.displayColor : 5759195,
            timestamp: new Date()
          }));
        }

        return messages;
      }

      return msg.embed({
        title: 'Available Copypastas',
        description: list.join('\n'),
        color: msg.guild.me.displayColor
      });

    } catch (err) {
      deleteCommandMessages(msg, this.client);
      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no pastas saved yet. Start saving your first with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}copypastaadd\``);
      }

      console.error(err);
      
      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};