const findClosestMatch = require('./find-closest-match');
const applyFaceInfo = require('./command-flip').applyFaceInfo;
const convertManaToEmojis = require('./convert-mana-to-emojis');
const queryBySearchTerm = require('./scryfall').queryBySearchTerm;

function formatRulesText(card) {
  let message = `
${card.type_line}
${card.oracle_text}`;

  if (card.flavor_text) {
    message += `
_${card.flavor_text}_`;
  }

  if (card.power && card.toughness) {
    message += `
*${card.power}/${card.toughness}*`;
  }

  return convertManaToEmojis(message);
}

module.exports = function commandQuery (searchTerm) {
  return queryBySearchTerm(searchTerm, null, true).then((response) => {
    if (response.object === 'error') {
      return Promise.reject(new Error(response.details));
    }
    let cards = response.data;
    let totalNumberOfCards = response.total_cards;
    let hasMoreThanFiveCards = totalNumberOfCards > 5;

    if (hasMoreThanFiveCards) {
      cards = cards.slice(0, 5);
    }

    cards = cards.map((card) => {
      if (!card.image_uris && card.card_faces) {
        let cardFace = findClosestMatch(card.name, card.card_faces);

        applyFaceInfo(cardFace, card);
      }

      return {
        fallback: card.name,
        color: card.colors,
        title: convertManaToEmojis(`${card.name} ${card.mana_cost}`),
        titleLink: card.scryfall_uri,
        thumbUrl: card.image_uris.normal,
        text: formatRulesText(card)
      };
    });

    if (hasMoreThanFiveCards) {
      let moreCardsTotal = totalNumberOfCards - 5;
      let isPlural = moreCardsTotal > 1;
      let overflowMessage = `Found ${moreCardsTotal} more card${isPlural ? 's' : ''} than ${isPlural ? 'are' : 'is'} listed here.`;

      cards.push({
        fallback: overflowMessage,
        text: overflowMessage,
        actions: [{
          type: 'button',
          text: 'See all results',
          url: `https://scryfall.com/search?q=${encodeURIComponent(searchTerm)}`
        }]
      });
    }

    return cards;
  });
};
