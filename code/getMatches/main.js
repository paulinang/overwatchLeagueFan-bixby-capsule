let console = require('console')
let dates = require('dates')

const { getMatchAPIData } = require('./client')
const { buildMatch } = require('./builder')
const { parseAPITime } = require('../lib/dateTime')

const buildQueryStringFromMatchDay = (match, timezone) => {
  let queryString = []
  let matchStart = new dates.ZonedDateTime.parseDateTime(match.begin_at).withZoneSameInstant(timezone)
  queryString.push(matchStart.atStartOfDay().toIsoString())
  queryString.push(matchStart.atEndOfDay().toIsoString())
  return queryString
}

const getMatches = (timezone, time, status, tournaments) => {
  console.log('Getting matches')
  
  let apiResponse
  
  if (!time && !status && tournaments) {
    // user gave no inputs, there should be a relevant tournament(s) to get matches for
    let currentTournament, lastTournament, nextTournament
    // we try to give all matches in a day
    let lastMatch, nextMatch
    tournaments.forEach((x) => {
      if (x.status === 'InProgress') {
        currentTournament = x
      } else if (x.status === 'Past') {
        lastTournament = x
      } else if (x.status === 'Upcoming') {
        nextTournament = x
      }
    })
    
    if (currentTournament) {
      // if there is a tourney in progress
      // try to get in progress match first + all matches in that day
      const currentMatch = getMatchAPIData(time, 'running', 1, currentTournament)
      if (currentMatch && currentMatch.length === 1) {
        // make requested event status undfeined as we wants all matches in that day (past, running, upcoming)
        apiResponse = getMatchAPIData({ queryString: buildQueryStringFromMatchDay(currentMatch[0], timezone) })
      }
      
      if (!apiResponse || apiResponse.length === 0) {
        // no in progress matches for the current tourney
        // try to get next day of matches
        nextMatch = getMatchAPIData(time, 'upcoming', 1, currentTournament)
        if (nextMatch && nextMatch.length === 1) {
          apiResponse = getMatchAPIData({ queryString: buildQueryStringFromMatchDay(nextMatch[0], timezone) })
        }
          
        if (!apiResponse || apiResponse.length === 0) {
          // if we couldn't get matches for the next day, try to get last day of matches
          lastMatch = getMatchAPIData(time, 'past', 1, currentTournament)
          if (lastMatch && lastMatch.length === 1) {
            apiResponse = getMatchAPIData({ queryString: buildQueryStringFromMatchDay(lastMatch[0], timezone) })
          }
        }
      }
    } else {
      // there are tournaments but not in progress (so there'll be upcoming or past day of matches)
      if (nextTournament) {
        nextMatch = getMatchAPIData(time, 'upcoming', 1, nextTournament)
        if (nextMatch && nextMatch.length === 1) {
          apiResponse = getMatchAPIData({ queryString: buildQueryStringFromMatchDay(nextMatch[0], timezone) })
        }
      } else if (lastTournament) {
        lastMatch = getMatchAPIData(time, 'past', 1, lastTournament)
        if (lastMatch && lastMatch.length === 1) {
          apiResponse = getMatchAPIData({ queryString: buildQueryStringFromMatchDay(lastMatch[0]) })
        }
      }
    }
  } else {
    // user requested a time and/or status
    apiResponse = getMatchAPIData(time, status)
  }
  
  console.log(apiResponse ? apiResponse.length + ' match(es) found' : 'No matches found')
  
  let matches = []
  apiResponse.forEach((matchData) => { matches.push(buildMatch(matchData, timezone)) })
  
  return matches
}

module.exports = {
  getMatches: getMatches
}