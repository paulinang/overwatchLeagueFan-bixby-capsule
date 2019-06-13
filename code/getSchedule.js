let console = require('console')

const { getMatches } = require('./getMatches/main')
const { getSeries } = require('./getSeries/main')
const { getTournaments } = require('./getTournaments/main')
// const getMatchVideoUrl = require('./getMatchVideoUrl').function

module.exports.function = function getSchedule ($vivContext, time, status) {
  console.log('Getting Overwatch League schedule')
  
  const timezone = $vivContext.timezone
  
  const series = getSeries(timezone, time, status)
  const tournaments = getTournaments(timezone, time, status, series)
  const matches = getMatches(timezone, time, status, tournaments)
  
  // matches[0].videoUrl = getMatchVideoUrl(matches[0])
  
  return {
    all: true, // always true
    series: series,
    tournaments: tournaments,
    matches: matches
  }
}
