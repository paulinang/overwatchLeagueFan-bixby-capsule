let console = require('console')
let config = require('config')

const { searchForPastTwitchVideo } = require('./searchForPastTwitchVideo/main')

module.exports.function = function GetMatchVideoUrl (match) {
  console.log ('Getting twitch url for ', match)
  const status = String(match.status) // enum convert to string
  
  if (status === 'Past') {
    // if past match, have to search through all videos on OverwatchLeague channel
    const videoMatch = searchForPastTwitchVideo(match)
    if (videoMatch && videoMatch.url) {
      return videoMatch.url
    }
  }
  // default to home page of user channel
  return config.get('twitchTv.overwatchLeague.url')
}
