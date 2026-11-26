"""Alola evolution rules, Pokémon Nursery eggs, and persistent form changes."""

from copy import deepcopy

from alola_progress import SHARED, all_of, capability, csv_rows, level, milestone, read_json, req, review, source
from alola_progress_encounters import item_row

REVIEW = review("alola-rules", "gen7-personal")
REGIONAL_FAMILIES = (
    ("rattata", "raticate"), ("sandshrew", "sandslash"), ("vulpix", "ninetales"),
    ("diglett", "dugtrio"), ("meowth", "persian"), ("geodude", "graveler", "golem"),
    ("grimer", "muk"),
)
STONES = (
    "dawn-stone", "dusk-stone", "fire-stone", "ice-stone", "leaf-stone", "moon-stone",
    "shiny-stone", "sun-stone", "thunder-stone", "water-stone",
)
NECTARS = {
    None: ("red-nectar", "ulaula-meadow"),
    "oricorio-pom-pom": ("yellow-nectar", "melemele-meadow"),
    "oricorio-pau": ("pink-nectar", "royal-avenue"),
    "oricorio-sensu": ("purple-nectar", "poni-meadow"),
}


def evolution(profiles, first, second, minimum=None, conditions=(), requirements=None, item=None,
              trigger="level-up"):
    parent, parent_form, parent_genders, _ = profiles[first]
    target, target_form, target_genders, _ = profiles[second]
    genders = None
    if not set(parent_genders).issubset(target_genders):
        genders = [{"from": g, "to": g} for g in parent_genders if g in target_genders]
    return {"id": f"alola-evolve-{first}-{second}", "fromPokemonId": parent, "fromFormId": parent_form,
            "toPokemonId": target, "toFormId": target_form, "trigger": trigger, "minimumLevel": minimum,
            "itemId": item, "conditions": list(conditions), "genderTransitions": genders,
            "requirements": requirements or all_of(), "coProductIds": [], "review": REVIEW}


def known_move(move, name, learn_level):
    tutor = all_of(capability("move-reminder"), req("item", "heart-scale", True))
    routes = [{"kind": "teach", "minimumLevel": learn_level, "requirements": tutor}]
    if learn_level > 1:
        routes.insert(0, {"kind": "level-up", "level": learn_level})
    return {"kind": "known-move", "moveId": move, "moveName": name, "learning": routes}


def legacy_evolutions():
    replace = {"magnezone", "probopass", "leafeon", "glaceon", "raichu", "exeggutor", "marowak"}
    for row in read_json(SHARED / "xy" / "evolutions.json"):
        if row["toPokemonId"] in replace:
            continue
        row = deepcopy(row)
        row["id"] = row["id"].replace("xy-", "alola-", 1)
        row["fromFormId"] = row.get("fromFormId")
        row["toFormId"] = row.get("toFormId")
        row["review"] = REVIEW
        yield row


