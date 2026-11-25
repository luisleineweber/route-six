"""Build the four Alola Progress Planner packages from reviewed encounter tables."""

import argparse
import csv
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GAMES = ROOT / "data" / "games"
SHARED = GAMES / "shared"
GAME_IDS = ("sun", "moon", "ultra-sun", "ultra-moon")
COLLECTIONS = ("milestones", "bosses", "locations", "capabilities", "items", "choices",
               "sources", "evolutions", "breedingRules", "formChanges", "exclusions")
DATE = "2026-11-24"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def read_encounter_dump(path):
    data = path.read_text(encoding="utf-8").strip()
    prefix = "export const encounters = "
    if not data.startswith(prefix):
        raise ValueError(f"Unexpected encounter dump format: {path}")
    data = data.removeprefix(prefix).removesuffix(";")
    data = re.sub(r'([{,]\s*)(pokemon|min_level|max_level|chance|time|version):', r'\1"\2":', data)
    return json.loads(re.sub(r",(?=\s*[}\]])", "", data))


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def compact_progress(path, collections):
    lines = []
    for key, rows in collections.items():
        records = ",\n".join("    " + json.dumps(row, ensure_ascii=False, separators=(",", ":")) for row in rows)
        lines.append(f'  "{key}": [\n{records}\n  ]' if records else f'  "{key}": []')
    path.write_text("{\n" + ",\n".join(lines) + "\n}\n", encoding="utf-8")


def slug(value):
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    normalized = re.sub(r"['’]", "", normalized)
    return re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")


def review(*refs):
    return {"referenceIds": list(refs), "checkedOn": DATE}


def req(kind, id_, consumed=None):
    result = {"kind": kind, "id": id_}
    if consumed is not None:
        result.update(quantity=1, consumed=consumed)
    return result


def all_of(*requirements):
    if len(requirements) == 1:
        return requirements[0]
    return {"kind": "all", "requirements": list(requirements)}


def capability(id_):
    return req("capability", id_)


def milestone(id_):
    return req("milestone", id_)


def level(minimum, maximum=None):
    if maximum is None or minimum == maximum:
        return {"kind": "fixed", "value": minimum}
    return {"kind": "range", "minimum": minimum, "maximum": maximum}


def deduplicate(rows):
    return list({json.dumps(row, sort_keys=True): row for row in rows}.values())


def csv_rows(path, stem):
    with (path / (stem + ".csv")).open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def profiles_for(pair):
    profiles = {}
    for p in read_json(SHARED / "alola" / "pokemon.json") + read_json(SHARED / pair / "pokemon.json"):
        profiles[p["pokemonId"]] = (p["pokemonId"], None, p["genders"], p["breeding"])
        for form in p.get("forms", []):
            profiles[form["formId"]] = (p["pokemonId"], form["formId"], form["genders"], form["breeding"])
    return profiles


def encounter_name(name):
    aliases = {"Nidoran♀": "nidoran-f", "Nidoran♂": "nidoran-m", "Nidoran F": "nidoran-f",
               "Nidoran M": "nidoran-m", "Flabébé": "flabebe", "Mr. Mime": "mr-mime",
               "Mime Jr.": "mime-jr", "Type: Null": "type-null"}
    if name in aliases:
        return aliases[name]
    if name.startswith("Alolan "):
        return slug(name.removeprefix("Alolan ")) + "-alola"
    if " (" in name:
        base, form = name.rstrip(")").split(" (", 1)
        variants = {"Basculin (Blue Striped)": "basculin-blue-striped",
                    "Lycanroc (Midnight)": "lycanroc-midnight",
                    "Oricorio (Pom Pom)": "oricorio-pom-pom", "Oricorio (Pau)": "oricorio-pau",
                    "Oricorio (Sensu)": "oricorio-sensu", "Shellos (East Sea)": "shellos-east",
                    "Gastrodon (East Sea)": "gastrodon-east"}
        return variants.get(name, slug(base))
    return slug(name)


def source(profiles, location, selection, levels, details, reviewed, requirements=None, max_uses=None,
           choice=None, conditions=None, genders=None):
    pokemon, form, profile_genders, _ = profiles[selection]
    row = {"pokemonId": pokemon, "formId": form, "locationId": location, "details": details,
           "level": levels, "genders": profile_genders if genders is None else genders,
           "requirements": requirements or all_of(), "maxUses": max_uses, "choice": choice,
           "review": reviewed}
    if conditions:
        row["encounterConditions"] = conditions
    return row


def source_ids(rows):
    counts = defaultdict(int)
    result = []
    for row in deduplicate(rows):
        selection = row["formId"] or row["pokemonId"]
        method = row["details"].get("method", row["details"]["kind"])
        stem = f'alola-{row["locationId"]}-{selection}-{method}'
        counts[stem] += 1
        result.append({"id": f"{stem}-{counts[stem]}", **row})
    return result


