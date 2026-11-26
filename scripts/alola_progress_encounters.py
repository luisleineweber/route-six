"""Convert reviewed Alola encounter and gift facts to planner sources."""

from collections import defaultdict

from alola_progress import all_of, capability, encounter_name, level, milestone, req, review, slug, source

WILD = {
    "Walk": "grass", "Surf": "surf", "Fishing": "fishing", "Bubbling Spots": "fishing-spots",
    "Ambush": "ambush", "Berry Piles": "berry-piles", "Island Scan": "island-scan",
}
STARTERS = ("rowlet", "litten", "popplio")
FOSSILS = {
    "omanyte": "helix-fossil", "kabuto": "dome-fossil", "lileep": "root-fossil",
    "anorith": "claw-fossil", "cranidos": "skull-fossil", "shieldon": "armor-fossil",
    "tirtouga": "cover-fossil", "archen": "plume-fossil", "tyrunt": "jaw-fossil", "amaura": "sail-fossil",
}
SCAN_DAYS = ("sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday")
SCANS = (
    ("cyndaquil totodile deino horsea klink chikorita litwick",
     "gothita spheal luxio honedge venipede bellsprout marill",
     "rhyhorn swinub duosion roselia staravia vigoroth axew",
     "eelektross conkeldurr togekiss leavanny serperior samurott emboar"),
    ("charmander squirtle onix horsea scatterbug bulbasaur litwick",
     "ralts spheal combusken honedge beedrill grovyle marshtomp",
     "rhyhorn swinub prinplup grotle pidgeot monferno axew",
     "eelektross aggron rotom leavanny chesnaught greninja delphox"),
)
TRADES = (
    {"machop": ("spearow", "Hila", "male"), "bounsweet": ("lillipup", "Kihei", "female"),
     "poliwhirl": ("zubat", "Laule’a", "female"), "happiny": ("pancham", "Momoe", "female"),
     "golem-alola": ("haunter", "Sill", "male"), "steenee": ("granbull", "Kumu", "female"),
     "talonflame": ("bewear", "Anga", "male")},
    {"hawlucha": ("spearow", "Hila", "male"), "noibat": ("lillipup", "Kihei", "male"),
     "barboach": ("tentacool", "Yuichi", "female"), "arbok": ("trumbeak", "Miyo", "female"),
     "trevenant": ("phantump", "Sill", "male"), "shellos": ("granbull", "Kumu", "female"),
     "tauros": ("bewear", "Anga", "male")},
)
WORMHOLE_PAIRS = {
    "suicune": ("raikou", "entei"), "rayquaza": ("groudon", "kyogre"),
    "giratina": ("dialga", "palkia"), "landorus": ("tornadus", "thundurus"),
    "kyurem": ("reshiram", "zekrom"), "regigigas": ("regirock", "regice", "registeel"),
}
WORMHOLE_WILDS = {
    "abomasnow", "crustle", "hippowdon", "magcargo", "medicham",
    "altaria", "sigilyph", "swanna", "swellow", "yanmega",
    "audino", "drapion", "grumpig", "heliolisk", "nuzleaf",
    "barbaracle", "floatzel", "lombre", "quagsire", "stunfisk",
}
ULTRA_BEASTS = {"nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord"}
ULTRA_BEAST_MISSION_LIMITS = {"buzzwole": 2, "pheromosa": 4}
SOS_CALLERS = {
    "ambipom": "aipom", "baltoy": "trapinch krokorok dugtrio-alola", "blissey": "chansey",
    "butterfree": "caterpie metapod", "caterpie": "metapod", "chansey": "cleffa elekid riolu",
    "clefairy": "cleffa", "crawdaunt": "corphish", "crobat": "golbat", "dedenne": "togedemaru",
    "dragonair": "dratini", "dragonite": "dratini", "electabuzz": "elekid", "espeon": "eevee",
    "fearow": "scraggy", "fletchinder": "fletchling", "garbodor": "trubbish", "gengar": "haunter",
    "glalie": "snorunt", "golett": "trapinch krokorok dugtrio-alola", "golbat": "druddigon zubat",
    "gorebyss": "clamperl", "gumshoos": "yungoos", "gyarados": "magikarp",
    "happiny": "pichu igglybuff bonsly munchlax mime-jr cleffa smoochum elekid magby riolu",
    "huntail": "clamperl", "jigglypuff": "igglybuff", "jynx": "smoochum", "kangaskhan": "cubone",
    "kommo-o": "jangmo-o", "hakamo-o": "jangmo-o", "lanturn": "chinchou", "lopunny": "buneary",
    "lucario": "riolu", "lumineon": "finneon tentacruel", "magmar": "magby", "mareanie": "corsola",
    "miltank": "tauros", "mr-mime": "mime-jr", "mudsdale": "mudbray", "noctowl": "hoothoot",
    "octillery": "remoraid", "pawniard": "bisharp", "pangoro": "pancham", "persian-alola": "meowth-alola",
    "pikachu": "pichu", "pikipek": "trumbeak", "raticate-alola": "rattata-alola",
    "remoraid": "mantyke", "sableye": "carbink", "salamence": "bagon", "salazzle": "salandit",
    "seaking": "goldeen", "sharpedo": "carvanha", "shelgon": "bagon", "slowbro": "slowpoke",
    "slowking": "slowpoke", "snorlax": "munchlax", "starmie": "staryu", "stufful": "salandit",
    "sudowoodo": "bonsly", "tauros": "miltank", "togedemaru": "dedenne", "toucannon": "trumbeak",
    "trumbeak": "passimian oranguru", "umbreon": "eevee", "vikavolt": "charjabug",
    "volcarona": "larvesta", "wailord": "wailmer", "whiscash": "barboach",
    "wingull": "pyukumuku", "xatu": "natu", "zubat": "psyduck",
}
SOS_WEATHER = {"goomy": "rain", "sliggoo": "rain", "politoed": "rain", "poliwhirl": "rain",
               "poliwrath": "rain", "gabite": "sandstorm",
               "vanillite": "hail", "vanillish": "hail", "vanilluxe": "hail"}
