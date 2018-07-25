/**
 * @file Info PurgeCommand - Purge your own messages, given a certain amount (defaults to 5)  
 * **Aliases**: `clear`, `delete`, `prune`
 * @module
 * @category info
 * @name purge
 * @example purge 5
 * @param {NumberResolvable} [AnyNumber] The amount of messages you want to purge
 * @returns {MessageEmbed} Confirmation the messages were deleted
 */

const {Command} = require('discord.js-commando');

module.exports = class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      memberName: 'purge',
      group: 'info',
      aliases: ['clear', 'delete', 'prune'],
      description: 'Purge your own messages, given a certain amount (defaults to 5)',
      format: 'AmountOfMessages',
      examples: ['purge 5'],
      guildOnly: false,
      args: [
        {
          key: 'amount',
          prompt: 'How many messages should I purge?',
          min: 1,
          max: 100,
          type: 'integer',
          default: 5
        }
      ]
    });
  }

  async run (msg, {amount}) {
    const filteredMsg = msg.channel.messages.filter(storedMessage => storedMessage.author.id === msg.author.id).sort((a, b) => b.createdTimestamp - a.createdTimestamp),
      storedAmount = amount;

    amount !== 100 ? amount++ : null;

    for (const message of filteredMsg) {
      if (amount <= 0) {
        break;
      } else {
        message[1].delete();
        amount--;
      }
    }

    const reply = await msg.say(`\`Deleting your ${storedAmount} last message(s)\``); // eslint-disable-line one-var

    return reply.delete({
      timeout: 1000,
      reason: 'Deleting own return message after purge'
    });
  }
};