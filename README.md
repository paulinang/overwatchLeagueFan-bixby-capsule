# Overwatch League Fan
An app for Samsung's voice assistant Bixby (a.k.a a Bixby capsule) that provides information about the eSports event [Overwatch League](https://overwatchleague.com/). It is published on the Bixby markeplace for en-US phones.

## Use cases
Inputs: Time, team name
Output: A list of matches with time, opponents, and score if available

Example natural language queries:
```
What's the schedule?
Any matches coming up?
Show me last week's schedule?
Are there any matches today?
When are the LA Gladiators playing?
Do Philly Fusion have any matches today?
```

## Cut Features
1. **Detailed info per match by clicking on a match summary**
League data is retrieved from the [PandaScore API](https://pandascore.co/). The free tier that doesn't give enough detailed info (score breakdown, maps played, etc.) to warrant creating a separate page for match details.
2. **Punch out to Twitch VODs and live match streams**
This used to be implemented, but the league swapped to Youtube starting with the 2020 season. I have disabled the portion of this app that integrates the [Twitch API](https://dev.twitch.tv/), but left the [code up for reference](./code/twitchTv).

## Future Plans
1. **Integrate Youtube API**
This would take over the disabled Twitch portions and allow punching out to past video matches. The main challenge would be finding the correct video from API result for each match due to video naming inconsistencies (typos, unclear naming format, etc.).
2. **Match detail breakdown with web scraping**
Instead of upgrading to the paid PandaScore API tier, I'd like to look into scrapping the [official site](https://overwatchleague.com/) for data. I've done some intial exploration in a [separate project](https://github.com/paulinang/overwatchleague-scraper), but it needs updates for changes to league format due to COVID-19 before any more work can be done.

## Resources
[Bixby Developer Center](https://bixbydevelopers.com/) -- Build your own Bixby capsule
[PandaScore API](https://pandascore.co/) -- eSports data provider for other video games too (LoL, CS:GO)