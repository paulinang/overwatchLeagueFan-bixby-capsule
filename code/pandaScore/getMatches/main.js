let console = require('console')
let dates = require('dates')

const { getMatchAPIData } = require('./client')
const { buildMatch } = require('./builder')
const { parseAPITime } = require('../lib/dateTime')

const getMatches = (timezone, time, status, tournament) => {
  console.log('Getting matches')
  
  const apiResponse = getMatchAPIData(time, status, tournament)
  
  console.log(apiResponse ? apiResponse.length + ' match(es) found' : 'No matches found')
  
  let matches = []
  apiResponse.forEach((matchData) => { matches.push(buildMatch(matchData, timezone)) })
  
  return matches
}

module.exports = {
  getMatches: getMatches
}