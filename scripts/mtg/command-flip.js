const findClosestMatch = require('./find-closest-match');
const scryfall = require('./scryfall');
const formatCard = require('./format-card');

const SCRYFALL_CARD_BACK_IMAGE_URL = "https://img.scryfall.com/errors/missing.jpg";

function isMeldCard (card) {
	return card.layout === "meld";
}

function isTransformCard (card) {
	return card.layout === "transform";
}

function applyFaceInfo (cardFace, card) {
  card.name = cardFace.name;
  card.image_uris = cardFace.image_uris;
}

function getIdsForMeldCard (card) {
  const cardIsBackSide = card.collector_number.indexOf("b") > -1;
  let parts;

  if (cardIsBackSide) {
    parts = findPartsForFrontSideOfMeldCard(card);
  } else {
    parts = findPartsForBackSideOfMeldCard(card);
  }

  return parts.map(part => part.id);
};

function flipRegularCard (card) {
  return formatCard(card, {
    imageUrl: SCRYFALL_CARD_BACK_IMAGE_URL
  });
}

function flipMeldCard (card) {
  const ids = getIdsForMeldCard(card);

  let cards = ids.map((id) => {
    return scryfall.queryByScryfallId(id).then(function(card) {
      if (!card) {
        return Promise.reject(new Error(`:whomp: I thought "${name}" was dual-sided, but maybe not?`));
      }

      return formatCard(card);
    });
	});

  return Promise.all(cards);
}

function findPartsForFrontSideOfMeldCard (card) {
  return card.all_parts.filter(part => part.name !== card.name)
}

function findPartsForBackSideOfMeldCard (card) {
  card = card.all_parts.find(part => part.uri.match(/b$/));

  return [card];
}

function flipTransformCard (name, card) {
  const closestMatch = findClosestMatch(name, card.card_faces);

  if (card.card_faces[0].name === closestMatch.name) {
    applyFaceInfo(card.card_faces[1], card);
  } else {
    applyFaceInfo(card.card_faces[0], card);
  }

  return formatCard(card, {
    titleLink: card.scryfall_uri,
  });
}

function commandFlip (name) {
  return scryfall.queryByName(name).then(function(card) {
    let flipPromise;

    if (isMeldCard(card)) {
      flipPromise = flipMeldCard(card);
    } else if (isTransformCard(card)) {
      flipPromise = flipTransformCard(name, card);
    } else {
      flipPromise = flipRegularCard(card);
    }

    return flipPromise;
  });
}

commandFlip.isTransformCard = isTransformCard;
commandFlip.applyFaceInfo = applyFaceInfo;

module.exports = commandFlip;
