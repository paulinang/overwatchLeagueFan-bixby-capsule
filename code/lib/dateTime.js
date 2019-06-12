let dates = require('dates')

const parseAPItime = (timeString, timezone) => {
  // example API string: 2019-05-01T23:50:00Z
  if (timeString) {
    return new dates.ZonedDateTime.parseDateTime(timeString).withZoneSameInstant(timezone).getDateTime()
  }
}

const getEventStatusByTime = (eventTime) => {
  const now = new dates.ZonedDateTime.now()
  const eventStart = new dates.ZonedDateTime.fromDateTime(eventTime.start)
  const eventEnd = eventTime.end ? new dates.ZonedDateTime.fromDateTime(eventTime.end) : undefined
  
  if (eventEnd && eventEnd.isBefore(now)) {
    return 'Past' // event has already ended
  } else {
    // no end, or end if after now
    if (eventStart.isBeforeOrEqualTo(now)) {
      // if event has started
      return 'Running'
    } else if (eventStart.isAfter(now)) {
      // event hasn't started
      return 'Upcoming'
    }
  }
}

module.exports = {
  parseAPItime: parseAPItime,
  getEventStatusByTime: getEventStatusByTime
}