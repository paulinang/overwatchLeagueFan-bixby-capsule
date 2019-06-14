let console = require('console')
let config = require('config')

const { getMatches } = require('./getMatches/main')
const { getSeries } = require('./getSeries/main')
const { getTournaments } = require('./getTournaments/main')
// const getMatchVideoUrl = require('./getMatchVideoUrl').function

module.exports.function = function getSchedule ($vivContext, time, status) {
  console.log('Getting Overwatch League schedule')
  const timezone = $vivContext.timezone
  
  let series, tournaments, matches
  
  // if user asked for a specific time/ status, we don't need to get series/ tournaments, just go straight to matches
  if (time || status) {
    matches = getMatches(timezone, time, status)
  } else {
    series = getSeries(timezone, time, status)
    tournaments = getTournaments(timezone, time, status, series)
    matches = getMatches(timezone, time, status, tournaments)
    
  }
  
  return {
    all: true, // always true
    series: series,
    tournaments: tournaments,
    matches: matches,
    leagueUrl: config.get('overwatchLeague.url')
  }
}
