"""Alola story checkpoints, location access, and field actions."""

import re


def story(game_id, tables, slug, review, all_of, milestone, capability):
    ultra = game_id.startswith("ultra-")
    moon = game_id.endswith("moon")
    refs = review("alola-ultra-story" if ultra else "alola-original-story")
    package = {key: [] for key in ("milestones", "bosses", "locations", "capabilities")}
    checkpoints = []
    gates = {}

    def step(id_, name, locations=(), boss=None, postgame=False):
        rows = package["milestones"]
        rows.append({"id": id_, "name": name, "kind": "boss" if boss else "story",
                     "phase": "post-game" if postgame else "main-story", "displayOrder": len(rows) * 10,
                     "previousIds": [rows[-1]["id"]] if rows else [], "locationId": None,
                     "nextBossId": id_ if boss else None, "review": refs})
        gates.update((location, id_) for location in locations)
        if boss:
            kind, boss_name, highest_level, type_ = boss
            package["bosses"].append({"id": id_, "name": boss_name, "highestLevel": highest_level,
                                      "kind": kind, "review": refs})
            checkpoints.append({"milestoneId": id_, "label": name, "title": name,
                                "detail": boss_name, "typeId": type_})

    def trial(number, id_, place, name, level, type_, locations=()):
        step(id_, f"Trial {number}: {place}", locations, ("trial", name, level, type_))

    def grand(id_, who, level, type_):
        step(id_, f"Grand Trial: {who}", (), ("grand-trial", who, level, type_))

    step("alola-start", "First partner Pokémon", ("Iki Town", "Route 1"))
    checkpoints.append({"milestoneId": "alola-start", "label": "First partner Pokémon",
                        "title": "First partner Pokémon", "detail": "Start of the island challenge",
                        "typeId": None})
    step("trainer-school", "Trainers’ School and Hau’oli City",
         ("Route 1 (Hau'oli Outskirts)", "Route 1 (Trainers' School)", "Hau'oli City",
          "Hau'oli City (Shopping District)", "Hau'oli City (Beachfront)", "Melemele Sea"))
    trial(1, "trial-ilima", "Verdant Cavern", "Alolan Raticate" if moon else "Gumshoos", 12, "normal",
          ("Route 2", "Hau'oli Cemetery", "Berry Fields"))
    step("after-ilima", "Verdant Cavern trial complete",
         ("Verdant Cavern", "Verdant Cavern (Trial Site)", "Route 3", "Melemele Meadow",
          "Seaward Cave", "Kala'e Bay"))
    grand("grand-trial-hala", "Hala", 16 if ultra else 15, "fighting")
    step("after-hala", "Tauros Charge", ("Ten Carat Hill", "Ten Carat Hill (Farthest Hollow)"))
    step("akala", "Arrive on Akala Island",
         ("Heahea Beach", "Heahea City", "Route 4", "Paniola Town", "Paniola Ranch", "Route 5"))
    trial(2, "trial-lana", "Brooklet Hill", "Araquanid" if ultra else "Wishiwashi", 20, "water",
          ("Brooklet Hill",))
    step("after-lana", "Fishing Rod and Route 6", ("Brooklet Hill (Totem's Den)", "Route 6", "Sandy Cave"))
    trial(3, "trial-kiawe", "Wela Volcano Park", "Alolan Marowak" if ultra else "Salazzle", 22, "fire",
          ("Royal Avenue", "Route 7", "Wela Volcano Park"))
    step("after-kiawe", "Charizard Glide", ("Poké Pelago", "Route 8", "Dividing Peak Tunnel"))
    trial(4, "trial-mallow", "Lush Jungle", "Lurantis", 24, "grass")
    step("after-mallow", "Diglett’s Tunnel opens",
         ("Lush Jungle", "Diglett's Tunnel", "Route 9", "Konikoni City", "Memorial Hill",
          "Akala Outskirts", "Ruins of Life"))
    grand("grand-trial-olivia", "Olivia", 28 if ultra else 27, "rock")
    step("after-olivia", "Hano Beach and Aether Paradise", ("Hano Beach", "Aether Paradise"))
    step("ulaula", "Arrive on Ula’ula Island",
         ("Malie City", "Malie City (Outer Cape)", "Malie Garden", "Route 10", "Mount Hokulani"))
    trial(5, "trial-sophocles", "Hokulani Observatory", "Togedemaru" if ultra else "Vikavolt",
          33 if ultra else 29, "electric")
    step("after-sophocles", "Road to Tapu Village",
         ("Route 11", "Route 12", "Blush Mountain", "Secluded Shore", "Ula'ula Beach", "Route 13",
          "Tapu Village", "Route 14"))
    trial(6, "trial-acerola", "Abandoned Megamart", "Mimikyu", 35 if ultra else 33, "ghost")
    step("after-acerola", "Sharpedo Jet and Po Town",
         ("Thrifty Megamart (Abandoned Site)", "Route 15", "Route 16", "Ula'ula Meadow",
          "Route 17", "Haina Desert", "Ruins of Abundance", "Lake of the Sunne", "Lake of the Moone", "Po Town"))
    grand("grand-trial-nanu", "Nanu", 44 if ultra else 39, "dark")
    step("poni", "Arrive on Poni Island",
         ("Seafolk Village", "Poni Wilds", "Ancient Poni Path", "Poni Breaker Coast", "Ruins of Hope"))
    step("exeggutor-island", "Exeggutor Island", ("Exeggutor Island",))
    if not ultra:
        grand("grand-trial-hapu", "Hapu", 48, "ground")
    trial(7, "trial-poni", "Vast Poni Canyon", "Kommo-o", 49 if ultra else 45, "dragon",
          ("Vast Poni Canyon",))
    step("altar", "Poni altar", ("Altar of the Moone", "Altar of the Sunne", "Ultra Megalopolis"))
    if ultra:
        step("after-necrozma", "Ultra Necrozma defeated", ("Mahalo Trail",))
        trial(8, "trial-mina", "Mina’s trial", "Ribombee", 55, "fairy")
        grand("grand-trial-hapu", "Hapu", 54, "ground")
    step("pokemon-league", "Pokémon League", ("Mount Lanakila",),
         ("elite-four", "Elite Four", 57 if ultra else 55, None))
    step("champion", "Alola Champion", ("Ruins of Conflict", "Poni Grove", "Poni Plains", "Poni Meadow",
                                        "Resolution Cave", "Poni Coast", "Poni Gauntlet", "Team Rocket's Castle"),
         postgame=True)
    if not ultra:
        step("ultra-beast-missions", "Ultra Beast missions", postgame=True)
        step("after-ultra-beast-missions", "Ultra Beast missions complete", postgame=True)
    final = package["milestones"][-1]
    checkpoints.append({"milestoneId": final["id"], "label": "Post-game",
                        "title": "Post-game", "detail": final["name"], "typeId": None})

    next_boss = None
    for row in reversed(package["milestones"]):
        next_boss = row["nextBossId"] or next_boss
        row["nextBossId"] = next_boss

    def unlock(id_, name, at=None):
        package["capabilities"].append({"id": id_, "name": name,
                                        "requirements": milestone(at) if at else all_of(), "review": refs})

    unlock("sos", "SOS battles", "after-ilima")
    unlock("island-scan", "Island Scan")
    unlock("surf", "Lapras Paddle", "trial-lana")
    unlock("fishing", "Fishing Rod", "after-lana")
    unlock("fishing-spots", "Bubbling fishing spots", "after-lana")
    unlock("berry-piles", "Berry piles")
    unlock("ambush", "Ambush encounters")
    unlock("poke-pelago", "Poké Pelago", "after-kiawe")
    unlock("tauros-charge", "Tauros Charge", "after-hala")
    unlock("breeding", "Pokémon Nursery", "akala")
    unlock("sharpedo-jet", "Sharpedo Jet", "after-acerola")
    unlock("machamp-shove", "Machamp Shove", "poni")
    unlock("move-reminder", "Move Reminder", "pokemon-league")
    unlock("ultra-warp-ride", "Ultra Warp Ride", "after-necrozma" if ultra else "champion")
    for id_, name in (("day", "Daytime"), ("night", "Nighttime"), ("friendship", "High friendship"),
                      ("affection", "Pokémon Refresh affection"), ("rain", "Overworld rain"),
                      ("upside-down", "Turn the console upside down"),
                      ("stat-training", "Train Attack and Defense"), ("personality", "Personality value"),
                      ("party-space", "An empty slot in the party")):
        unlock(id_, name)
    unlock("weather-sos", "An SOS battle with rain, hail, or sandstorm", "after-ilima")
    unlock("evolution-stone-hunt", "Brilliant-Stone Hunting on Isle Aphun", "after-kiawe")
    unlock("find-razor-claw", "Find a Razor Claw held by a wild Jangmo-o, Hakamo-o, or Kommo-o", "trial-poni")
    if ultra:
        unlock("isle-aphun-fossils", "Rare-Treasure Hunting on Isle Aphun", "after-kiawe")
        unlock("mantine-surf-high-scores", "Set high scores on all four Mantine Surf courses", "poni")
        unlock("ditto-five-investigation", "Report to the officer after the Route 9 Ditto battle", "after-mallow")
    else:
        unlock("zygarde-fifty-cells", "Gather 50 Zygarde Cells and Cores", "after-acerola")

    added_locations = {"Hau'oli City", "Route 7", "Route 8", "Route 16", "Po Town", "Paniola Ranch", "Royal Avenue",
                       "Konikoni City", "Poké Pelago", "Ruins of Conflict", "Route 1", "Mount Lanakila",
                       "Lush Jungle", "Blush Mountain", "Ten Carat Hill (Farthest Hollow)", "Haina Desert",
                       "Ultra Megalopolis", "Poni Grove", "Route 10"}
    if not ultra:
        added_locations.discard("Ultra Megalopolis")
    for name in sorted(set(tables) | added_locations):
        base = re.sub(r" \(Area \d+\)$", "", name)
        at = gates.get(name, gates.get(base))
        more = []
        if name == "Route 1 (Area 3)":
            # The eastern tall grass lies behind Tauros rocks.
            at = "after-hala"
        if name == "Route 1 (Hau'oli Outskirts) (Area 2)":
            at = "trainer-school"
        if name == "Route 1 (Trainers' School)":
            at = "trainer-school"
        if ultra and name == "Lush Jungle (Area 2)":
            more.append(capability("machamp-shove"))
        if base.startswith("Ultra ") and base != "Ultra Megalopolis":
            at = "after-necrozma"
            more.append(capability("ultra-warp-ride"))
        if base == "Sandy Cave":
            more.append(capability("surf"))
        if at is None:
            raise ValueError(f"{game_id}: no reviewed access gate for {name}")
        location_id = slug(name)
        if re.fullmatch(r"route-\d+", location_id):
            parent = next(row for row in package["milestones"] if row["id"] == at)
            route_id = f"alola-{location_id}"
            package["milestones"].append({"id": route_id, "name": name, "kind": "route",
                                          "phase": parent["phase"], "displayOrder": 1000 + int(location_id[6:]),
                                          "previousIds": [at], "locationId": location_id,
                                          "nextBossId": parent["nextBossId"], "review": refs})
        package["locations"].append({"id": location_id, "name": name,
                                     "requirements": all_of(milestone(at), *more), "review": refs})
    return package, checkpoints
