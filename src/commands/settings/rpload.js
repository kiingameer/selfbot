/**
 * @file Settings rploadCommand - Loads a stored Rich Presence data set  
 * **Aliases**: ``
 * @module
 * @category settings
 * @name rpload
 * @param {Number} SaveSlot The saved data slot to load
 * @returns {MessageEmbed} Confirmation the rich presence data was loaded
 */

const {Command} = require('discord.js-commando'), 
  {oneLine, stripIndents} = require('common-tags'), 
  {deleteCommandMessages} = require('../../util.js');

module.exports = class rploadCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'rpload',
      memberName: 'rpload',
      group: 'settings',
      description: 'Loads a stored Rich Presence data set',
      format: 'SaveSlot',
      guildOnly: false,
      args: [
        {
          key: 'slot',
          prompt: 'What data slot to load?',
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
    try {
      const set = this.client.provider.get('global', 'rpsets')[slot];

      this.client.provider.set('global', 'rpappid', set.app);
      this.client.provider.set('global', 'rpname', set.name);
      this.client.provider.set('global', 'rpdetails', set.details);
      this.client.provider.set('global', 'rptype', set.type);
      this.client.provider.set('global', 'rpurl', set.url);
      this.client.provider.set('global', 'rpstate', set.state);
      this.client.provider.set('global', 'rplargeimage', set.largeImage);
      this.client.provider.set('global', 'rpsmallimage', set.smallImage);
      this.client.provider.set('global', 'rplargetext', set.largeImageText);
      this.client.provider.set('global', 'rpsmalltext', set.smallImageText);
      this.client.provider.set('global', 'rptoggletimeend', set.endTimeEnabled);
      this.client.provider.set('global', 'rptimeend', set.endTimeDuration);
      this.client.provider.set('global', 'rptimestamptoggle', set.timestamp);
      this.client.provider.set('global', 'rptoggle', set.richPresences);

      deleteCommandMessages(msg, this.client);

      return msg.embed({
        description: stripIndents`__Loaded Rich Presence Data Set__
        **Slot Number:** ${slot + 1}
        Reload rich presence with: \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}rpreload\`
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