def build_game(data_path, id_, encounter_tables):
    from alola_progress_encounters import encounters
    from alola_progress_evolutions import evolutions_and_breeding
    from alola_progress_story import story

    ultra = id_.startswith("ultra-")
    pair = "ultra-sun-ultra-moon" if ultra else "sun-moon"
    profiles = profiles_for(pair)
    game_path = GAMES / id_ / "game.json"
    game = read_json(game_path)
    package, checkpoints = story(id_, encounter_tables, slug, review, all_of, milestone, capability)
    start = package["milestones"][0]["id"]
    game.update(firstMilestoneId=start, planner={"defaultMilestoneId": start, "checkpoints": checkpoints})
    package["sources"], package["items"], package["choices"] = encounters(id_, profiles, encounter_tables)
    package["evolutions"], package["breedingRules"], package["formChanges"], breed_sources = (
        evolutions_and_breeding(data_path, id_, profiles, package["items"], package["sources"])
    )
    package["sources"] = source_ids(package["sources"] + breed_sources)
    return game, profiles, package


def available_selections(package):
    """Close the offline sources under evolution, form change, and breeding."""
    reached = {s["formId"] or s["pokemonId"] for s in package["sources"]
               if s["details"]["kind"] not in {"breeding", "game-trade"}}
    while True:
        found = reached.copy()
        for s in package["sources"]:
            if s["details"]["kind"] == "game-trade" and s["details"]["offeredPokemonId"] in reached:
                found.add(s["formId"] or s["pokemonId"])
        for row in package["evolutions"]:
            if row["trigger"] != "player-trade" and (row["fromFormId"] or row["fromPokemonId"]) in reached:
                found.add(row["toFormId"] or row["toPokemonId"])
                found.update(row["coProductIds"])
        for row in package["formChanges"]:
            if (row["fromFormId"] or row["pokemonId"]) in reached:
                if row.get("fusionPartnerPokemonId") is None or row["fusionPartnerPokemonId"] in reached:
                    found.add(row["toFormId"] or row["pokemonId"])
        for rule in package["breedingRules"]:
            if reached.intersection(rule.get("parentFormIds", rule["parentPokemonIds"])):
                found.update(rule["offspringPokemonIds"])
        if found == reached:
            return found
        reached = found


def exclusions_for(profiles, own, counterpart, package):
    events = {"mew", "celebi", "jirachi", "deoxys", "phione", "manaphy", "darkrai", "shaymin",
              "arceus", "victini", "keldeo", "meloetta", "genesect", "diancie", "hoopa", "volcanion",
              "magearna", "marshadow", "zeraora", "lycanroc-dusk"}
    sources = {row["formId"] or row["pokemonId"] for row in package["sources"]
               if row["details"]["kind"] != "breeding"}
    trade_evolutions = {row["toFormId"] or row["toPokemonId"] for row in package["evolutions"]
                        if row["trigger"] == "player-trade"}
    for selection, (pokemon, form, *_unused) in profiles.items():
        if selection in own or selection in sources or selection in trade_evolutions:
            continue
        if selection in counterpart:
            reason, explanation = "other-version", "This Pokémon or form requires another version in Alola."
        elif selection in events:
            reason, explanation = "external-event", "This Pokémon or form requires a distribution or external event."
        else:
            reason, explanation = "external-connection", "No native path is documented in this edition. A transfer or trade may be required."
        yield {"pokemonId": pokemon, "formId": form, "reason": reason, "explanation": explanation,
               "review": review("alola-encounters", "alola-static")}


def shared_rows(packages):
    return {
        key: [row for row in packages[0][key] if all(row in package[key] for package in packages[1:])]
        for key in COLLECTIONS
    }


def without(package, shared):
    return {key: [row for row in package[key] if row not in shared[key]] for key in COLLECTIONS}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Directory containing the pinned table inputs")
    args = parser.parse_args()
    games = []
    for id_ in GAME_IDS:
        tables = read_encounter_dump(args.input / ("usum.js" if id_.startswith("ultra-") else "sm.js"))
        games.append(build_game(args.input, id_, tables))
    reachable = [available_selections(package) for _, _, package in games]
    for index, (game, profiles, package) in enumerate(games):
        package["exclusions"] = list(exclusions_for(profiles, reachable[index],
                                                     reachable[index ^ 1], package))
        write_json(GAMES / game["id"] / "game.json", game)
        print(game["id"], len(package["sources"]), "sources", len(reachable[index]), "native selections")
    common = shared_rows([package for _, _, package in games])
    compact_progress(SHARED / "alola" / "progress.json", common)
    for pair, index in (("sun-moon", 0), ("ultra-sun-ultra-moon", 2)):
        packages = [without(games[i][2], common) for i in (index, index + 1)]
        pair_shared = shared_rows(packages)
        compact_progress(SHARED / pair / "progress.json", pair_shared)
        for package, i in zip(packages, (index, index + 1), strict=True):
            compact_progress(GAMES / GAME_IDS[i] / "progress.json", without(package, pair_shared))


if __name__ == "__main__":
    main()
