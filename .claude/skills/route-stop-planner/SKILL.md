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
3. **Research each stop.** Do not answer from memory: settlements lose their
   only gas station, and a store's hours are the whole point of the page. Use
   `WebSearch` per town for "gas station / grocery / pharmacy", and prefer the
   business's own site or the town's tourism page over an aggregator. Record
   what you found in `sources`.
4. **Write `data/<id>.json`** to the schema below.
5. **Validate**: `node scripts/validate.mjs data/<id>.json` — it must pass with
   zero errors; read the warnings before dismissing them.
6. **Preview**: `python3 scripts/serve.py` then open
   `http://localhost:8000/?data=data/<id>.json`. (Use this, not
   `python3 -m http.server`, which drops the UTF-8 charset and mangles the
   Japanese copy.)
7. **Link it** from `README.md`.

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
      "recommended": true,         // a place worth planning the day's resupply around
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

## Writing the notes

The reader is holding a steering wheel. Say what changes their decision:
where the last reliable fuel is before a long empty stretch, which store closes
at 18:00 or on Sunday, which town is the only one with a pharmacy, what a
detour actually costs in miles and minutes. Skip scenery and history.

## Viewer

`index.html` is corridor-agnostic — it reads `?data=data/<id>.json`
(default `data/zion-bryce.json`), builds the tabs from `routes`, and remembers
the reader's last route in `localStorage`. Change it only for behaviour that
every corridor needs; anything corridor-specific belongs in the dataset.
