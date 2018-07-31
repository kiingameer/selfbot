/**
 * @file Images CreateImageCommand - Store an image URL to send with sendimage  
 * **Aliases**: `ci`, `ui`, `createimg`
 * @module
 * @category images
 * @name createimage
 * @example createimage pyrrha https://favna.s-ul.eu/CKqAhvM0.png
 * @param {StringResolvable} ImageName The name of the image
 * @returns {MessageEmbed} Confirmation the image was stored
 */

const Database = require('better-sqlite3'),
  path = require('path'),
  {Command} = require('discord.js-commando'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class CreateImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'createimage',
      memberName: 'createimage',
      group: 'images',
      aliases: ['ci', 'ui', 'createimg'],
      description: 'Store an image URL to send with sendimage',
      format: 'ImageName',
      examples: ['createimage pyrrha https://favna.s-ul.eu/CKqAhvM0.png'],
      guildOnly: false,
      args: [
        {
          key: 'name',
          prompt: 'name of the image?',
          type: 'string',
          parse: p => p.toLowerCase()
        },
        {
          key: 'image',
          prompt: 'URL of the image to store?',
          type: 'string',
          validate: v => this.imgregex.test(v) ? true : 'has to be a valid image URL (supported types: `png`, `jpg`, `jpeg`, `webp`, `gif`, `gifv`)', // eslint-disable-line max-len
          parse: p => this.imgregex.test(p) ? p.replace(this.imgregex, '$1') : p
        }
      ]
    });
    this.imgregex = new RegExp(/<{0,1}(https?:\/\/.*\.(?:png|jpg|webp|jpeg|gif|gifv))>{0,1}/, 'im');
  }

  run (msg, {name, image, updated = false}) {
    const conn = new Database(path.join(__dirname, '../../data/databases/images.sqlite3'));

    try {
      const query = conn.prepare('SELECT name FROM storage WHERE name = ?;').get(name);

      if (query) {
        conn.prepare('UPDATE storage SET image=$image WHERE name=$name').run({
          name,
          image
        });
        updated = true;
      } else {
        conn.prepare('INSERT INTO storage VALUES ($name, $image);').run({
          name,
          image
        });
      }

      deleteCommandMessages(msg, this.client);
      
      return msg.embed({
        description: stripIndents`__${updated ? `Updated \`${name}\`` : `Stored \`${name}\``}__
          **Name:** ${name}`,
        image: {url: image},
        color: msg.guild ? msg.guild.me.displayColor : 5759195,
        timestamp: new Date()
      });
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      if ((/(?:no such table)/i).test(err.toString())) {
        conn.prepare('CREATE TABLE IF NOT EXISTS storage (name TEXT PRIMARY KEY, image TEXT);').run();

        conn.prepare('INSERT INTO storage VALUES ($name, $image);').run({
          name,
          image
        });

        return msg.embed({
          description: stripIndents`__Stored \`${name}\`__
                  **Name:** ${name}`,
          image: {url: image},
          color: msg.guild ? msg.guild.me.displayColor : 5759195,
          timestamp: new Date()
        });
      }

      console.error(err);

      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};