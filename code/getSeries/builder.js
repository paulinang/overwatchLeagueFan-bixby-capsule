const { buildEvent } = require('../lib/builder')

const buildSeries = (seriesData, timezone) => {
  let series = buildEvent(seriesData, timezone)
  
  return series
}

module.exports = {
  buildSeries: buildSeries
}