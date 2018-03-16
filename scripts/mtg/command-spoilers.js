const scryfall = require('./scryfall');
const formatCard = require('./format-card');
const sendToSlack = require('./send-to-slack');

const spoilerCache = {};

const FIFTEEN_MINUTES = 900000;
const TEN_HOURS = 36000000;

function makeFullSpoilerButton (set) {
  return [{
    type: 'button',
    text: 'See All Spoilers',
    url: `${set.scryfall_uri}?order=spoiled`
  }];
}

function stopSpoilerPolling (setCode) {
  const cache = spoilerCache[setCode];

  if (!cache) { return; }

  if (cache.pollInterval) { clearInterval(cache.pollInterval); }
  if (cache.pollTimeout) { clearTimeout(cache.pollTimeout); }
}

function startSpoilerPolling (msg, setCode) {
  const cache = spoilerCache[setCode];

  stopSpoilerPolling(setCode);

  cache.pollTimeout = setTimeout(() => {
    msg.send(`Spoiler lookup for ${setCode} has been running for 10 hours. Stopping spoilers. Start again by typing \`${process.env.HUBOT_SLACK_BOTNAME} mtg spoilers ${setCode}\`.`);
    stopSpoilerPolling(setCode);
  }, TEN_HOURS);

  cache.pollInterval = setInterval(() => {
    scryfall.lookupCardsInSet(setCode).then((cards) => {
      const latestSpoiler = cards[0];

      if (latestSpoiler.id === cache.id) { return; }

      const oldSpoilerId = cache.latestSpoiler;
      cache.latestSpoiler = latestSpoiler.id;

      cards.find((spoiler) => {
        let type;
        if (oldSpoilerId === spoiler.id) { return true; }

        if (spoiler.reprint) {
          type = "Reprint";
        } else {
          type = "New Card";
        }

        sendToSlack(msg, formatCard(spoiler, {
          footer: type,
          actions: makeFullSpoilerButton(cache.set)
        }));
      });
    });
  }, FIFTEEN_MINUTES);
}

module.exports = function commandSpoilers (msg, setCode) {
  let set;
  let lookupSetPromise;

  if (setCode === "cancel") {
    Object.keys(spoilerCache).forEach((key) => {
      msg.send(`Stopping spoilers for ${spoilerCache[key].set.name}.`);
      stopSpoilerPolling(key);
      delete spoilerCache[key];
    });
    return Promise.resolve();
  }

  if (!setCode) {
    lookupSetPromise = scryfall.queryScryfall('sets').then(response => response.data[0]);
  } else if (spoilerCache[setCode] && spoilerCache[setCode].set) {
    lookupSetPromise = Promise.resolve(spoilerCache[setCode].set);
  } else {
    lookupSetPromise = scryfall.queryScryfall(`sets/${setCode}`);
  }

  return lookupSetPromise.then((result) => {
    set = result;
    if (set.object === "error") { throw set; }

    spoilerCache[set.code] = spoilerCache[set.code] || {};
    spoilerCache[set.code].set = set;

    msg.send(`Watching for spoilers for ${set.name}...`);

    return scryfall.lookupCardsInSet(set.code);
  }).then((cards) => {
    const latestSpoiler = cards[0];

    if (spoilerCache[set.code].latestSpoiler === latestSpoiler.id) {
      msg.send(`No new spoilers since *${latestSpoiler.name}* was spoiled.`);
    } else {
      spoilerCache[set.code].latestSpoiler = latestSpoiler.id;
      sendToSlack(msg, formatCard(latestSpoiler, {
        footer: `Most recent spoiler for ${set.name}`,
        actions: makeFullSpoilerButton(set)
      }));
    }

    return startSpoilerPolling(msg, set.code);
  }).catch(error => msg.send(`Could not find spoilers for set code \`${setCode}\``));
};
