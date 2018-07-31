/**
 * @file Settings rpslotviewCommand - View the data in a specified slot  
 * @module
 * @category settings
 * @name rpslotview
 * @param {Number} SaveSlot Slot you want to view the data for
 * @returns {MessageEmbed} Data of the saved slot
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class rpslotviewCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rpslotview',
      memberName: 'rpslotview',
      group: 'settings',
      description: 'View the data in a specified slot',
      format: 'SaveSlot',
      guildOnly: false,
      args: [
        {
          key: 'slot',
          prompt: 'What slot do you want to view?',
          type: 'integer',
          validate: (v) => {
            v = parseInt(v, 10) - 1;
            const sets = this.client.provider.get('global', 'rpsets', []);

            return sets[v] ? true : 'there is no data in that slot, either give me a slot with some data or cancel the command and save some data';
          },
          parse: p => parseInt(p, 10) - 1
        }
      ]
    });
  }

  run (msg, {slot}) {
    /* eslint-disable sort-vars */
    const set = this.client.provider.get('global', 'rpsets')[slot],
      data = {
        app: set.app ? set.app : 'None set',
        name: set.name ? set.name : 'None set',
        details: set.details ? set.details : 'None set',
        type: set.type ? set.type : 'None set',
        url: set.url ? set.url : 'None set',
        state: set.state ? set.state : 'None set',
        largeImage: set.largeImage && set.app
          ? `https://cdn.discordapp.com/app-assets/${this.client.provider.get('global', 'rpappid')}/${this.client.provider.get('global', 'rplargeimage')}.png`
          : 'https://favna.xyz/images/appIcons/selfbot.png',
        smallImage: set.smallImage && set.app
          ? `https://cdn.discordapp.com/app-assets/${this.client.provider.get('global', 'rpappid')}/${this.client.provider.get('global', 'rpsmallimage')}.png`
          : this.client.user.displayAvatarURL({format: 'png'}),
        largeImageText: set.largeImageText ? set.largeImageText : 'None set',
        smallImageText: set.smallImageText ? set.smallImageText : 'None set',
        endTimeEnabled: set.endTimeEnabled ? set.endTimeEnabled : 'Disabled',
        endTimeDuration: set.endTimeDuration ? set.endTimeDuration : '1 minute',
        timestamp: set.timestamp ? set.timestamp : 'None set',
        richPresences: set.richPresences ? set.richPresences : 'Disabled',
        totalSlots: `\`${this.client.provider.get('global', 'rpsets').map((e, i) => i + 1).join('`, `')}\``
      },
      rpEmbed = new MessageEmbed();
    /* eslint-enable sort-vars */

    rpEmbed
      .setColor(msg.member !== null ? msg.member.displayHexColor : '#7CFC00')
      .setTimestamp()
      .setAuthor(`${this.client.user.tag} (${this.client.user.id})`)
      .setDescription(stripIndents`
      __Viewing data for saved slot number ${slot + 1}__
      **Other available slots:** ${data.totalSlots}`)
      .setThumbnail(data.smallImage)
      .setImage(data.largeImage)
      .addField('Name', data.name, true)
      .addField('Type', data.type, true)
      .addField('URL', data.url, true)
      .addField('State', data.state, true)
      .addField('Large Image', `[Click to open](${data.largeImage})`, true)
      .addField('Small Image', `[Click to open](${data.smallImage})`, true)
      .addField('Large Image Text', data.largeImageText, true)
      .addField('Small Image Text', data.smallImageText, true)
      .addField('End Time Enabled', data.endTimeEnabled, true)
      .addField('End Time Duration', data.endTimeDuration, true)
      .addField('Timestamp', data.timestamp, true)
      .addField('Rich Presences Enabled', data.richPresences, true)
      .addField('Application', data.app, false)
      .addField('Details', data.details, false);

    deleteCommandMessages(msg, this.client);

    return msg.embed(rpEmbed);
  }
};