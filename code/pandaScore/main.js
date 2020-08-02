const client = require('./client')
const parser = require('./parser')

let console = require('console')

const getSeries = (timezone, time, status) => {
  console.log('Getting series')
  
  const apiResponse = client.getSeriesAPIData(time, status)
  
  console.log(apiResponse ? apiResponse.length + ' series found' : 'No series found')
  
  let series = []
  apiResponse.forEach((seriesData) => { series.push(parser.parseEvent(seriesData, timezone)) })
  
  return series
}

const getTournaments = (timezone, time, status, series) => {
  console.log('Getting tournaments')
  
  let apiResponse = client.getTournamentAPIData(time, status, 1, series)
  
  console.log(apiResponse ? apiResponse.length + ' tournament(s) found' : 'No tournaments found')
  
  let tournaments = []
  apiResponse.forEach((tournamentData) => { tournaments.push(parser.parseEvent(tournamentData, timezone)) })
  
  return tournaments
}

const getMatches = (timezone, time, team, status, tournament) => {
  console.log('Getting matches')
  
  const apiResponse = client.getMatchAPIData(time, team, status, tournament)
  
  console.log(apiResponse ? apiResponse.length + ' match(es) found' : 'No matches found')
  
  let matches = []
  apiResponse.forEach((matchData) => { matches.push(parser.parseMatch(matchData, timezone)) })
  
  return matches
}

module.exports = {
  getSeries: getSeries,
  getTournaments: getTournaments,
  getMatches: getMatches
}