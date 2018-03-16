const scryfall = require('./scryfall');

module.exports = function commandRulings (name) {
  let card = null;

  return scryfall.queryByName(name).then(function(response) {
    card = response;

    const rulingsEndpoint = scryfall.getScryfallEndpoint(card.rulings_uri);

    return scryfall.queryScryfall(rulingsEndpoint);
  }).then(function(response) {
    const rulings = response.data.map((rule) => {
      return {
        title: rule.published_at,
        value: rule.comment,
        short: false
      };
    });
    const message = rulings.length === 0 ? `There are no rulings for ${card.name}` : '';

    return {
      fallback: card.name,
      color: card.colors,
      text: message,
      fields: rulings,
      authorName: card.name,
      authorLink: card.scryfall_uri,
      authorIcon: card.image_uris && card.image_uris.normal,
    };
  });
};
