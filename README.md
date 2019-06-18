# Overwatch League Fan
Bixby capsule that provides information about the eSports event [Overwatch League](https://overwatchleague.com/)

2 APIS used:
1. [PandaScore](https;//pandascore.co/) for match schedule and scores
2. [Twitch.tv API]((https://dev.twitch.tv/)) for recorded videos of past matches
---
---
## Version  1.0.0
---
The first implementation is focused on getting fans watching Overwatch League matches as quickly and smoothly as possible, either by giving the time of the next match or punchout to videos of past matches.

All initial queries return a list of match items. Each match item gives:
- Start time (scheduled for future, start for past)
- Teams playing (2 teams - logo + name)
- Score (if past or in progress match)

Clicking on an item provides some extra information
- Punchout to the Overwatch League channel on twitch.tv (specific video for past match if available)
- Punchout to the official Overwatch League website

### Inputs
There are currently 2 ways a user can request match information
**1. No Inputs**
>What's the schedule
Any matches coming up
What games are playing

The most general use case, a match list is provided if there is a series (AKA season) and tournament (AKA stage) in progress with in progress and/or upcoming matches.

**2. Specified Time Input**
> Show me last week's schedule
Any games tomorrow
What games are playing this weekend

This will give all matches in the specified time. If the user asked for a dateTime (ex. today at 2pm), an error will be thrown to expand the match time filter to the whole day (ex. today).

---
---
## Next Steps
---
1. Handle off-season response (Season 2 2019 ends August 25) with last season's results + next season's start date (instead of current halt error)
2. Handle edge cases for series in progress, but no in progress tournament or in progress + upcoming matches founds (currently just gives 0 matches, try to give past results + next tournament/ season if possible)
3. Support search matches by team (max 2 / match)
4. Improve runtime -> possibly move to remote endpoint and microservice for async calls
5. Add more information --> match details + stats (might need to upgrade from free pandascore API)