---
name: route-stop-planner
description: Build a switchable supply-stop map for a road-trip corridor — which towns lie between two points, and whether each has fuel, groceries, and a pharmacy. Use when the user asks what towns/services are between two places on a drive, asks to compare alternate routes between them, or asks to add a corridor to this repo. Covers researching the stops, writing the dataset, and rendering it with the existing viewer.
---

# Route stop planner

Produces one artifact per corridor: a JSON dataset in `data/<id>.json` that the
shared viewer (`index.html`) renders with a route switcher. Adding a corridor
means writing data — never a new page.

## Procedure

1. **Pin the corridor.** Origin, destination, and the traveller's constraint
   (RV/oversize vehicle, winter, needs a prescription filled, wants the scenic
   way). The constraint decides which alternate routes are worth listing.
2. **Enumerate the routes.** A route earns an entry only if a real traveller
   would pick it: the fastest way, a bypass forced by a vehicle or seasonal
   restriction, or a modest detour that buys services the main route lacks.
   Mark resupply detours as separate routes rather than hiding them in notes —
   that is what the switcher is for. Exactly one route gets `"default": true`.
3. **Check the rules before the shops.** Size limits, seasonal closures,
   permits and fees change between seasons and get rewritten outright — the
   Zion tunnel's escort permit became a flat ban in June 2026, which silently
   invalidated every "pay $15 and you're through" note written before it.
   Verify each restriction against a current source and date it, and treat
   anything you remember about a rule as a lead to check, not a fact.
4. **Research each stop.** Do not answer from memory: settlements lose their
   only gas station, and a store's hours are the whole point of the page. Use
   `WebSearch` per town for "gas station / grocery / pharmacy", and prefer the
   business's own site or the town's tourism page over an aggregator. Record
   what you found in `sources`.
5. **Write `data/<id>.json`** to the schema below.
6. **Validate**: `node scripts/validate.mjs data/<id>.json` — it must pass with
   zero errors; read the warnings before dismissing them.
7. **Preview**: `python3 scripts/serve.py` then open
   `http://localhost:8000/?data=data/<id>.json`. (Use this, not
   `python3 -m http.server`, which drops the UTF-8 charset and mangles the
   Japanese copy.)
8. **Link it** from `README.md`.

## Schema

```jsonc
{
  "schemaVersion": 1,
  "id": "zion-bryce",              // matches the filename
  "title": "Zion NP → Bryce Canyon NP",
  "titleJa": "…",                  // *Ja fields are what the viewer shows
  "region": "Grand Circle / Southern Utah",
  "origin":      { "name": "…", "nameJa": "…", "lat": 0, "lon": 0 },
  "destination": { "name": "…", "nameJa": "…", "lat": 0, "lon": 0 },
  "units": "mi",
  "dataAsOf": "2026-09",           // required in practice: readers judge staleness by it
  "sources": ["https://…"],

  // Corridor-wide costs. "Is there a toll?" is rarely just about tolls — park
  // entrances, permits and passes are what the money question really means.
  // Answer it even when the answer is "no tolls", and say what it costs
  // instead. `routes` limits an entry to the routes it applies to.
  "feesJa": [
    { "titleJa": "通行料（有料道路）", "amountJa": "なし", "noteJa": "…" },
    { "titleJa": "ザイオン国立公園 入園料", "amountJa": "$35 / 台（7日間）",
      "routes": ["A", "C", "D"], "noteJa": "…" }
  ],

  "routes": [{
    "id": "A",                     // 1–2 chars; shown in the tab shield
    "name": "UT-9 Tunnel → US-89 → UT-12 (main)",
    "nameJa": "…",
    "default": true,               // exactly one route across the file
    "distance": 86,                // in `units`, origin → destination
    "durationMin": 110,
    "summaryJa": "…",              // one or two sentences: who picks this route and why
    "warningsJa": ["…"],           // vehicle limits, seasonal closures, fees, cost of the detour
    "legs": [
      { "stop": "springdale", "mile": 0 },
      { "stop": "panguitch", "mile": 75, "detour": true, "detourMi": 14 },
      { "stop": "tropic",    "mile": 90, "optional": true }
    ]
  }],

  "stops": {
    "springdale": {
      "name": "Springdale", "nameJa": "…",
      "kind": "town",              // town | city | village | junction | poi
      "population": 600,
      "lat": 0, "lon": 0,
      "recommended": true,         // worth planning the day's resupply around
      "popular": true,             // a name travellers already know from blogs
      "noteJa": "…",               // what a driver actually needs to know here
      "amenities": {
        "fuel":     { "status": "yes",     "names": ["…"], "hours": "…", "noteJa": "…" },
        "grocery":  { "status": "limited", "names": ["…"], "noteJa": "…" },
        "pharmacy": { "status": "no",      "noteJa": "…" }
      }
    }
  }
}
```

