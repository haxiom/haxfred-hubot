const findClosestMatch = require('./find-closest-match');
const applyFaceInfo = require('./command-flip').applyFaceInfo;
const isTransformCard = require('./command-flip').isTransformCard;
const queryByName = require('./scryfall').queryByName;
const formatCard = require('./format-card');

module.exports = function commandShow (name) {
  return queryByName(name).then((card) => {
    if (isTransformCard(card)) {
      let cardFace = findClosestMatch(name, card.card_faces);

      applyFaceInfo(cardFace, card);
    }

    return formatCard(card);
  })
};
