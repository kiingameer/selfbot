/**
 * @file Extra TranslateCommand - Translate any word from any language to any other language  
 * Language specifications can be either 1 or 2 letter ISO 639 or full names  
 * **Aliases**: `tr`
 * @module
 * @category extra
 * @name translate
 * @example translate en nl Hello World
 * @param {StringResolvable} FromLanguage The language to translate from
 * @param {StringResolvable} ToLanguage The language to translate to
 * @param {StringResolvable} Text The word or text to translate
 * @returns {MessageEmbed} The input and output of the translation
 */

const translate = require('translate'),
  unescape = require('unescape-es6'),
  {Command} = require('discord.js-commando'),
  {MessageEmbed} = require('discord.js'),
  {oneLine, stripIndents} = require('common-tags'),
  {deleteCommandMessages} = require('../../util.js');

module.exports = class TranslateCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'translate',
      memberName: 'translate',
      group: 'extra',
      aliases: ['tr'],
      description: 'Translate any word from any language to any other language',
      details: 'Language specifications can be either 1 or 2 letter ISO 639 or full names',
      format: 'FromLanguage ToLanguage Text',
      examples: ['translate en nl Hello World'],
      guildOnly: false,
      args: [
        {
          key: 'fromlang',
          prompt: 'Translate from which language?',
          type: 'string'
        },
        {
          key: 'tolang',
          prompt: 'Translate to which language?',
          type: 'string'
        },
        {
          key: 'text',
          prompt: 'Translate what?',
          type: 'string'
        }
      ]
    });
  }

  async run (msg, {fromlang, tolang, text}) {
    try {
      translate.engine = 'google';
      translate.key = process.env.googleapikey;

      const transEmbed = new MessageEmbed(),
        translation = await translate(text, {
          from: fromlang,
          to: tolang
        });

      transEmbed
        .setColor(msg.guild ? msg.guild.me.displayHexColor : '#7CFC00')
        .setTitle(`__Translating from ${fromlang.toUpperCase()} to ${tolang.toUpperCase()}__`)
        .setDescription(stripIndents`
        \`${text}\`
        
        ${unescape`${translation}`}`);

      deleteCommandMessages(msg, this.client);
      
      return msg.embed(transEmbed);
    } catch (err) {
      deleteCommandMessages(msg, this.client);
      if ((/(?:not part of the ISO 639)/i).test(err.toString())) {
        return msg.reply('either your from language or to language was not recognized. Please use ISO 639-1 codes for the languages (<https://en.wikipedia.org/wiki/ISO_639-1>)');
      }

      console.error(err);
      
      return msg.reply(oneLine`Woops! something went horribly wrong there, the error was logged to the console.
      Want to know more about the error? Join the support server by getting an invite by using the \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}invite\` command `);
    }
  }
};