#!/usr/bin/env node
// Validates a corridor dataset against the schema documented in
// .claude/skills/route-stop-planner/SKILL.md. Usage: node scripts/validate.mjs [file...]
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const AMENITIES = ["fuel", "grocery", "pharmacy"];
const STATUSES = new Set(["yes", "limited", "no", "unknown"]);

const files = process.argv.slice(2);
const targets = files.length
  ? files
  : readdirSync("data").filter((f) => f.endsWith(".json")).map((f) => join("data", f));

let failed = 0;

for (const file of targets) {
  const errors = [];
  const warnings = [];
  let d;
  try {
    d = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON — ${e.message}`);
    failed++;
    continue;
  }

  for (const k of ["id", "title", "origin", "destination", "routes", "stops"]) {
    if (d[k] == null) errors.push(`missing top-level "${k}"`);
  }
  if (!d.dataAsOf) warnings.push(`no "dataAsOf" — readers cannot judge staleness`);

  const stopIds = new Set(Object.keys(d.stops ?? {}));
  const used = new Set();

  for (const [id, stop] of Object.entries(d.stops ?? {})) {
    if (!stop.name) errors.push(`stop "${id}": missing name`);
    for (const key of AMENITIES) {
      const a = stop.amenities?.[key];
      if (!a) {
        errors.push(`stop "${id}": missing amenities.${key} (use {"status":"unknown"} if unresearched)`);
        continue;
      }
      if (!STATUSES.has(a.status)) errors.push(`stop "${id}": amenities.${key}.status "${a.status}" not one of ${[...STATUSES].join("|")}`);
      if (a.status === "yes" && !a.names?.length && !a.noteJa) warnings.push(`stop "${id}": amenities.${key} is "yes" with no business name or note`);
    }
  }

  const routeIds = new Set();
  for (const r of d.routes ?? []) {
    if (routeIds.has(r.id)) errors.push(`duplicate route id "${r.id}"`);
    routeIds.add(r.id);
    if (!r.legs?.length) { errors.push(`route "${r.id}": no legs`); continue; }
    let prev = -Infinity;
    for (const leg of r.legs) {
      if (!stopIds.has(leg.stop)) errors.push(`route "${r.id}": leg references unknown stop "${leg.stop}"`);
      else used.add(leg.stop);
      if (typeof leg.mile !== "number") errors.push(`route "${r.id}": leg "${leg.stop}" has no numeric mile`);
      else if (leg.mile < prev) errors.push(`route "${r.id}": mile ${leg.mile} at "${leg.stop}" goes backwards`);
      else prev = leg.mile;
      if (leg.detour && typeof leg.detourMi !== "number") warnings.push(`route "${r.id}": leg "${leg.stop}" marked detour without detourMi`);
    }
    if (r.distance != null) {
      const last = r.legs[r.legs.length - 1];
      if (Math.abs(last.mile - r.distance) > Math.max(12, r.distance * 0.15)) {
        warnings.push(`route "${r.id}": distance ${r.distance} disagrees with last milepost ${last.mile}`);
      }
    }
  }

  if ((d.routes ?? []).filter((r) => r.default).length > 1) errors.push(`more than one route marked default`);
  for (const id of stopIds) if (!used.has(id)) warnings.push(`stop "${id}" is not on any route`);

  for (const w of warnings) console.warn(`  ! ${file}: ${w}`);
  for (const e of errors) console.error(`  ✗ ${file}: ${e}`);
  if (errors.length) failed++;
  else console.log(`✓ ${file} — ${(d.routes ?? []).length} routes, ${stopIds.size} stops, ${warnings.length} warnings`);
}

process.exit(failed ? 1 : 0);
