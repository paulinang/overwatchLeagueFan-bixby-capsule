let dates = require('dates')

const parseTwitchTime = (twitchTime, timezone) => {
  if (twitchTime) {
    return new dates.ZonedDateTime.parseDateTime(twitchTime).withZoneSameInstant(timezone)
  }
}

const checkTeamsInVideo = (title, matchType, teams) => {
  if (matchType === 'Official All-Star Game') {
    // all stars doesnt have teams in video
    return true
  } else {
    return title.indexOf(teams[0].name) > -1 && title.indexOf(teams[0].name) > -1
  }
}

module.exports = {
  parseTwitchTime: parseTwitchTime,
  checkTeamsInVideo: checkTeamsInVideo
}