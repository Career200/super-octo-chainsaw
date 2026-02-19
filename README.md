# My cyberpunk 2020 game

I just want to play a game of cyberpunk 2020 with my friends in a specific setting, and here's the page I use to make it more flavourful for everybody.

## Charsheet

I also decided to add an interactive charsheet. It turns out to be pretty complex with all the 2020 mechanics - I'm once again impressed by this system.
It started as a tiny script to quickly count armor degradation separately for different body parts...

Mostly inspired by [Pathbuilder](https://gitlab.com/doctor.unspeakable/pathbuilder-2e) - without it I'd have such a hard time with Pathfinder! Go there, don't look at me 😳

### Plans

The charsheet grows into a proper multi-tab SPA - tabs by real-world by usage:
- Combat - wounds, saves, armor to receive damage, weapons/skills and hints to attack (considering both ranged and melee). Requires pretty much everything else to be completed first...
- More combat - roll damage and location, consider different damage types, degrade armor, undo if you messed up... 
- Skills/Notes - pretty much done, only want to add tab to notes with useful info, like installed optics or such, stuff you may want to remember when roleplaying, and chipware skills.
- Inventory management with custom items. Gear, armor and weapons.
- Cybernetics management, affecting stats and skills - yes, I want to switch chips and connect to smartguns with the charsheet.
- A switch for RAW (or at least my interpretation of it) and my homerules. 
- ??? IPs, character creation, lifepath generator that is tied into the charsheet... Not really on the roadmap but sounds cool.

All these should be generic enough to be used in any cyberpunk 2020 game, not just mine.

### Stack
Within astro, I'm using Preact for the jsx that I'm so used to and nanostores as something recommended by astro - and `persistentAtom` is so very cool
