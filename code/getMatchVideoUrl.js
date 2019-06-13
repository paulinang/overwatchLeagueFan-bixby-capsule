let dates = require('dates')
let http = require('http')
let console = require('console')
let config = require('config')
let secret = require ('secret')

const getVideoAPIData = (cursor) => {
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

const binarySearch = (videos, startIndex, endIndex, matchStartTime, timezone) => {
  if (endIndex >= startIndex) {
    const midIndex = Math.floor(startIndex + (endIndex - startIndex) / 2)
    const midVideoTime = new dates.ZonedDateTime.parseDateTime(videos[midIndex].created_at).withZoneSameInstant(timezone)
    if (matchStartTime.isAfterOrEqualTo(midVideoTime.atStartOfDay()) && matchStartTime.isBeforeOrEqualTo(midVideoTime.atEndOfDay())) {
      // match happened during day of mid video -> use mid index to get all surrounding videos with that date
      let videoMatches = [videos[midIndex]]
      let leftMost = midIndex - 1
      let rightMost = midIndex + 1
      while (leftMost >= 0) {
        let leftMostTime = new dates.ZonedDateTime.parseDateTime(videos[leftMost].created_at).withZoneSameInstant(timezone)
        // keep going left of mid index (to earlier dates) to grab all videos that share same date as matchStartTime
        if (matchStartTime.isAfterOrEqualTo(leftMostTime.atStartOfDay()) && matchStartTime.isBeforeOrEqualTo(leftMostTime.atEndOfDay())) {
          videoMatches.push(videos[leftMost])
          leftMost --
        } else {
          break
        }
      }
      while (rightMost < videos.length) {
        let rightMostTime = new dates.ZonedDateTime.parseDateTime(videos[rightMost].created_at).withZoneSameInstant(timezone)
        // keep going right of mid index (to laster dates) to grab all videos that share same date as matchStartTime
        if (matchStartTime.isAfterOrEqualTo(rightMostTime.atStartOfDay()) && matchStartTime.isBeforeOrEqualTo(rightMostTime.atEndOfDay())) {
          videoMatches.push(videos[rightMost])
          rightMost ++
        } else {
          break
        }
      }
      
      return videoMatches
    } else if (matchStartTime.isAfter(midVideoTime.atStartOfDay())) {
      // match happened after day of mid video -> get start to mid (left half of array) for later videos
      return binarySearch(videos, startIndex, midIndex - 1, matchStartTime, timezone)
    } else
      // match happened start day of mid video -> get mid to end (right half) for earlier videos
      return binarySearch(videos, midIndex - 1, endIndex, matchStartTime, timezone)
  } else {
    // none of the videos have the same date as match
    return
  }
}


const searchForPastVideo = (match, cursor) => {
  const apiResponse = getVideoAPIData(cursor)
  if (apiResponse.error || !apiResponse.data) {
    // means there are no more vidoes to get, so return empty (couldn't find any vids)
    return
  }
  const matchStartTime =  new dates.ZonedDateTime.fromDateTime(match.time.start)
  const timezone = match.time.start.time.timezone
  
  const videos = apiResponse.data ? apiResponse.data : apiResponse.data
  // update cursor
  cursor = apiResponse.pagination && apiResponse.pagination.cursor ? apiResponse.pagination.cursor : undefined
  const firstVidTime = new dates.ZonedDateTime.parseDateTime(videos[0].created_at).withZoneSameInstant(timezone) // first vid is most recent
  const lastVidTime = new dates.ZonedDateTime.parseDateTime(videos[videos.length - 1].created_at).withZoneSameInstant(timezone)
  // fast fail. get first 100 videos for overwatch league. if the date of match isn't between video 1 date and video 100 date, move to next 100
  if (matchStartTime.isBeforeOrEqualTo(firstVidTime.atStartOfDay()) && matchStartTime.isAfterOrEqualTo(lastVidTime.atEndOfDay())) {
    // if matchStartTime is between start of first vid date and end of last vid date, the video match should be inside this 100 videos array
    const videoMatches = binarySearch(videos, 0, videos.length - 1, matchStartTime, timezone)
    return videoMatches.find((video) => {
      let title = video.title
      return title.indexOf('Full Match') > -1 && title.indexOf(match.opponents.teams[0].name) > -1 && title.indexOf(match.opponents.teams[0].name)
    })
  } else {
    searchForPastVideo(match, cursor)
  }
}


module.exports.function = function GetMatchVideoUrl (match) {
  console.log ('Getting twitch url for ', match)
  // this only works for live and past games
  if (match.status === 'Running') {
    // live match, give link to Overwatch League twitch channel (it will be currently streaming)
    return config.get('twitchTv.overwatchLeague.url')
  }
  if (match.status === 'Past' && match.seriesName !== 'All-stars') {
    // if past match, have to search through all videos on OverwatchLeague channel
    // TODO: support all stars
    return searchForPastVideo(match) ? searchForPastVideo(match).url : undefined
  }
  return
}
