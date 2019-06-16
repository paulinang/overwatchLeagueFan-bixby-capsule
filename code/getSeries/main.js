let console = require('console')

const { getSeriesAPIData } = require('./client')
const { buildSeries } = require('./builder')

const getSeries = (timezone, time, status) => {
  console.log('Getting series')
  
  let apiResponse
  if (!time && !status) {
    // user gave no inputs, try to give most relevant series. starting with current series
    apiResponse = getSeriesAPIData(time, 'running', 1)
    
    if (!apiResponse || apiResponse.length === 0) {
      // no in progress series -> get last series and next series
      const lastSeries = getSeriesAPIData(time, 'past', 1)
      const nextSeries = getSeriesAPIData(time, 'upcoming', 1)
      
      if (lastSeries) {
        if (nextSeries) {
          apiResponse = lastSeries.concat(nextSeries)
        } else {
          apiResponse = lastSeries
        }
      } else if (nextSeries) {
        apiResponse = nextSeries
      }
    }
  } else {
    // user requested a time and/or status
    apiResponse = getSeriesAPIData(time, status)
  }
  
  console.log(apiResponse ? apiResponse.length + ' series found' : 'No series found')
  
  let series = []
  apiResponse.forEach((seriesData) => { series.push(buildSeries(seriesData, timezone)) })
  
  return series
}

module.exports = {
  getSeries: getSeries
}