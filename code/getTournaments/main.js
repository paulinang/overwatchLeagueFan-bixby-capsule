let console = require('console')

const { getTournamentAPIData } = require('./client')
const { buildTournament } = require('./builder')

const concatLastNextTournaments = (lastTournament, nextTournament) => {
  if (lastTournament) {
    if (nextTournament) {
      return lastTournament.concat(nextTournament)
    } else {
      return lastTournament
    }
  } else if (nextTournament) {
    return nextTournament
  }
}

const getTournaments = (timezone, time, status, series) => {
  console.log('Getting tournaments')
  
  let apiResponse
  if (!time && !status && series) {
    // user gave no inputs, there should be a relevant series to get tournaments for
    let currentSeries, lastSeries, nextSeries
    let lastTournament, nextTournament
    series.forEach((x) => {
      if (x.status === 'InProgress') {
        currentSeries = x
      } else if (x.status === 'Past') {
        lastSeries = x
      } else if (x.status === 'Upcoming') {
        nextSeries = x
      }
    })
    
    // user gave no inputs, there should be a relevant series to get tournaments for
    if (currentSeries) {
      // if there is a series in progress
      // try to get in progress tournament first
      apiResponse = getTournamentAPIData(time, 'running', 1, currentSeries)

      if (!apiResponse || apiResponse.length === 0) {
        // no in progress tournament -> get last tourney and next tourney
        lastTournament = getTournamentAPIData(time, 'past', 1, currentSeries)
        nextTournament = getTournamentAPIData(time, 'upcoming', 1, currentSeries)
        apiResponse = concatLastNextTournaments(lastTournament, nextTournament)
      }
    } else {
      // there are series but not in progress (so there'll be past and future)
      lastTournament = getTournamentAPIData(time, 'past', 1, lastSeries || nextSeries)
      nextSeries = getTournamentAPIData(time, 'past', 1, lastSeries || nextSeries)
      piResponse = concatLastNextTournaments(lastTournament, nextTournament)
    }
  } else {
    // user requested a time and/or status
    apiResponse = getTournamentAPIData(time, status)
  }
  
  console.log(apiResponse ? apiResponse.length + ' tournament(s) found' : 'No tournaments found')
  
  let tournaments = []
  apiResponse.forEach((tournamentData) => { tournaments.push(buildTournament(tournamentData, timezone)) })
  
  return tournaments
}

module.exports = {
  getTournaments: getTournaments
}