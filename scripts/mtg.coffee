# Description:
#   Displays Magic: The Gathering cards and/or information about them
#
# Dependencies:
#   levenshtein
#
# Configuration:
#   None
#
# Commands:
#   hubot (magic|mtg) <name> - Display a Magic: The Gathering card named <name>
#   hubot (magic|mtg) flip <name> - Display the reverse side of a Magic: The Gathering card named <name>
#   hubot (magic|mtg) (price|$) <name> - Display the prices for a Magic: The Gathering card named <name>
#   hubot (magic|mtg) rulings <name> - Display the rulings for a Magic: The Gathering card named <name>
#   hubot (magic|mtg) spoilers [<set_symbol>] - Start polling for spoilers for a specific set. Polling is set for every fifteen minutes and stops completely after 10 hours. If no set is specified, dog will look for the most recent set
#   hubot (magic|mtg) spoilers cancel - Stop all active spoiler feeds

module.exports = require './mtg/index'
