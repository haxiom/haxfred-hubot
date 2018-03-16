const RELATED_LINKS_MAP = {
  scryfall: 'Scryfall',
  gatherer: 'Gatherer',
  edhrec: 'EDHREC',
  mtgtop8: 'MTGTop8'
};

function makeButton(name, link) {
  return {
    type: 'button',
    text: name,
    url: link
  };
}

module.exports = function formatCard (card, overrides) {
  let actions = [];

  if (card.scryfall_uri && card.related_uris) {
    actions = [
      makeButton(RELATED_LINKS_MAP.scryfall, card.scryfall_uri)
    ].concat(Object.keys(card.related_uris).reduce((buttons, key) => {
      if (key in RELATED_LINKS_MAP) {
        buttons.push(makeButton(RELATED_LINKS_MAP[key], card.related_uris[key]));
      }

      return buttons;
    }, []));
  }

  return Object.assign({
    fallback: `${card.name} - ${card.image_uris && card.image_uris.normal}`,
    color: card.colors,
    imageUrl: card.image_uris && card.image_uris.normal,
    actions: (overrides && overrides.actions) || actions
  }, overrides);
};
