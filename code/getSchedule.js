let console = require('console')
let config = require('config')
let fail = require('fail')

const { getMatches } = require('./getMatches/main')
const { getSeries } = require('./getSeries/main')
const { getTournaments } = require('./getTournaments/main')

module.exports.function = function getSchedule ($vivContext, time) {
  console.log('Getting Overwatch League schedule')
  const timezone = $vivContext.timezone
  
  let series, tournaments, matches
  
  if (!time) {
    // ex. "Get me the schedule" "What's the league schedule"
    // user didn't specify inputs, get 'running' (in progress) series
    let currentSeries = getSeries(timezone, undefined, 'running') 
    
    if (!currentSeries || currentSeries.length == 0) {
      // no running series -- throw off season error
      throw fail.checkedError(
        'Off season, give last season results + when next season starts',
        'OffSeason',
        {}
      )
    } else {
      // if there is a 'running' series, get 'running' tournament
      let currentTournament = getTournaments(timezone, undefined, 'running', currentSeries[0])
      if (!currentTournament || currentTournament.length == 0) {
        // TODO: get last tournament results + when next tournament begins
      } else {
        // current tournament -> get current + upcoming matches
        let currentMatch = getMatches(timezone, time, 'running', currentTournament[0])
        let upcomingMatches = getMatches(timezone, time, 'upcoming', currentTournament[0])
        matches = currentMatch ? currentMatch.concat(upcomingMatches) : upcomingMatches
      }
    }
  } else {
    matches = getMatches(timezone, time)
  }
  
  return {
    all: true, // always true
    series: currentSeries ? currentSeries : series,
    tournaments: currentTournament  ? currentTournament : tournaments,
    matches: matches,
    leagueUrl: config.get('overwatchLeague.url')
  }
}