SOS_HABITATS = {"Bubbling Spots": ("Bubbling Spots", "fishing-spots"), "Fishing": ("Fishing", "fishing"),
                "Surf": ("Surf", "surf"), "Ambush": ("Ambush", "ambush")}
PELAGO_INITIAL = (
    "spearow zubat kadabra magnemite shellder gastly murkrow wingull drifblim rufflet vullaby carbink pikipek",
    "zubat slowpoke seel staryu mr-mime jynx flaaffy corsola wingull pikipek cutiefly",
)


def item_row(id_, placements):
    return {"id": id_, "name": id_.replace("-", " ").title(), "sources": [
        {"id": f"alola-item-{id_}-{index}", "locationId": location, "requirements": requirements,
         "maxUses": limit, "choice": None, "review": review("alola-rules")}
        for index, (location, requirements, limit) in enumerate(placements, 1)
    ], "review": review("alola-rules")}


def fossil_paths(profiles, ultra, moon):
    items, sources = [], []
    sale = {"armor-fossil", "plume-fossil"} if moon else {"skull-fossil", "cover-fossil"}
    if ultra:
        sale |= {"dome-fossil", "root-fossil", "sail-fossil"} if moon else {"helix-fossil", "claw-fossil", "jaw-fossil"}
    for pokemon, fossil in FOSSILS.items():
        spots = []
        if fossil in sale:
            spots.append(("konikoni-city", all_of(), 1))
        if ultra:
            spots.append(("poke-pelago", capability("isle-aphun-fossils"), None))
        if spots:
            items.append(item_row(fossil, spots))
            sources.append(source(profiles, "route-8", pokemon, level(15), {"kind": "fossil", "itemId": fossil},
                                  review("alola-static", "alola-rules"), req("item", fossil, True)))
    return items, sources


def ordinary_rates(rows, method):
    if method not in {"Walk", "Surf", "Fishing", "Bubbling Spots"}:
        return False
    for period in ("Day", "Night"):
        relevant = [row for row in rows if not row.get("time") or period in row["time"]]
        if sum(row["chance"] for row in relevant) != 100:
            return False
    return True


