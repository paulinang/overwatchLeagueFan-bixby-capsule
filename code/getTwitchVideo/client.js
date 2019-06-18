let http = require('http')
let config = require('config')
let secret = require ('secret')

const getTwitchVideoAPIData = (cursor) => {
  const BASE_URL = config.get('twitchTv.baseUrl') 
  const ENDPOINT = 'videos'
  const TWITCH_VIDEO_URL = BASE_URL + '/' +  ENDPOINT

  const queryArgs = {
    user_id: config.get('twitchTv.overwatchLeague.userID'),
    type: 'highlight',
    first: 100
  }
  if (cursor) {
    queryArgs.after = cursor
  }
  return http.getUrl(TWITCH_VIDEO_URL, {
    format: 'json',
    query: queryArgs,
    headers: {'client-ID': secret.get('twitchTv.clientID')}
  })
}

module.exports = {
  getTwitchVideoAPIData: getTwitchVideoAPIData
}