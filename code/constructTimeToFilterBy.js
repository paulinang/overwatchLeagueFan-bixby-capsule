let dates = require('dates')
let fail = require('fail')

module.exports.function = function constructTimeToFilterBy (duration, date, dateTime, dateInterval, dateTimeInterval) {
  
  let queryString = []
  
  if (dateTime) {
    throw fail.checkedError(
      'Datetime requested, use date instead',
      'DateTimeInputNotAllowed',
      { dateTime: dateTime }
    )
  } else if (date) {
    queryString.push(new dates.ZonedDateTime.fromDate(date).atStartOfDay().toIsoString())
    queryString.push(new dates.ZonedDateTime.fromDate(date).atEndOfDay().toIsoString())
    
  } else if (dateInterval) {
    
    if (dateInterval.start) {
      queryString.push(new dates.ZonedDateTime.fromDate(dateInterval.start).atStartOfDay().toIsoString())
    }
    if (dateInterval.end) {
      queryString.push(new dates.ZonedDateTime.fromDate(dateInterval.end).atEndOfDay().toIsoString())
    }
    
  } else if (dateTimeInterval) {
    
    if (dateTimeInterval.namedTimeIntervalRel && String(dateTimeInterval.namedTimeIntervalRel) === 'Weekend') {
      // viv gives weekend as starting at 5pm Friday. Adjust this to start of Friday
      queryString.push(new dates.ZonedDateTime.fromDateTime(dateTimeInterval.start).atStartOfDay().toIsoString())
    } else if (dateTimeInterval.start) {
      queryString.push(new dates.ZonedDateTime.fromDateTime(dateTimeInterval.start).toIsoString())
    }
    
    if (dateTimeInterval.end) {
      queryString.push(new dates.ZonedDateTime.fromDateTime(dateTimeInterval.end).toIsoString())
    } else {
      queryString.push(new dates.ZonedDateTime.fromDateTime(dateTimeInterval.start).atEndOfDay().toIsoString())
    }
    
  } else if (duration) {
    queryString.push(new dates.ZonedDateTime.now().toIsoString())
    queryString.push(new dates.ZonedDateTime.now().plusDuration(duration).getDateTime.toIsoString())
    
  }
  return {
    queryString: queryString,
    originalInput: {
      duration: duration,
      date: date,
      dateTime: dateTime,
      dateInterval: dateInterval,
      dateTimeInterval: dateTimeInterval
    }
  }
}