def method_conditions(method, pokemon, selected, scans):
    periods = [period.lower() for period in selected.get("time", []) if period in {"Day", "Night"}]
    conditions = [{"kind": "time", "periods": periods}] if periods else []
    if method == "island-scan":
        conditions.append({"kind": "weekday", "day": scans[pokemon]})
    return conditions


def caller_ids(method, ally, table, edition):
    if "Weather" in method:
        return []
    habitat = next((table_name for fragment, (table_name, _) in SOS_HABITATS.items() if fragment in method), "Walk")
    possible = {ally, *SOS_CALLERS.get(ally, "").split()}
    return sorted({
        name for row in table.get(habitat, []) if row.get("version") in (None, edition)
        if (name := encounter_name(row["pokemon"])) in possible
    })


def encounters(game, profiles, tables):
    ultra, moon = game.startswith("ultra-"), game.endswith("moon")
    edition = ("Ultra " if ultra else "") + ("Moon" if moon else "Sun")
    items, sources = fossil_paths(profiles, ultra, moon)
    choices = [{"id": "alola-starter", "name": "First partner Pokémon", "options": list(STARTERS),
                "maximumSelections": 1, "review": review("alola-static")}]
    if not ultra:
        choices.append({"id": "nihilego-mission-location", "name": "Nihilego mission location",
                        "options": ["digletts-tunnel", "wela-volcano-park"], "maximumSelections": 1,
                        "review": review("alola-static")})
    scans = {pokemon: day for island in SCANS[ultra] for pokemon, day in zip(island.split(), SCAN_DAYS, strict=True)}

    def append(location, pokemon, levels, kind, requirements=None, limit=None, conditions=None,
               genders=None, choice=None):
        reviewed = review("alola-encounters" if kind["kind"] == "wild" else "alola-static")
        if kind.get("method") == "sos":
            reviewed = review("alola-encounters", "alola-sos")
        sources.append(source(profiles, location, pokemon, levels, kind, reviewed,
                              requirements, limit, choice, conditions, genders))

    for area, methods in tables.items():
        for method, provided in methods.items():
            rows = [row for row in provided if row.get("version") in (None, edition)]
            reliable_rates = ordinary_rates(rows, method)
            for row in rows:
                name = encounter_name(row["pokemon"])
                loc = slug(area)
                low, high = row["min_level"], row["max_level"]
                requirements = []
                if name == "gastrodon":
                    name = "gastrodon-east"
                if name == "magearna" or (method == "Gift" and name in FOSSILS):
                    continue
                if method == "Gift" and area == "Heahea Beach":
                    # These are Totem-sized forms, outside the current profile set.
                    continue
                if name not in profiles:
                    raise ValueError(f"{game}: unmapped encounter selection {row['pokemon']} in {area}")
                if method == "Static" and area == "Mahalo Trail":
                    # The gift and fixed templates describe one story encounter.
                    continue
                if method == "Static" and area == "Hau'oli City" and name in {"bewear", "hypno"}:
                    # City-wide and Shopping District records describe the same side events.
                    continue
                if method == "Static" and area.startswith("Ultra Space Wilds"):
                    if area.endswith("World)"):
                        continue  # The named alternate maps contain identical legendary slots.
                    for required in WORMHOLE_PAIRS.get(name, ()):
                        requirements.append(req("pokemon", required, False))
                if method == "Gift" and name in STARTERS:
                    append(loc, name, level(low), {"kind": "starter"}, limit=1,
                           choice={"groupId": "alola-starter", "optionId": name})
                    continue
                if area == "Poké Pelago":
                    at = {21: "ulaula", 37: "poni", 49: "champion"}[low]
                    append(loc, name, level(low, high + 6),
                           {"kind": "wild", "method": "poke-pelago", "ratePercent": None},
                           all_of(capability("poke-pelago"), milestone(at)))
                    continue
                if method in WILD or method.startswith("SOS Encounter"):
                    is_sos = method.startswith("SOS Encounter")
                    action = "sos" if is_sos else WILD[method]
                    conditions = method_conditions(action, name, row, scans)
                    if action != "grass":
                        requirements.append(capability(action))
                    if is_sos:
                        conditions.append({"kind": "sos", "callerIds": caller_ids(method, name, methods, edition),
                                           "weather": SOS_WEATHER.get(name) if "Weather" in method else None})
                        for habitat, (_, cap) in SOS_HABITATS.items():
                            if habitat in method:
                                requirements.append(capability(cap))
                        if "Weather" in method:
                            requirements.append(capability("weather-sos"))
                    if area == "Melemele Sea (Area 2)" and ultra:
                        requirements.append(capability("sharpedo-jet"))
                    if action == "island-scan" and row["pokemon"] == "Horsea":
                        requirements.append(capability("surf"))
                    append(loc, name, level(low, high),
                           {"kind": "wild", "method": action, "ratePercent": row["chance"] if reliable_rates else None},
                           all_of(*requirements), conditions=conditions)
                    continue
                if method == "NPC Trade":
                    name = {"graveler": "golem-alola", "graveler-alola": "golem-alola",
                            "phantump": "trevenant"}.get(name, name)
                    offered, trainer, gender = TRADES[ultra][name]
                    append(loc, name, level(low), {"kind": "game-trade", "offeredPokemonId": offered,
                                                   "traderName": trainer}, req("pokemon", offered, True),
                           limit=1, genders=[gender])
                    continue
                if method == "Static":
                    choice = None
                    if name.startswith("tapu-"):
                        requirements.append(milestone("champion"))
                    if name in ULTRA_BEASTS and not ultra:
                        mission = "ultra-beast-missions" if name == "nihilego" else "after-ultra-beast-missions"
                        requirements.append(milestone(mission))
                        if name == "nihilego":
                            choice = {"groupId": "nihilego-mission-location", "optionId": loc}
                    if name in {"bewear", "hypno"} and ultra:
                        requirements.append(milestone("after-olivia"))
                    if name == "ditto" and ultra and area == "Konikoni City":
                        requirements.append(capability("ditto-five-investigation"))
                    if name in ("gastly", "drifloon") and ultra:
                        requirements.extend((milestone("after-hala"), capability("night")))
                    if name == "zygarde" and ultra:
                        requirements.append(milestone("champion"))
                    if name in ({"wimpod"} | WORMHOLE_WILDS | (ULTRA_BEASTS if ultra else set())):
                        limit = None
                    elif name == "ditto" and ultra and area == "Konikoni City":
                        limit = 4
                    elif ultra and area == "Poni Grove" and name in {"blacephalon", "stakataka"}:
                        low = high = 60
                        limit = 2
                    else:
                        limit = ULTRA_BEAST_MISSION_LIMITS.get(name, 1)
                    append(loc, name, level(low, high), {"kind": "static"}, all_of(*requirements), limit=limit, choice=choice)
                    continue
                if method != "Gift":
                    raise ValueError(f"Unsupported Alola encounter method {method}")
                if name == "cosmog":
                    # The parallel world's lake name is opposite to the selected version.
                    loc = "lake-of-the-sunne" if moon else "lake-of-the-moone"
                    if ultra:
                        loc = "lake-of-the-moone" if moon else "lake-of-the-sunne"
                    requirements.extend((milestone("champion"), req("pokemon", "lunala" if moon else "solgaleo", False)))
                elif name in {"type-null", "porygon"}:
                    requirements.append(milestone("champion"))
                elif name == "poipole":
                    requirements.append(milestone("after-necrozma"))
                elif name == "pikachu" and ultra:
                    loc_requirements = req("location", "poni-wilds")
                    requirements.extend((loc_requirements, capability("mantine-surf-high-scores")))
                elif name == "zygarde":
                    requirements.append(capability("zygarde-fifty-cells"))
                    if low == 50:
                        requirements.append(milestone("champion"))
                append(loc, name, level(low), {"kind": "egg" if name == "eevee" else "gift"},
                       all_of(*requirements), limit=1)

    first = set(PELAGO_INITIAL[ultra].split()) - ({"rufflet"} if moon else {"vullaby"})
    for pokemon in sorted(first):
        append("poke-pelago", pokemon, level(11, 17),
               {"kind": "wild", "method": "poke-pelago", "ratePercent": None}, capability("poke-pelago"))
    if not ultra:
        append("ten-carat-hill-farthest-hollow", "necrozma", level(75), {"kind": "static"},
               milestone("after-ultra-beast-missions"), limit=1)
    return sources, items, choices