def alola_evolutions(data_path, game, profiles):
    ultra, moon = game.startswith("ultra-"), game.endswith("moon")
    species = {r["id"]: r for r in csv_rows(data_path, "pokemon_species")}
    for rule in csv_rows(data_path, "pokemon_evolution"):
        if rule["version_group_id"] not in ("17", "18"):
            continue
        number = int(rule["evolved_species_id"])
        if number < 722 or rule["required_pokemon_form_id"] or rule["location_id"]:
            continue
        row = species[str(number)]
        first = species[row["evolves_from_species_id"]]["identifier"]
        second = row["identifier"]
        if second not in profiles or second in ({"solgaleo"} if moon else {"lunala"}):
            continue
        conditions, requirements = [], []
        if time := rule["time_of_day"]:
            conditions.append({"kind": "time", "period": time})
            requirements.append(capability(time))
        if rule["minimum_happiness"]:
            conditions.append({"kind": "friendship", "minimum": 220})
            requirements.append(capability("friendship"))
        if rule["known_move_id"] == "23":
            conditions.append(known_move("stomp", "Stomp", 29))
        if rule["known_move_id"] == "406":
            conditions.append(known_move("dragon-pulse", "Dragon Pulse", 1))
        yield evolution(profiles, first, second, int(rule["minimum_level"] or 0) or None,
                        conditions, all_of(*requirements))

    location_evolutions = [
        ("magneton", "magnezone", "vast-poni-canyon"), ("nosepass", "probopass", "vast-poni-canyon"),
        ("charjabug", "vikavolt", "vast-poni-canyon"), ("eevee", "leafeon", "lush-jungle"),
        ("eevee", "glaceon", "mount-lanakila"),
        ("crabrawler", "crabominable", "mount-lanakila-area-1" if ultra else "mount-lanakila"),
    ]
    if ultra:
        location_evolutions += [(a, b, "blush-mountain") for a, b, _ in location_evolutions[:3]]
    for first, second, place in location_evolutions:
        row = evolution(profiles, first, second, conditions=[{"kind": "location", "locationId": place}])
        row["id"] += "-" + place
        yield row

    for first, second, stone in (("pikachu", "raichu-alola", "thunder-stone"),
                                 ("exeggcute", "exeggutor-alola", "leaf-stone"),
                                 ("sandshrew-alola", "sandslash-alola", "ice-stone"),
                                 ("vulpix-alola", "ninetales-alola", "ice-stone")):
        yield evolution(profiles, first, second, requirements=req("item", stone, True),
                        item=stone, trigger="use-item")
    for first, second, minimum in (("rattata-alola", "raticate-alola", 20),
                                   ("cubone", "marowak-alola", 28),
                                   ("grimer-alola", "muk-alola", 38),
                                   ("diglett-alola", "dugtrio-alola", 26),
                                   ("geodude-alola", "graveler-alola", 25)):
        night = second in {"raticate-alola", "marowak-alola"}
        yield evolution(profiles, first, second, minimum, [{"kind": "time", "period": "night"}] if night else [],
                        capability("night") if night else None)
    yield evolution(profiles, "graveler-alola", "golem-alola", trigger="player-trade")
    yield evolution(profiles, "meowth-alola", "persian-alola",
                    conditions=[{"kind": "friendship", "minimum": 220}], requirements=capability("friendship"))
    time = "night" if moon else "day"
    yield evolution(profiles, "rockruff", "lycanroc-midnight" if moon else "lycanroc", 25,
                    [{"kind": "time", "period": time}], capability(time))
    if ultra:
        warp = capability("ultra-warp-ride")
        for first, second, stone in (("pikachu", "raichu", "thunder-stone"),
                                     ("exeggcute", "exeggutor", "leaf-stone")):
            yield evolution(profiles, first, second, requirements=all_of(warp, req("item", stone, True)),
                            item=stone, trigger="use-item")
        yield evolution(profiles, "cubone", "marowak", 28, requirements=warp)


def breeding_rules(data_path, profiles):
    result = read_json(SHARED / "xy" / "breeding-rules.json")
    for row in result:
        row["id"] = row["id"].replace("xy-", "alola-", 1)
        row["review"] = REVIEW
        if row["id"] == "alola-breed-shellos-east":
            row["offspringPokemonIds"] = ["shellos-east"]
        family = next((family for family in REGIONAL_FAMILIES if family[0] in row["offspringPokemonIds"]), None)
        if family:
            row["requiredHeldItemId"] = "everstone"
    families = {family[0]: [p + "-alola" for p in family] for family in REGIONAL_FAMILIES}
    species = {r["id"]: r for r in csv_rows(data_path, "pokemon_species")}
    for number, row in species.items():
        if not 722 <= int(number) <= 807:
            continue
        name = row["identifier"]
        if name not in profiles or profiles[name][3]["eggGroupIds"] == ["undiscovered"]:
            continue
        ancestor = row
        while parent := ancestor["evolves_from_species_id"]:
            ancestor = species[parent]
        base = ancestor["identifier"]
        families.setdefault(base, []).append(name)
        if name == "lycanroc":
            families[base].append("lycanroc-midnight")
    for style in (id_ for id_ in profiles if id_.startswith("oricorio-")):
        result.append({"id": "alola-breed-" + style, "parentPokemonIds": [], "parentFormIds": [style],
                       "offspringPokemonIds": [style], "requiredHeldItemId": None, "review": REVIEW})
    for base, parents in families.items():
        result.append({"id": "alola-breed-" + (parents[0] if base in {f[0] for f in REGIONAL_FAMILIES} else base),
                       "parentPokemonIds": [p for p in parents if profiles[p][1] is None],
                       "parentFormIds": [p for p in parents if profiles[p][1] is not None],
                       "offspringPokemonIds": [base + "-alola" if base in {f[0] for f in REGIONAL_FAMILIES} else base],
                       "requiredHeldItemId": None, "review": REVIEW})
    return result


