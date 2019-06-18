const { buildEvent } = require('../lib/builder')

const buildTournament = (tournamentData, timezone) => {
  let tournament = buildEvent(tournamentData, timezone)
  
  return tournament
}

module.exports = {
  buildTournament: buildTournament
}