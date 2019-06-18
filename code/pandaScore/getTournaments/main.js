let console = require('console')

const { getTournamentAPIData } = require('./client')
const { buildTournament } = require('./builder')

const getTournaments = (timezone, time, status, series) => {
  console.log('Getting tournaments')
  
  let apiResponse = getTournamentAPIData(time, status, 1, series)
  
  console.log(apiResponse ? apiResponse.length + ' tournament(s) found' : 'No tournaments found')
  
  let tournaments = []
  apiResponse.forEach((tournamentData) => { tournaments.push(buildTournament(tournamentData, timezone)) })
  
  return tournaments
}

module.exports = {
  getTournaments: getTournaments
}