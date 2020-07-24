/* 
Handle API requests
*/

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

const getMatchAPIData = (time, status, tournament, count) => {
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
  
  let results = []
  if (count) {
    if (count <= 100) {
      // under 100 (max per page), no need to paginate, just 1 request
      queryArgs['page[size]'] = count
      console.log('Sending request at:', MATCHURL, queryArgs)
      results = results.concat(http.getUrl(MATCHURL, { format: 'json', query: queryArgs }))
    } else {
      // keep requesting page by page, until we hit count or there are no more matches left
      let remainingCount = count - 100
      let currentPage = 1
      let response
      while (remainingCount > 0) {
        queryArgs['page[size]'] = remainingCount > 100 ? 100 : remainingCount
        queryArgs['page[number]'] = currentPage
        console.log('Sending request at:', MATCHURL, queryArgs)
        response = http.getUrl(MATCHURL, { format: 'json', query: queryArgs })
        if (response && response.length > 0) {
          results = results.concat(response)
        } else {
          break
        }
        remainingCount -= 100
        currentPage ++
      }
    }
  } else {
    // get max/ page and keep getting more until api returns empty
    queryArgs['page[size]'] = 100
    queryArgs['page[number]'] = 1
    console.log('Sending request at:', MATCHURL, queryArgs)
    let response = http.getUrl(MATCHURL, { format: 'json', query: queryArgs })
    while (response && response.length > 0) {
      results = results.concat(response)
      if (response.length === 100) {
        // managed to get 100 matches, check next page to see if there is still more
        currentPage ++
        queryArgs['page[number]'] ++
        console.log('Sending request at:', MATCHURL, queryArgs)
        response = http.getUrl(MATCHURL, { format: 'json', query: queryArgs })
      } else {
        // didn't make it to max 100 matches per page, so there can't be anymore
        break
      }
    }
  }
  
  return results
}

module.exports = {
  getSeriesAPIData: getSeriesAPIData,
  getTournamentAPIData: getTournamentAPIData,
  getMatchAPIData: getMatchAPIData
}