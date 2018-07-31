/**
 * @file images SendImageCommand - Sends a stored image  
 * Store images with the `createimage` command
 * **Aliases**: `si`, `sendimg`
 * @module
 * @category images
 * @name sendimage
 * @example sendimage pyrrha
 * @param {StringResolvable} ImageName Name of the image to send
 * @param {StringResolvable} [Content] Optional content to send along with the image
 * @returns {Message} Image and optional content
 */

const Database = require('better-sqlite3'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {oneLine} = require('common-tags'),
  {deleteCommandMessages} = require(path.join(__dirname, '../../util.js'));

module.exports = class SendImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'sendimage',
      memberName: 'sendimage',
      group: 'images',
      aliases: ['si', 'sendimg'],
      description: 'Sends a stored image',
      format: 'ImageName [Content]',
      examples: ['sendimage pyrrha'],
      guildOnly: false,
      args: [
        {
          key: 'name',
          prompt: 'What image do you want send?',
          type: 'string',
          parse: p => p.toLowerCase()
        }, {
          key: 'message',
          prompt: 'Content to send along with the emoji?',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  run (msg, {name, message}) {
    try {
      const conn = new Database(path.join(__dirname, '../../data/databases/images.sqlite3')),
        image = conn.prepare('SELECT image FROM storage WHERE name = ?;').get(name);

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        description: message,
        image: {url: image.image},
        color: msg.guild ? msg.guild.me.displayColor : 5759195,
        timestamp: new Date()
      });
    } catch (err) {
      deleteCommandMessages(msg, this.client);

      if ((/(?:no such table)/i).test(err.toString())) {
        return msg.reply(`no images were saved yet. Start saving your first with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createimage\``);
      } else if ((/(?:Cannot read property 'image' of undefined)/i).test(err.toString())) {
        return msg.reply(oneLine`no image for \`${name}\`, either save it \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createimage\`
        or view your currently saved images with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}listimages\``);
      }

      console.error(err);

      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
  Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};