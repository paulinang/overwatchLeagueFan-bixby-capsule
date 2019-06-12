const { parseAPItime, getEventStatusByTime } = require('./dateTime')
const eventStatus = require('./api/eventStatus')

const buildEventTime = (eventData, timezone) => {
  return {
    start: parseAPItime(eventData.begin_at, timezone),
    end: parseAPItime(eventData.end_at, timezone)
  }
}
const buildWinner = (eventData) => {
  // sometimes there is no winnerType, so get it from what matchOpponents are available
  return {
    id: eventData.winner_id,
    type: eventData.winner_type ? eventData.winner_type : undefined
  }
}

const buildEvent = (eventData, timezone) => {
  // returns 'base' event object
  // gets properties (id, name, etc.) common across all events (matches, tournaments, series)
  const eventTime = buildEventTime(eventData, timezone)

  return {
    // base event info
    id: eventData.id,
    name: eventData.name ? eventData.name : eventData.full_name ? eventData.full_name : undefined,
    time: eventTime,
    // get event status from actual data if available, else have to use our own logic to determine status by time
    status: eventData.status ? eventStatus[eventData.status] : getEventStatusByTime(eventTime),
    winner: buildWinner(eventData),
  }
}

module.exports = {
  buildEvent: buildEvent
}