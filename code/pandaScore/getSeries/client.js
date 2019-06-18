let http = require('http')
let console = require('console')
let config = require('config')
let secret = require ('secret')

const BASEURL = config.get('pandaScore.baseUrl')
const LEAGUEID = config.get('pandaScore.league.id')

const getSeriesAPIData = (time, status, count) => {
  const ENDPOINT = status ? 'series/' + status.toLowerCase() : 'series'
  const SERIESURL = BASEURL + '/' +  ENDPOINT
  
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
    // when asking for events in a time period, we sort by earliest event
    queryArgs['sort'] = 'begin_at'
  }
  
  if (count) {
    queryArgs['page[size]'] = count
  }
  
  console.log('Sending request at:', SERIESURL, queryArgs)
  
  return http.getUrl(SERIESURL, {
    format: 'json',
    query: queryArgs
  })
}

module.exports = {
  getSeriesAPIData: getSeriesAPIData
}