const distance = require("levenshtein");

module.exports = function findClosestMatch (searchTerm, cards) {
  if (cards.length === 1) {
    return cards[0];
  }

	cards.forEach((card) => {
    card.distance = distance(searchTerm, card.name.toLowerCase());
  });

  return (cards.sort((a, b) => a.distance - b.distance))[0];
};
