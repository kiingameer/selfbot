/**
 * @file Settings rpsaveCommand - Saves your current rich presence data set  
 * @module
 * @category settings
 * @name rpsave
 * @param {Number} [SaveSlot] Slot to save to or next possible if not provided
 * @returns {MessageEmbed} Confirmation the rich presence data was saved
 */

const {Command} = require('discord.js-commando'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class rpsaveCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rpsave',
      memberName: 'rpsave',
      group: 'settings',
      description: 'Saves your current rich presence data set',
      format: '[SaveSlot]',
      guildOnly: false,
      args: [
        {
          key: 'slot',
          prompt: 'What slot to save the data to?',
          type: 'integer',
          default: 'next',
          validate: v => v > 0 ? true : 'has to be a value greater than 0' // eslint-disable-line no-confusing-arrow
        }
      ]
    });
  }

  run (msg, {slot}) {
    try {
      const data = {
          app: this.client.provider.get('global', 'rpappid', ''),
          name: this.client.provider.get('global', 'rpname', ''),
          details: this.client.provider.get('global', 'rpdetails', ''),
          type: this.client.provider.get('global', 'rptype', ''),
          url: this.client.provider.get('global', 'rpurl', ''),
          state: this.client.provider.get('global', 'rpstate', ''),
          largeImage: this.client.provider.get('global', 'rplargeimage', ''),
          smallImage: this.client.provider.get('global', 'rpsmallimage', ''),
          largeImageText: this.client.provider.get('global', 'rplargetext', ''),
          smallImageText: this.client.provider.get('global', 'rpsmalltext', ''),
          endTimeEnabled: this.client.provider.get('global', 'rptoggletimeend', ''),
          endTimeDuration: this.client.provider.get('global', 'rptimeend', ''),
          timestamp: this.client.provider.get('global', 'rptimestamptoggle', ''),
          richPresences: this.client.provider.get('global', 'rptoggle', '')
        },
        sets = this.client.provider.get('global', 'rpsets', []);

      slot !== 'next' && slot > sets.length ? slot = 'next' : null;
      slot === 'next' ? sets.push(data) : sets[slot - 1] = data;
      this.client.provider.set('global', 'rpsets', sets);

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        description: stripIndents`__Stored Rich Presence Data Set__
        **Slot Number:** ${slot === 'next' ? sets.length : slot}
        Load data with: \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}rpload\`
        View current data with: \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}rpdata\`
        `,
        color: msg.guild ? msg.member.displayColor : 5759195,
        timestamp: new Date()
      });
    } catch (err) {
      console.error(err);

      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};