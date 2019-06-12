const matchType = require('../lib/api/matchType')
const { buildEvent } = require('../lib/builder')

const buildTeam = (teamData) => {
  return {
    id: teamData.id,
    name: teamData.name,
    imageUrl: teamData.image_url,
    acronym: teamData.acronym
  }
}

const buildPlayer = (playerData, league) => {
  return {
    id: playerData.id,
    name: playerData.name,
    imageUrl: playerData.image_url,
    firstName: playerData.first_name,
    lastName: playerData.last_name,
    role: playerData.role,
    // hometown: data.hometown,
  }
}

const buildOpponents = (matchData) => {
  let teams = []
  let players = []
  
  const opponentData = matchData.opponents ? matchData.opponents : undefined
  const resultData = matchData.results ? matchData.results : undefined

  opponentData.forEach((data) => {
    if (data.type === 'Team') {
      teams.push(buildTeam(data.opponent))
    } else if (data.type === 'Player') {
      players.push(buildPlayer(data.opponent))
    }
  })

  // add score to player/team
  resultData.forEach((data) => {
    let teamIndex, playerIndex
    if (data.team_id) {
      teamIndex = teams.findIndex((team) => {
        return team.id === data.team_id
      })
    } else if (data.player_id) {
      playerIndex = players.findIndex((player) => {
        return player.id === data.player_id
      })
    }

    if (teamIndex > -1) {
      teams[teamIndex].score = data.score
    } else if (playerIndex > -1) {
      players[playerIndex].score = data.score
    }
  })
  
  return {
    teams: teams,
    players: players,
  }
}

const buildMatch = (matchData, timezone) => {
  let match = buildEvent(matchData, timezone)
  
  match.type = matchType[matchData.match_type]
  match.numberOfGames = matchData.number_of_games
  match.opponents = buildOpponents(matchData)
  // match.seriesID = matchData.serie_id
  // match.seriesName = matchData.serie.full_name
  // match.tournamentID = matchData.tournament_id
  // match.tournamentName = matchData.tournament.name
  // match.leagueID = matchData.league_id
  // booleans
  match.isForfeit = matchData.forfeit
  match.isDraw = matchData.draw
  return match
}

module.exports = {
  buildMatch: buildMatch
}