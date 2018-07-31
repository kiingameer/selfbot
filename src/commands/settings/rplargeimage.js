/**
 * @file Settings RPLargeImageCommand - Set your Rich Presence Large Image  
 * **Aliases**: `largeimage`, `limage`
 * @module
 * @category settings
 * @name rplargeimage
 * @example rplargeimage 450426682151534602
 * @param {StringResolvable} LargeImage Either the name or ID of the large image
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class rplargeimageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rplargeimage',
      memberName: 'rplargeimage',
      group: 'settings',
      aliases: ['largeimage', 'limage'],
      description: 'Set your Rich Presence Large Image',
      format: 'LargeImageID|LargeImageName',
      examples: ['rplargeimage 450426682151534602'],
      guildOnly: false,
      args: [
        {
          key: 'largeimage',
          prompt: 'What is the LargeImageID for the "large" Rich Presence image you want?',
          type: 'string',
          label: 'largeimageID',
          default: 'large'
        }
      ]
    });
  }

  async run (msg, {largeimage}) {
    const appID = this.client.provider.get('global', 'rpappid');

    try {
      const application = await this.client.fetchApplication(appID),
        assets = await application.fetchAssets(),
        img = assets.find(asset => asset.name === largeimage);

      if ((/(small)/i).test(img.type)) {
        throw new Error('incorrect size');
      }

      this.client.provider.set('global', 'rplargeimage', img.id);

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        description: stripIndents`__Large Image Stored__
          **Name:** ${img.name}
          **ID:** ${img.id}
          **Size:** ${img.type.toLowerCase()}`,
        image: {url: `https://cdn.discordapp.com/app-assets/${appID}/${img.id}.png`},
        color: msg.guild ? msg.member.displayColor : 5759195,
        timestamp: new Date()
      });
    } catch (err) {
      if ((/(Only bots can use this endpoint)/i).test(err.toString())) {
        return msg.reply(`You first need to set your application with the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}rpappid\` command!`);
      } else if ((/(incorrect size)/i).test(err.toString())) {
        return msg.reply(oneLine`
          That image is a small image, not a large image.
          Please upload the image with the correct size using \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createasset\``);
      } else if ((/(Cannot read property 'type' of undefined)/i).test(err.toString())) {
        return msg.reply(oneLine`
          cannot find \`${largeimage}\` in application \`${appID}\`
          Please upload the image using \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createasset\``);
      }

      return console.error(err);
    }
  }
};