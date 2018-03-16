const https = require('https');

const findClosestMatch = require('./find-closest-match');

const SCRYFALL_API_ENDPOINT = "https://api.scryfall.com/";

function queryScryfall (endpoint) {
  const queryUrl = `${SCRYFALL_API_ENDPOINT}${endpoint}`;

  return new Promise(function(resolve, reject) {
    return https.get(queryUrl, (response) => {
      let body = '';

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        const response = JSON.parse(body);
        resolve(response);
      });
    }).on('error', reject);
  });
};

function getScryfallEndpoint (uri) {
	return uri.split(SCRYFALL_API_ENDPOINT)[1];
}

function queryByScryfallId (id) {
	return queryScryfall(`cards/${id}`);
}

function queryBySearchTerm (searchTerm, additionalQueries) {
  searchTerm = searchTerm.replace(/’/, "'"); // slack sends smart quotes :shakesfist:
  let endpoint = `cards/search?q=${encodeURIComponent(searchTerm)}`;
  if (additionalQueries) { endpoint = endpoint + `&${additionalQueries}`; }

  return queryScryfall(endpoint).then(response => response.data);
}

function queryByName (name) {
  return queryBySearchTerm(name).then(function(cards) {
    if (cards && cards.length > 0) {
			return findClosestMatch(name, cards);
		} else {
      return Promise.reject(new Error(`:whomp: Couldn't find any cards with a name like \"${name}\".`));
    }
  });
}

function lookupCardsInSet (setCode) {
	return queryBySearchTerm(`set:${setCode}`, "order=spoiled&dir=desc")
}

module.exports = {
  getScryfallEndpoint,
  lookupCardsInSet,
  queryScryfall,
  queryByScryfallId,
  queryBySearchTerm,
  queryByName,
};
