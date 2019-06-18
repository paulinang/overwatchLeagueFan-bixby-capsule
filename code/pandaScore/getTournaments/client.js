let http = require('http')
let console = require('console')
let config = require('config')
let secret = require ('secret')

const BASEURL = config.get('pandaScore.baseUrl')

const getTournamentAPIData = (time, status, count, series) => {
  const ENDPOINT = status ? 'tournaments/' + status.toLowerCase() : 'tournaments'
  const TOURNAMENTURL = BASEURL + '/' +  ENDPOINT
  
  let queryArgs = {
    token: secret.get('pandaScore.accessToken')
  }
  
  if (time) {
    if (time.queryString.length === 1) {
      queryArgs['filter[begin_at]'] = time.queryString[0]
    } else {
      queryArgs['range[begin_at]'] = time.queryString.join(',')
    }
    // when asking for events in a time period, we sort by earliest event
    queryArgs['sort'] = 'begin_at'
  }
  
  if (series) {
    queryArgs['filter[serie_id]'] = series.id
  }
  
  if (count) {
    queryArgs['page[size]'] = count
  }
  
  console.log('Sending request at:', TOURNAMENTURL, queryArgs)
  
  return http.getUrl(TOURNAMENTURL, {
    format: 'json',
    query: queryArgs
  })
}

module.exports = {
  getTournamentAPIData: getTournamentAPIData
}