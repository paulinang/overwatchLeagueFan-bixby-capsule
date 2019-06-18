let dates = require('dates')
let console = require('console')
let config = require('config')

const { getTwitchVideoAPIData } = require('./getTwitchVideo/client')

const parseTwitchTime = (twitchTime, timezone) => {
  if (twitchTime) {
    return new dates.ZonedDateTime.parseDateTime(twitchTime).withZoneSameInstant(timezone)
  }
}

const binarySearch = (videos, startIndex, endIndex, matchEndTime, timezone, teams) => {
  // binary search a 100 videos (sorted from most to least recent)
  // returns the video that is a 'Full Match' for teams provided on the correct date
  if (endIndex >= startIndex) {
    // there are still videos to search, get mid index
    const midIndex = Math.floor(startIndex + (endIndex - startIndex) / 2)
    const midVideoDateStart = parseTwitchTime(videos[midIndex].created_at, timezone).atStartOfDay()
    const midVideoDateEnd = parseTwitchTime(videos[midIndex].created_at, timezone).atEndOfDay()

    if (matchEndTime.isAfterOrEqualTo(midVideoDateStart) && matchEndTime.isBeforeOrEqualTo(midVideoDateEnd)) {
      // match happened during day of mid video -> use mid index to get all surrounding videos with that date

      let midVideo = videos[midIndex]
      if (midVideo.title.indexOf('Full Match') >  -1 && midVideo.title.indexOf(teams[0].name) > -1 && midVideo.title.indexOf(teams[0].name) > -1) {
        return midVideo
      }
      
      let leftIndex = midIndex - 1
      while (leftIndex >= 0) {
        let leftVid = videos[leftIndex]
        let leftVidDateStart = parseTwitchTime(leftVid.created_at, timezone).atStartOfDay()
        let leftVidDateEnd = parseTwitchTime(leftVid.created_at, timezone).atEndOfDay()
        
        if (leftVid.title.indexOf('Full Match') === -1) {
          // quickly move on to next vid on the left if title doesn't include full match
          leftIndex --
          continue
        }
        
        if (matchEndTime.isAfterOrEqualTo(leftVidDateStart) && matchEndTime.isBeforeOrEqualTo(leftVidDateEnd)) {
          // correct video creation date -> match ended on same date
          if (leftVid.title.indexOf(teams[0].name) > -1 && leftVid.title.indexOf(teams[0].name) > -1) {
            // correct title (has both teams) -> all criteria met, return vid!
            return leftVid
          } else {
            // still correct video date, so keep searching left
            leftIndex --
          }
        } else {
          // no longer in the correct date, break out of while loop
          break
        }
      }

      let rightIndex = midIndex + 1
      while (rightIndex >= 0) {
        let rightVid = videos[rightIndex]
        let rightVidDateStart = parseTwitchTime(rightVid.created_at, timezone).atStartOfDay()
        let rightVidDateEnd = parseTwitchTime(rightVid.created_at, timezone).atEndOfDay()

        if (rightVid.title.indexOf('Full Match') === -1) {
          // quickly move on to next vid on the right if title doesn't include full match
          rightIndex ++
          continue
        }

        if (matchEndTime.isAfterOrEqualTo(rightVidDateStart) && matchEndTime.isBeforeOrEqualTo(rightVidDateEnd)) {
          // correct video creation date -> match ended on same date
          if (rightVid.title.indexOf(teams[0].name) > -1 && rightVid.title.indexOf(teams[0].name) > -1) {
            // correct title (has both teams) -> all criteria met, return vid!
            return rightVid
          } else {
            // still correct video date, so keep searching right
            rightIndex ++
          }
        } else {
          // no longer in the correct date, break out of while loop
          break
        }
      }
    } else if (matchEndTime.isAfter(midVideoDateStart)) {
      // match happened after day of mid video -> get start to mid (left half of array) for later videos
      return binarySearch(videos, startIndex, midIndex - 1, matchEndTime, timezone, teams)
    } else {
      // match happened start day of mid video -> get mid to end (right half) for earlier videos
      return binarySearch(videos, midIndex - 1, endIndex, matchEndTime, timezone, teams)
    }
  }
}


const searchForPastVideo = (match, cursor) => {
  const apiResponse = getTwitchVideoAPIData(cursor)

  if (apiResponse.error || !apiResponse.data || apiResponse.data.length === 0) {
    // api returned no more videos, so return empty (couldn't find any vids)
    return
  }

  // get match start and end time to compare against video creation time
  // videos are usually created right after a match ends
  const matchStartTime =  new dates.ZonedDateTime.fromDateTime(match.time.start)
  const matchEndTime = match.time.end ? new dates.ZonedDateTime.fromDateTime(match.time.end) : matchStartTime
  const timezone = String(match.time.start.time.timezone)

  // process API response:  videos to search, update cursor if available
  const videos = apiResponse.data ? apiResponse.data : apiResponse.data
  cursor = apiResponse.pagination && apiResponse.pagination.cursor ? apiResponse.pagination.cursor : undefined

  // get creation times of first (most recent) and last (least recent) videos of response
  const firstVidTime = new dates.ZonedDateTime.parseDateTime(videos[0].created_at).withZoneSameInstant(timezone)
  const lastVidTime = new dates.ZonedDateTime.parseDateTime(videos[videos.length - 1].created_at).withZoneSameInstant(timezone)

  // we only search within the 100 videos if the match ended/ video could have been created between the times of first and last vid
  if (matchEndTime.isAfterOrEqualTo(lastVidTime.atStartOfDay()) && matchEndTime.isBeforeOrEqualTo(firstVidTime.atEndOfDay())) {
    // binary search videos as they are sorted by time to get all 'Full Match' videos on the match date
    const videoMatch = binarySearch(videos, 0, videos.length - 1, matchEndTime, timezone, match.opponents.teams)
    if (videoMatch) {
      return videoMatch
    }
  } else if (cursor) {
    // get next 100 vids if there is a cursor
    return searchForPastVideo(match, cursor)
  }
}


module.exports.function = function GetMatchVideoUrl (match) {
  console.log ('Getting twitch url for ', match)
  const status = String(match.status) // enum convert to string
  
  if (status === 'Past' && match.seriesName !== 'All-stars') {
    // if past match, have to search through all videos on OverwatchLeague channel
    // TODO: support all stars
    const videoMatch = searchForPastVideo(match)
    return videoMatch.url ?  videoMatch.url : undefined
  } else {
    // default to home page of user channel
    return config.get('twitchTv.overwatchLeague.url')
  }
}