### Rules the viewer and validator depend on

- All three amenity keys (`fuel`, `grocery`, `pharmacy`) appear on **every**
  stop. Unresearched is `{"status": "unknown"}`, not an omitted key — a missing
  key and a confirmed absence must not look the same.
- `status` is one of `yes` / `limited` / `no` / `unknown`. Reserve `yes` for a
  real one of the thing: a full supermarket, a dispensing pharmacy, a station a
  driver can count on. A convenience store is `limited` grocery; a shelf of
  painkillers in a general store is `limited` pharmacy, never `yes`. This
  distinction is the entire value of the page — over-grading it strands people.
- `mile` is measured along **that route** from the origin and must not decrease.
  The same stop carries different miles on different routes; that is expected.
- Set `detour`/`detourMi` on the leg, not the stop: a town is a detour only
  relative to a given route.
- A stop that is only worth visiting for certain onward plans gets
  `"optional": true` on the leg.
- Every stop needs a real `lat`/`lon`. The map view plots from them, so a
  guessed coordinate puts a town in the wrong valley — look it up rather than
  estimating from the highway.
- `recommended` and `popular` answer different questions and must not be
  merged. `recommended` is a claim about supplies — the reader can finish
  their shopping here. `popular` only says the place is well known, which is
  why a famous overlook with no services still carries it. A stop earns
  `recommended` from its own amenities, never from its fame; grant it when at
  least two of the three amenities are `yes`, or when it is the only stop
  offering something over a long stretch. Blog-famous stops with no services
  are still worth listing: a reader who sees the name with no fuel chip stops
  planning to buy anything there.

## Writing the notes

The reader is holding a steering wheel. Say what changes their decision:
where the last reliable fuel is before a long empty stretch, which store closes
at 18:00 or on Sunday, which town is the only one with a pharmacy, what a
detour actually costs in miles and minutes. Skip scenery and history.

## Viewer

`index.html` is corridor-agnostic — it reads `?data=data/<id>.json`
(default `data/zion-bryce.json`), builds the tabs from `routes`, and remembers
the reader's last route in `localStorage`. Stops render collapsed to one row
each — milepost, name, and a fuel/grocery/pharmacy status chip — so the whole
corridor fits on one screen; the row expands to the notes and店舗詳細 on click.
Keep new per-stop copy short enough to live in that expanded panel rather than
widening the collapsed row.

The 地図 view is the second way to pick a route. It projects the stops'
`lat`/`lon` (equirectangular, longitudes squeezed by cos of the mean latitude)
and draws each route through them, so it shows real relative positions — but
straight segments between stops, not road geometry, which the caption says out
loud. Two details make it work and are worth preserving when editing:

- A `detour` leg is drawn as a dashed spur off the last on-route stop instead
  of bending the corridor through it, which is what makes Panguitch and Kanab
  read as side trips.
- Routes that share a trunk (A, C and D are identical apart from their spurs)
  would otherwise be indistinguishable to a click. Each route's click target
  is the geometry no other route has; a route with none — the plain trunk —
  keeps its whole line. Adding a route that duplicates another's geometry
  exactly will make one of them unselectable on the map. Change it only for behaviour that
every corridor needs; anything corridor-specific belongs in the dataset.
