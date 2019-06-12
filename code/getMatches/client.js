let http = require('http')
let console = require('console')
let config = require('config')
let secret = require ('secret')

const BASEURL = config.get('pandaScore.baseUrl')
const LEAGUEID = config.get('pandaScore.league.id')

const getMatchAPIData = (time, status, count, tournament) => {
  console.log('Getting match API data')
  const ENDPOINT = status ? 'matches/' + status.toLowerCase() : 'matches'
  const MATCHURL = BASEURL + '/' +  ENDPOINT
  
  let queryArgs = {
    token: secret.get('pandaScore.accessToken'),
    'filter[league_id]': LEAGUEID
  }
  
  if (time) {
    if (time.queryString.length === 1) {
      queryArgs['filter[begin_at]'] = time.queryString[0]
    } else {
      queryArgs['range[begin_at]'] = time.queryString.join(',')
    }
    queryArgs['sort'] = 'begin_at'
  }
  
  if (tournament) {
    queryArgs['filter[tournament_id]'] = tournament.id
  }
  
  if (count) {
    queryArgs['page[size]'] = count
  }
  
  console.log('Sending request at:', MATCHURL, queryArgs)
  
  return http.getUrl(MATCHURL, {
    format: 'json',
    query: queryArgs
  })
}

module.exports = {
  getMatchAPIData: getMatchAPIData
}