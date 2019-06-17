# Overwatch League Fan Bixby Capsule

The first implementation is focused on getting fans watching Overwatch League as quickly and smoothly as possible. Quick glance of the schedule is more important than in depth stats (API does not provide these for free)

Queries try to return a match list. Each item has the scheduled time, teams, and score (if past or in progress). 
Clicking on a match item will give a link to the Overwatch League channel on twitch.tv. Past matches will give links to the recorded vid of that match.

Users can give inputs (ZeroOrOneOf):
NONE
- First check: series in progress -> No, gives  'OffSeason' halt error. Yes, move to second check.
- Second check: tournament in progress -> Gives current + upcoming matches of that tournament. else, gives 0 matches (but says series + tournament in progress)
Example NL: "What's the schedule" "Show me the league schedule"

1. Time -> gives paginated list of all matches in that time. Datetime will be expanded to whole date.
Example NL: "Matches last year" "Next week schedule" "What's today's schedule" "Any matches tomorrow"

TODO:
1. Deal with off season use case -- not urgent as Overwatch League Season 2 is currently in progress
2. Deal with edge cases:
- series in progress, but no tournament in progress -> give next tournament matches
- series in progress, but no tournament in progress or upcoming tournament -> give last tournament matches
- series in progress, but no tournaments (past, in progress, upcoming) -> give dialog saying couldn't find any scheduled matches
3. Support search matches by team (max 2)
- one team will give all upcoming matches for that team
- two teams will give all upcoming matches where those teams face each other
4. Improve video search
- takes a while to search for older videos
- matches that end past midnight of the day they start might cause an error since search is for videos published same date as when the video starts.\