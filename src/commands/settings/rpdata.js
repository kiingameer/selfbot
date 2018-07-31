/**
 * @file Settings rpdataCommand - View your currently set Rich Presence Data  
 * **Aliases**: `rdata`
 * @module
 * @category settings
 * @name rpdata
 * @returns {MessageEmbed} Confirmation the setting was stored
 */

const {Command} = require('discord.js-commando'), 
  {MessageEmbed} = require('discord.js'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class rpdataCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rpdata',
      memberName: 'rpdata',
      group: 'settings',
      aliases: ['rdata'],
      description: 'View your currently set Rich Presence data',
      examples: ['rpdata'],
      guildOnly: false
    });
  }

  run (msg) {
    const data = {
        app: this.client.provider.get('global', 'rpappid') ? this.client.provider.get('global', 'rpappid') : 'None set',
        name: this.client.provider.get('global', 'rpname') ? this.client.provider.get('global', 'rpname') : 'None set',
        details: this.client.provider.get('global', 'rpdetails') ? this.client.provider.get('global', 'rpdetails') : 'None set',
        type: this.client.provider.get('global', 'rptype') ? this.client.provider.get('global', 'rptype') : 'None set',
        url: this.client.provider.get('global', 'rpurl') ? this.client.provider.get('global', 'rpurl') : 'None set',
        state: this.client.provider.get('global', 'rpstate') ? this.client.provider.get('global', 'rpstate') : 'None set',
        largeImage: this.client.provider.get('global', 'rplargeimage') && this.client.provider.get('global', 'rpappid')
          ? `https://cdn.discordapp.com/app-assets/${this.client.provider.get('global', 'rpappid')}/${this.client.provider.get('global', 'rplargeimage')}.png`
          : 'https://favna.xyz/images/appIcons/selfbot.png',
        smallImage: this.client.provider.get('global', 'rpsmallimage') && this.client.provider.get('global', 'rpappid')
          ? `https://cdn.discordapp.com/app-assets/${this.client.provider.get('global', 'rpappid')}/${this.client.provider.get('global', 'rpsmallimage')}.png`
          : this.client.user.displayAvatarURL({format: 'png'}),
        largeImageText: this.client.provider.get('global', 'rplargetext') ? this.client.provider.get('global', 'rplargetext') : 'None set',
        smallImageText: this.client.provider.get('global', 'rpsmalltext') ? this.client.provider.get('global', 'rpsmalltext') : 'None set',
        endTimeEnabled: this.client.provider.get('global', 'rptoggletimeend') ? this.client.provider.get('global', 'rptoggletimeend') : 'Disabled',
        endTimeDuration: this.client.provider.get('global', 'rptimeend') ? this.client.provider.get('global', 'rptimeend') : '1 minute',
        timestamp: this.client.provider.get('global', 'rptimestamptoggle') ? this.client.provider.get('global', 'rptimestamptoggle') : 'None set',
        richPresences: this.client.provider.get('global', 'rptoggle') ? this.client.provider.get('global', 'rptoggle') : 'Disabled'
      },
      rpEmbed = new MessageEmbed();

    rpEmbed
      .setColor(msg.member !== null ? msg.member.displayHexColor : '#7CFC00')
      .setTimestamp()
      .setAuthor(`${this.client.user.tag} (${this.client.user.id})`)
      .setDescription(data.richPresences !== 'Disabled' ? 'Rich Presence Data' : 'Presence Data')
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