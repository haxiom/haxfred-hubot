const queryByName = require('./scryfall').queryByName;
const formatCard = require('./format-card');

const PURCHASE_PLACE_MAP = {
  tcgplayer: 'TCGplayer',
  card_kingdom: 'Card Kingdom',
  cardhoarder: 'Cardhoarder',
  mtgo_traders: 'MTGO Traders',
};

module.exports = function commandPrice (name) {
  return queryByName(name).then(function(card) {
    let message;
    let buttons = Object.keys(card.purchase_uris).reduce((array, key) => {
      if (key in PURCHASE_PLACE_MAP) {
        array.push({
          type: 'button',
          text: PURCHASE_PLACE_MAP[key],
          url: card.purchase_uris[key],
        });
      }

      return array;
    }, []);

    const { usd, tix } = card;

    if (usd && tix) {
      message = `$${card.usd} or ${card.tix} tickets`;
    } else if (usd) {
      message = `$${card.usd}`;
    } else if (tix) {
      message = `${card.tix} tickets`;
    } else {
      message = `Can't find price data for ${card.name}`;
    }

    return {
      fallback: card.name,
      color: card.colors,
      text: message,
      authorName: card.name,
      authorLink: card.scryfall_uri,
      authorIcon: card.image_uris && card.image_uris.normal,
      actions: buttons
    };
  })
}

