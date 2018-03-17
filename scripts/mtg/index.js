const commandShow = require('./command-show');
const commandFlip = require('./command-flip');
const commandRulings = require('./command-rulings');
const commandQuery = require('./command-query');
const commandPrice = require('./command-price');
const commandSpoilers = require('./command-spoilers');

const sendToSlack = require('./send-to-slack');

const CARD_DISPLAY_COMMANDS = {
  flip: commandFlip,
  price: commandPrice,
  $: commandPrice,
  query: commandQuery,
  rulings: commandRulings
}

const COMMANDS_WITH_SPECIAL_BEHAVHIOR = {
  spoilers: true
}

function makeMTGRegex(keyword) {
  return new RegExp(`(?:magic|mtg)\\s+${keyword}\\s*$`, 'i');
}

module.exports = (robot) => {
  // spoiler feed command
  robot.respond(makeMTGRegex('spoilers( (.*\\S))?'), (msg) => {
    let setCode = msg.match[2];

    commandSpoilers(msg, setCode).catch((err => msg.send(err)));
  });

  // show cards commands
  robot.respond(makeMTGRegex('(.*\\S)'), function(msg) {
    const command = msg.match[1];
    const match = /^([.\S]*)(.*)$/i.exec(command);
    const subCommand = match[1];

    let query = match[2];

    if (subCommand in COMMANDS_WITH_SPECIAL_BEHAVHIOR) {
      return;
    }

    let commandPromise = CARD_DISPLAY_COMMANDS[subCommand];

    if (!commandPromise) {
      commandPromise = commandShow;
      query = command;
    }

    commandPromise(query)
      .then(result => sendToSlack(msg, result))
      .catch(err => {
        console.log(err);
        msg.send(err.message);
      });
  });
};
