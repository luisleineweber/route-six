# Emerald route and event coverage

Record owner for each row: Emerald data maintainer.

All 34 routes from 101 through 134 have an initial-access record. The data also
contains story gates, before/after boss points, later route access, optional
areas, and normal post-game areas. The list has 148 progress points.

`previousIds` gives mandatory access. The list order does not grant access.
The named section uses the next Gym or League opponent. Post-game points have
their own section. Locations and acquisition sources add their own gates.

Source files: `data/games/emerald/progression.json` and `locations.json`.
Review date: 7 October 2026. References are in `data/references.json`.

| ID | Progress point | Section | Mandatory prior IDs |
| --- | --- | --- | --- |
| littleroot | Littleroot Town | Before Roxanne | Game start |
| starter | Rescue Birch and choose a starter | Before Roxanne | littleroot |
| route-101 | Route 101 | Before Roxanne | starter |
| oldale | Oldale Town | Before Roxanne | route-101 |
| route-103 | Route 103: first visit | Before Roxanne | oldale |
| pokedex | Rival battle and Pokédex | Before Roxanne | route-103 |
| route-102 | Route 102 | Before Roxanne | pokedex |
| petalburg | Petalburg City and Wally | Before Roxanne | route-102 |
| route-104 | Route 104: south | Before Roxanne | petalburg |
| petalburg-woods | Petalburg Woods | Before Roxanne | route-104 |
| devon-woods | Help the Devon researcher | Before Roxanne | petalburg-woods |
| route-104-north | Route 104: north | Before Roxanne | devon-woods |
| rustboro | Rustboro City: before Roxanne | Before Roxanne | route-104-north |
| route-116 | Route 116 | Before Roxanne | rustboro |
| rusturf-tunnel | Rusturf Tunnel: first visit | Before Roxanne | route-116 |
| route-115 | Route 115: south | Before Roxanne | rustboro |
| roxanne-defeated | Defeat Roxanne | Before Brawly | rustboro |
| devon-goods | Recover Devon Goods and rescue Peeko | Before Brawly | roxanne-defeated, rusturf-tunnel |
| devon-president | Receive the Letter and PokéNav | Before Brawly | devon-goods |
| mr-briney | Sail with Mr. Briney | Before Brawly | devon-president |
| route-105 | Route 105: boat passage | Before Brawly | mr-briney |
| dewford | Dewford Town: before Brawly | Before Brawly | mr-briney |
| old-rod | Receive the Old Rod | Before Brawly | dewford |
| route-106 | Route 106 | Before Brawly | dewford |
| route-107 | Route 107: boat passage | Before Brawly | dewford |
| granite-cave | Granite Cave | Before Brawly | route-106 |
| steven-letter | Deliver the Letter to Steven | Before Brawly | granite-cave |
| brawly-defeated | Defeat Brawly | Before Wattson | dewford |
| route-108 | Route 108: boat passage | Before Wattson | steven-letter |
| route-109 | Route 109: beach | Before Wattson | steven-letter |
| slateport | Slateport City | Before Wattson | route-109 |
| museum | Deliver Devon Goods at the museum | Before Wattson | slateport |
| route-110 | Route 110 | Before Wattson | museum |
| rival-110 | Defeat the rival on Route 110 | Before Wattson | route-110 |
| mauville | Mauville City: before Wattson | Before Wattson | rival-110 |
| bike | Receive a Mach or Acro Bike | Before Wattson | mauville |
| route-117 | Route 117 and Day Care | Before Wattson | mauville |
| verdanturf | Verdanturf Town | Before Wattson | route-117 |
| rusturf-cleared | Clear Rusturf Tunnel and receive Strength | Before Wattson | verdanturf |
| route-118 | Route 118: west bank | Before Wattson | mauville |
| route-111 | Route 111: south | Before Wattson | mauville |
| wattson-defeated | Defeat Wattson | Before Flannery | mauville |
| rock-smash | Use Rock Smash outside battle | Before Flannery | wattson-defeated |
| route-112 | Route 112 | Before Flannery | rock-smash |
| fiery-path | Fiery Path | Before Flannery | route-112 |
| route-111-north | Route 111: north | Before Flannery | fiery-path |
| route-113 | Route 113 | Before Flannery | route-111-north |
| fallarbor | Fallarbor Town | Before Flannery | route-113 |
| route-114 | Route 114 | Before Flannery | fallarbor |
| meteor-falls | Meteor Falls: first visit | Before Flannery | route-114 |
| meteor-event | Team Magma takes the Meteorite | Before Flannery | meteor-falls |
| mt-chimney | Mt. Chimney and the cable car | Before Flannery | meteor-event |
| maxie-chimney | Defeat Maxie at Mt. Chimney | Before Flannery | mt-chimney |
| jagged-pass | Jagged Pass | Before Flannery | maxie-chimney |
| lavaridge | Lavaridge Town: before Flannery | Before Flannery | jagged-pass |
| wynaut-egg | Receive the Wynaut egg | Before Flannery | lavaridge |
| flannery-defeated | Defeat Flannery and receive Go-Goggles | Before Norman | lavaridge |
| route-111-desert | Route 111: desert | Before Norman | flannery-defeated |
| mirage-tower | Mirage Tower and fossil choice | Before Norman | route-111-desert |
| norman-defeated | Defeat Norman and receive Surf | Before Winona | flannery-defeated, brawly-defeated |
| route-103-surf | Route 103: Surf visit | Before Winona | norman-defeated |
| route-104-surf | Route 104: Surf visit | Before Winona | norman-defeated |
| route-105-surf | Route 105: Surf visit | Before Winona | norman-defeated |
| route-106-surf | Route 106: Surf visit | Before Winona | norman-defeated |
| route-107-surf | Route 107: Surf visit | Before Winona | norman-defeated |
| route-108-surf | Route 108: Surf visit | Before Winona | norman-defeated |
| abandoned-ship | Abandoned Ship: upper rooms | Before Winona | norman-defeated |
| route-109-surf | Route 109: Surf visit | Before Winona | norman-defeated |
| route-115-surf | Route 115: north with Surf | Before Winona | norman-defeated |
| new-mauville | New Mauville: generator task | Before Winona | norman-defeated |
| route-118-east | Route 118: east bank | Before Winona | norman-defeated |
| good-rod | Receive the Good Rod | Before Winona | route-118-east |
| route-119 | Route 119 | Before Winona | route-118-east |
| weather-institute | Free the Weather Institute and receive Castform | Before Winona | route-119 |
| rival-119 | Defeat the rival and receive Fly | Before Winona | weather-institute |
| fortree | Fortree City: before Winona | Before Winona | rival-119 |
| route-120 | Route 120 and Steven | Before Winona | fortree |
| devon-scope | Receive the Devon Scope | Before Winona | route-120 |
| winona-defeated | Defeat Winona | Before Tate & Liza | devon-scope |
| route-121 | Route 121 | Before Tate & Liza | devon-scope |
| safari-zone | Safari Zone: original areas | Before Tate & Liza | route-121 |
| lilycove | Lilycove City | Before Tate & Liza | route-121 |
| route-122 | Route 122 | Before Tate & Liza | route-121 |
| mt-pyre | Mt. Pyre | Before Tate & Liza | route-122 |
| route-123 | Route 123 | Before Winona | norman-defeated |
| magma-emblem | Receive the Magma Emblem at Mt. Pyre | Before Tate & Liza | mt-pyre |
| magma-hideout | Team Magma Hideout | Before Tate & Liza | magma-emblem |
| maxie-hideout | Defeat Maxie in the hideout | Before Tate & Liza | magma-hideout |
| submarine | Team Aqua steals the submarine | Before Tate & Liza | lilycove, maxie-hideout |
| aqua-hideout | Team Aqua Hideout | Before Tate & Liza | submarine |
| route-124 | Route 124 | Before Tate & Liza | aqua-hideout |
| mossdeep | Mossdeep City: before Tate & Liza | Before Tate & Liza | route-124 |
| super-rod | Receive the Super Rod | Before Tate & Liza | mossdeep |
| route-125 | Route 125 | Before Tate & Liza | mossdeep |
| shoal-cave | Shoal Cave: high and low tide | Before Tate & Liza | route-125 |
| route-126 | Route 126 | Before Tate & Liza | route-124 |
| route-127 | Route 127 | Before Tate & Liza | mossdeep |
| route-128 | Route 128 | Before Tate & Liza | route-127 |
| route-129 | Route 129 | Before Tate & Liza | route-128 |
| route-130 | Route 130 | Before Tate & Liza | route-129 |
| mirage-island | Mirage Island: daily personality condition | Before Tate & Liza | route-130 |
| route-131 | Route 131 | Before Tate & Liza | route-130 |
| pacifidlog | Pacifidlog Town | Before Tate & Liza | route-131 |
| route-132 | Route 132 | Before Tate & Liza | pacifidlog |
| route-133 | Route 133 | Before Tate & Liza | route-132 |
| route-134 | Route 134 | Before Tate & Liza | route-133 |
| tate-and-liza-defeated | Defeat Tate & Liza | Before Juan | mossdeep |
| space-center | Defeat Team Magma at the Space Center and receive Dive | Before Juan | tate-and-liza-defeated |
| underwater-124 | Underwater: Route 124 | Before Juan | space-center |
| underwater-126 | Underwater: Route 126 | Before Juan | space-center |
| underwater-127 | Underwater: Route 127 | Before Juan | space-center |
| underwater-128 | Underwater: Route 128 | Before Juan | space-center |
| abandoned-ship-dive | Abandoned Ship: hidden rooms | Before Juan | space-center |
| sootopolis | Sootopolis City | Before Juan | space-center |
| seafloor-cavern | Seafloor Cavern | Before Juan | space-center |
| archie | Defeat Archie and awaken Kyogre | Before Juan | seafloor-cavern |
| cave-of-origin | Cave of Origin and Wallace | Before Juan | archie |
| sky-pillar | Sky Pillar: awaken Rayquaza | Before Juan | cave-of-origin |
| weather-resolved | Rayquaza ends the weather crisis | Before Juan | sky-pillar |
| rayquaza | Sky Pillar: Rayquaza encounter | Before Juan | weather-resolved |
| juan-defeated | Defeat Juan and receive Waterfall | Before Sidney | weather-resolved |
| meteor-falls-waterfall | Meteor Falls: upper chambers | Before Sidney | juan-defeated |
| sealed-chamber | Sealed Chamber: unlock the Regis | Before Juan | space-center, route-134 |
| island-cave | Island Cave: Regice | Before Juan | sealed-chamber |
| desert-ruins | Desert Ruins: Regirock | Before Juan | sealed-chamber |
| ancient-tomb | Ancient Tomb: Registeel | Before Juan | sealed-chamber |
| ever-grande | Ever Grande City and Waterfall | Before Sidney | juan-defeated |
| victory-road | Victory Road and Wally | Before Sidney | ever-grande |
| league | Pokémon League: before Sidney | Before Sidney | victory-road |
| sidney-defeated | Defeat Sidney | Before Phoebe | league |
| phoebe-defeated | Defeat Phoebe | Before Glacia | sidney-defeated |
| glacia-defeated | Defeat Glacia | Before Drake | phoebe-defeated |
| drake-defeated | Defeat Drake | Before Wallace | glacia-defeated |
| wallace-defeated | Defeat Wallace and enter the Hall of Fame | Hall of Fame | drake-defeated |
| national-dex | Receive the National Pokédex | Post-game | wallace-defeated |
| latias-latios | TV report: choose Latias or Latios | Post-game | national-dex |
| beldum-gift | Receive Beldum from Steven's house | Post-game | wallace-defeated |
| ss-tidal | S.S. Tidal and the Battle Frontier pass | Post-game | national-dex |
| battle-frontier | Battle Frontier | Post-game | ss-tidal |
| artisan-cave | Artisan Cave | Post-game | battle-frontier |
| sudowoodo | Battle Frontier: Sudowoodo | Post-game | battle-frontier |
| safari-expansion | Safari Zone: new areas | Post-game | national-dex |
| desert-underpass | Desert Underpass and the second fossil | Post-game | national-dex |
| altering-cave | Altering Cave: ordinary Zubat encounter | Post-game | national-dex |
| marine-cave | Weather Institute report: Marine Cave | Post-game | national-dex |
| terra-cave | Weather Institute report: Terra Cave | Post-game | national-dex |
| steven-rematch | Meteor Falls: Steven's final battle | Post-game | national-dex |
| johto-starter | Birch reward: complete the Hoenn Pokédex | Post-game | national-dex |

## Location checks

The local set contains 88 locations. A location can have several sources
and progress points. Source requirements keep fishing, Surf, Dive, Strength,
Waterfall, bike access, and special event actions separate.

Normal post-game coverage includes Beldum, the TV roaming choice, S.S. Tidal,
the Battle Frontier, Artisan Cave, Safari Zone expansion, Desert Underpass,
Altering Cave, Marine Cave, Terra Cave, and Steven’s final battle. The Hoenn Dex
reward is present, with its full Dex requirement.

External distribution islands and other-version species have explicit exclusion
records. Battle Frontier opponents and temporary rental Pokémon do not become
player acquisition sources.
