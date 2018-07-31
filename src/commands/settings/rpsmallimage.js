/**
 * @file Settings RPSmallImageCommand - Set your Rich Presence Small Image  
 * **Aliases**: `smallimage`, `simage`
 * @module
 * @category settings
 * @name rpsmallimage
 * @example smallimage 450426771276431390
 * @param {StringResolvable} SmallImage Either the name or ID of the small image
 * @returns {Message} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class RPSmallImageCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rpsmallimage',
      memberName: 'rpsmallimage',
      group: 'settings',
      aliases: ['smallimage', 'simage'],
      description: 'Set your Rich Presence SmallImage ID',
      format: 'SmallImageID|SmallImageName',
      examples: ['rpsmallimage 450426771276431390'],
      guildOnly: false,
      args: [
        {
          key: 'smallimage',
          prompt: 'What is the SmallImageID for the "small" Rich Presence image you want?',
          type: 'string',
          label: 'smallimageID'
        }
      ]
    });
  }

  async run (msg, {smallimage}) {
    const appID = this.client.provider.get('global', 'rpappid');

    try {
      const application = await this.client.fetchApplication(appID),
        assets = await application.fetchAssets(),
        img = assets.find(asset => asset.name === smallimage);

      if ((/(big)/i).test(img.type)) {
        throw new Error('incorrect size');
      }

      this.client.provider.set('global', 'rpsmallimage', img.id);

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        description: stripIndents`__Small Image Stored__
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
          That image is a large image, not a small image.
          Please upload the image with the correct size using \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createasset\``);
      } else if ((/(Cannot read property 'type' of undefined)/i).test(err.toString())) {
        return msg.reply(oneLine`
          cannot find \`${smallimage}\` in application \`${appID}\`
          Please upload the image using \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}createasset\``);
      }

      return console.error(err);
    }
  }
};