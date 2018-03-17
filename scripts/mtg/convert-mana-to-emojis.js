module.exports = function applyManaEmojis(text) {
  return text.replace(/{(.)(\/(.))?}/g, ':mana-$1$3:');
};

