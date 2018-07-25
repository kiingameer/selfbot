/**
 * @file Info StatusCommand - Change your bot's current status  
 * **NOTE**: This does not affect the status you see in your own Discord client! Only the status of the bot instance!  
 * **Aliases**: `stat`
 * @module
 * @category status
 * @name status
 * @example status dnd
 * @param {StringResolvable} StatusToSet The status you would like to set for the bot
 * @returns {MessageEmbed} Confirmation the status was changed
 */

const {Command} = require('discord.js-commando'),  
  {stripIndents} = require('common-tags'), 
  {capitalizeFirstLetter, deleteCommandMessages} = require('../../util.js');

module.exports = class StatusCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'status',
      memberName: 'status',
      group: 'info',
      aliases: ['stat'],
      description: 'Change your bot\'s current status',
      details: '**NOTE**: This does not affect the status you see in your own Discord client! Only the status of the bot instance!',
      format: 'StatusToSet',
      examples: ['status online'],
      guildOnly: false,
      args: [
        {
          key: 'status',
          prompt: 'What status do you want to set for the bot?',
          type: 'string',
          validate: v => ['online', 'idle', 'dnd', 'offline'].includes(v) ? true : 'has to be one of `online`, `idle`, `dnd`, or `offline`' // eslint-disable-line no-confusing-arrow
        }
      ]
    });
  }

  statusParser (status) {
    if (status === 'dnd') {
      return 'Do Not Disturb';
    }

    return capitalizeFirstLetter(status);
  }

  run (msg, {status}) {
    const prevStatus = this.client.user.presence.status;

    this.client.user.setStatus(status);

    deleteCommandMessages(msg, this.client);

    return msg.embed({
      description: stripIndents`__Bot Status Changed__
        **Previous Status:** ${this.statusParser(prevStatus)}
        **New Status:** ${this.statusParser(status)}`,
      color: msg.guild ? msg.member.displayColor : 5759195,
      timestamps: new Date()
    });
  }
};