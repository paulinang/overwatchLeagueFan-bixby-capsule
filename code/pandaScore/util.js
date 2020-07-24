let dates = require('dates')

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
      return 'InProgress'
    } else if (eventStart.isAfter(now)) {
      // event hasn't started
      return 'Upcoming'
    }
  }
}

module.exports = {
  getEventStatusByTime: getEventStatusByTime
}