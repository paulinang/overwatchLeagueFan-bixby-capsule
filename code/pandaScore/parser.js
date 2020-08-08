/*
Parse API data to fit Bixby models
*/

const { getEventStatusByTime } = require('./util');
const eventStatus = require('./data/eventStatus');
const matchType = require('./data/matchType');

let dates = require('dates');

const parseDateTime = (timeString, timezone) => {
  // example API string: 2019-05-01T23:50:00Z
  // returns a viv.time.DateTime
  if (timeString) {
    return new dates.ZonedDateTime.parseDateTime(timeString)
      .withZoneSameInstant(timezone)
      .getDateTime();
  }
};

const parseEventTime = (eventData, timezone) => {
  return {
    start: eventData.begin_at
      ? parseDateTime(eventData.begin_at, timezone)
      : eventData.scheduled_at
      ? parseDateTime(eventData.scheduled_at, timezone)
      : null,
    end: parseDateTime(eventData.end_at, timezone),
  };
};

const parseWinner = (eventData) => {
  // sometimes there is no winnerType, so get it from what matchOpponents are available
  return {
    id: eventData.winner_id,
    type: eventData.winner_type ? eventData.winner_type : undefined,
  };
};

const parseEvent = (eventData, timezone) => {
  // returns 'base' event object
  // gets properties (id, name, etc.) common across all events (matches, tournaments, series)
  const eventTime = parseEventTime(eventData, timezone);

  return {
    // base event info
    id: eventData.id,
    name: eventData.name
      ? eventData.name
      : eventData.full_name
      ? eventData.full_name
      : undefined,
    time: eventTime,
    // get event status from actual data if available, else have to use our own logic to determine status by time
    status: eventData.status
      ? eventStatus[eventData.status]
      : getEventStatusByTime(eventTime),
    winner: parseWinner(eventData),
  };
};

const parseTeam = (teamData) => {
  return {
    id: teamData.id,
    name: teamData.name,
    acronym: teamData.acronym,
  };
};

const parsePlayer = (playerData) => {
  return {
    id: playerData.id,
    name: playerData.name,
    imageUrl: playerData.image_url,
    firstName: playerData.first_name,
    lastName: playerData.last_name,
    role: playerData.role,
  };
};

const parseOpponents = (matchData) => {
  let teams = [];
  let players = [];

  const opponentData = matchData.opponents ? matchData.opponents : undefined;
  const resultData = matchData.results ? matchData.results : undefined;

  opponentData.forEach((data) => {
    if (data.type === 'Team') {
      teams.push(parseTeam(data.opponent));
    } else if (data.type === 'Player') {
      players.push(parsePlayer(data.opponent));
    }
  });

  // add score to player/team
  resultData.forEach((data) => {
    let teamIndex, playerIndex;
    if (data.team_id) {
      teamIndex = teams.findIndex((team) => {
        return team.id === data.team_id;
      });
    } else if (data.player_id) {
      playerIndex = players.findIndex((player) => {
        return player.id === data.player_id;
      });
    }

    if (teamIndex > -1) {
      teams[teamIndex].score = data.score;
    } else if (playerIndex > -1) {
      players[playerIndex].score = data.score;
    }
  });

  return {
    teams: teams,
    players: players,
  };
};

const parseMatch = (matchData, timezone) => {
  let match = parseEvent(matchData, timezone);

  match.type = matchType[matchData.match_type];
  match.numberOfGames = matchData.number_of_games;
  match.opponents = parseOpponents(matchData);
  // match.seriesID = matchData.serie_id
  match.seriesName = matchData.serie.full_name;
  // match.tournamentID = matchData.tournament_id
  match.tournamentName = matchData.tournament.name;
  // booleans
  match.isForfeit = matchData.forfeit;
  match.isDraw = matchData.draw;
  return match;
};

module.exports = {
  parseEvent: parseEvent,
  parseMatch: parseMatch,
};