def retained_native_rules(rules, sources, evolutions, form_changes):
    reachable = {row["formId"] or row["pokemonId"] for row in sources}
    selected = []
    while True:
        known = reachable.copy()
        for row in evolutions:
            if row["trigger"] != "player-trade" and (row["fromFormId"] or row["fromPokemonId"]) in reachable:
                reachable.add(row["toFormId"] or row["toPokemonId"])
        for row in form_changes:
            if (row["fromFormId"] or row["pokemonId"]) in reachable:
                reachable.add(row["toFormId"] or row["pokemonId"])
        for row in rules:
            if reachable.intersection(row["parentPokemonIds"] + row.get("parentFormIds", [])):
                reachable.update(row["offspringPokemonIds"])
                if row not in selected:
                    selected.append(row)
        if known == reachable:
            return selected


def form_changes(profiles, ultra, moon):
    rows = []

    def change(pokemon, before, after, requirements, partner=None, item=None):
        record = {"id": f"alola-form-{before or pokemon}-to-{after or pokemon}", "pokemonId": pokemon,
                  "fromFormId": before, "toFormId": after, "heldItemId": item,
                  "requirements": requirements, "review": REVIEW}
        if partner:
            record["fusionPartnerPokemonId"] = partner
        rows.append(record)

    for target, (nectar, _location) in NECTARS.items():
        for initial in NECTARS:
            if initial != target:
                change("oricorio", initial, target, req("item", nectar, True))
    for form in (id_ for id_ in profiles if id_.startswith("rotom-")):
        requirement = req("location", "route-1")
        change("rotom", None, form, requirement)
        change("rotom", form, None, requirement)
    if ultra:
        form, partner = ("necrozma-dawn", "lunala") if moon else ("necrozma-dusk", "solgaleo")
        change("necrozma", None, form, milestone("pokemon-league"), partner)
        change("necrozma", form, None, milestone("pokemon-league"))
    return rows


def item_sources(items, evolutions, rules, ultra):
    ids = {row["itemId"] for row in evolutions if row["itemId"]}
    ids |= {condition["itemId"] for row in evolutions for condition in row["conditions"]
            if condition["kind"] == "held-item"}
    ids |= {r["requiredHeldItemId"] for r in rules if r["requiredHeldItemId"]}
    ids |= {"heart-scale", "poke-ball"}
    known = {
        "heart-scale": [("konikoni-city", all_of(), None)],
        "poke-ball": [("hauoli-city", all_of(), None)],
        "everstone": [("hauoli-city", milestone("after-hala"), 1)],
        "oval-stone": ([] if ultra else [("paniola-ranch", all_of(), 1)])
        + [("poke-pelago", capability("evolution-stone-hunt"), None)],
        "razor-claw": ([("tapu-village", all_of(), 1)] if ultra else [])
        + [("vast-poni-canyon", capability("find-razor-claw"), None)],
    }
    for item in sorted(ids):
        places = list(known.get(item, []))
        if item in STONES:
            places.append(("poke-pelago", capability("evolution-stone-hunt"), None))
        if item in {"fire-stone", "water-stone", "thunder-stone", "leaf-stone"}:
            places.append(("konikoni-city", all_of(), None))
        if item == "ice-stone":
            places.append(("po-town", all_of(), 1))
        if item.endswith("-incense"):
            places.append(("konikoni-city", all_of(), None))
        # Trade-only items have no native effect on the solver. Keep the item reference
        # even when a location has not been verified.
        items.append(item_row(item, places))
    for nectar, location in NECTARS.values():
        items.append(item_row(nectar, [(location, capability("day"), None)]))


def evolutions_and_breeding(path, game, profiles, items, encounter_sources):
    ultra, moon = game.startswith("ultra-"), game.endswith("moon")
    evolutions = list(legacy_evolutions()) + list(alola_evolutions(path, game, profiles))
    changes = form_changes(profiles, ultra, moon)
    rules = retained_native_rules(breeding_rules(path, profiles), encounter_sources, evolutions, changes)
    item_sources(items, evolutions, rules, ultra)
    eggs = []
    for rule in rules:
        parents = [capability("breeding")]
        if item := rule["requiredHeldItemId"]:
            parents.append(req("item", item, False))
        for outcome in rule["offspringPokemonIds"]:
            eggs.append(source(profiles, "paniola-ranch", outcome, level(1),
                               {"kind": "breeding", "ruleId": rule["id"], "capabilityId": "breeding"},
                               REVIEW, all_of(*parents)))
    return evolutions, rules, changes, eggs
