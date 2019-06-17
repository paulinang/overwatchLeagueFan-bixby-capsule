let console = require('console')

const { getSeriesAPIData } = require('./client')
const { buildSeries } = require('./builder')

const getSeries = (timezone, time, status) => {
  console.log('Getting series')
  
  const apiResponse = getSeriesAPIData(time, status)
  
  console.log(apiResponse ? apiResponse.length + ' series found' : 'No series found')
  
  let series = []
  apiResponse.forEach((seriesData) => { series.push(buildSeries(seriesData, timezone)) })
  
  return series
}

module.exports = {
  getSeries: getSeries
}