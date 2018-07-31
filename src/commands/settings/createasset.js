/**
 * @file Settings CreateAssetCommand - Create an asset on your Discord Application for Rich Presence  
 * **Aliases**: `uploadasset`, `ca`, `ua`
 * @module
 * @category settings
 * @name createasset
 * @example createasset large imgur
 * @param {large|small} AssetSize The size of the image to upload, either `large` or `small`
 * @returns {MessageEmbed} Confirmation the asset was uploaded
 */

const request = require('snekfetch'),
  {Command} = require('discord.js-commando'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class CreateAssetCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'createasset',
      memberName: 'createasset',
      group: 'settings',
      aliases: ['uploadasset', 'ca', 'ua'],
      description: 'Create an asset on your Discord Application for Rich Presence',
      examples: ['createasset large imgur'],
      guildOnly: false,
      args: [
        {
          key: 'name',
          prompt: 'name of the asset?',
          type: 'string'
        },
        {
          key: 'size',
          prompt: '`large` or `small` image?',
          type: 'string',
          validate: v => (/(large|big|small)/i).test(v) ? true : 'has to be either `large`, `big` or `small`',
          parse: (p) => {
            if ((/(large)/i).test(p)) {
              return 'BIG';
            }

            return p.toUpperCase();
          }
        },
        {
          key: 'image',
          prompt: 'URL of the image to upload?',
          type: 'string',
          validate: v => (/(https?:\/\/.*\.(?:png|jpg|webp|jpeg))/im).test(v) ? true : 'has to be a valid image URL (supported types: `png`, `jpg`, `jpeg`, `webp`)'
        }
      ]
    });
  }

  async run (msg, {image, name, size}) {
    const appID = this.client.provider.get('global', 'rpappid');

    try {
      const application = await this.client.fetchApplication(appID),
        {body} = await request.get(image),
        res = await application.createAsset(name, body, size);

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        description: stripIndents`__Uploaded Asset__
          **Name:** ${res.name}
          **ID:** ${res.id}
          **Size:** ${res.type === 2 ? 'large' : 'small'}`,
        image: {url: image},
        color: msg.guild ? msg.guild.me.displayColor : 5759195,
        timestamp: new Date()
      });
    } catch (err) {
      if ((/(Only bots can use this endpoint)/i).test(err.toString())) {
        return msg.reply(`You first need to set your application with the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}rpappid\` command!`);
      }

      console.error(err);

      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};