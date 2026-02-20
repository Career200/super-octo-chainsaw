# Weapons Implementation Plan

## Current State

Biomon has a placeholder `<p>Combat info goes here</p>` in the right panel. Equipment tab has two sub-tabs: Gear and Armor. No weapon stores, types, or catalogs exist yet.

The system we're building into already has clear patterns:

| Layer                  | Armor (reference)                                                | Gear (reference)                                   |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| **Types**              | `ArmorTemplate` → `ArmorInstance` → `ArmorPiece` (merged)        | `GearTemplate` → `OwnedGearItem`                   |
| **Catalog**            | `ARMOR_CATALOG` in `scripts/armor/catalog.ts`                    | `GEAR_CATALOG` in `scripts/gear/catalog.ts`        |
| **Store (persistent)** | `$ownedArmor` (instances with SP state), `$customArmorTemplates` | `$gear` (id→qty), `$customGearItems` (definitions) |
| **Store (computed)**   | `$encumbrance`, `$customArmorList`                               | `$ownedGear`, `$customGear`, `$ownedGearCount`     |
| **Resolution**         | `resolveTemplate()` checks catalog→implants→custom               | Inline in `$ownedGear` computed                    |
| **UI atoms**           | `$selectedArmor` / `$addingArmor`, `$highlightedPart`            | `$selectedGear` / `$addingGear`                    |
| **Components**         | `ArmorListPanel`, `BodyPartGrid`, `BottomBarArmor`               | `GearPanel`, `BottomBarEquipment`                  |

**Skills store** already has `$combatSkills` (combat-flagged skills in order: Handgun, Rifle, Martial Arts, Heavy Weapons, SMG, Archery, Brawling, Dodge & Escape, Fencing, Melee, Athletics). Each weapon will reference one of these by name.

---

## Data Model

### WeaponTemplate (static catalog entry)

```ts
// src/scripts/weapons/catalog.ts

type WeaponType = "P" | "SMG" | "RIF" | "SHT" | "HVY" | "EX" | "melee"
// P=pistol, SMG=submachinegun, RIF=rifle, SHT=shotgun, HVY=heavy, EX=exotic, melee=melee

type Concealability = "P" | "J" | "L" | "N"
// Pocket, Jacket, Long coat, No way

type Reliability = "VR" | "ST" | "UR"
// Very Reliable, Standard, Unreliable

interface WeaponTemplate {
  templateId: string
  name: string
  type: WeaponType
  skill: string              // "Handgun", "Rifle", "Melee", "Fencing", etc.
  wa: number                 // weapon accuracy modifier
  concealability: Concealability
  availability: Availability
  damage: string             // dice expression: "2d6+3"
  ammo: string               // caliber: "10mm", "12ga", "5.56mm", "" for melee
  shots: number              // clip/magazine size, 0 for melee
  rof: number                // rate of fire per round
  reliability: Reliability
  range: number              // meters, 0 for melee
  cost: number
  description: string
  melee: boolean             // true → hides ammo/range fields, enables melee math
  smartchipped: boolean      // factory smartgun link - instances can be modified to add/remove this
}
```

**Why this shape:**
- Flat, matches the corebook weapon table column-for-column
- `skill` is a string linking to `$allSkills` by name — works for catalog and custom skills alike
- `melee: boolean` is Option A from the design doc: melee weapons exist, combat panel shows skill breakdown, no auto-calc for martial art bonuses yet. Upgrade path to Option C is adding `martialArt: boolean` to skills, not weapons.
- `ammo` field is caliber string for linking — empty for melee. Type (AP/std/match) is on the ammo item, not the weapon.

### WeaponInstance (owned, persistent)

```ts
interface WeaponInstance {
  id: string            // unique: "glock_a3f8"
  templateId: string    // references WeaponTemplate or custom
  currentAmmo: number   // rounds loaded
  currentAmmoType: string  // e.g. "std", "AP" — what's loaded right now
  smartchipActive: boolean // is the smartchip currently active (if applicable - and arguably it only matters for combat panel)
}
```

Minimal mutable state — just ammo tracking. No condition/durability for v1. The weapon's stats come from the template.

### WeaponPiece (merged view for rendering)

```ts
interface WeaponPiece extends WeaponTemplate {
  id: string
  currentAmmo: number
  currentAmmoType: string
  custom?: boolean
}
```

Same pattern as `ArmorPiece = ArmorTemplate + ArmorInstance`.

### Ammo — not a separate item type (yet)

Per the design doc, ammo links to weapons by caliber. But for v1, tracking ammo as separate inventory items with caliber matching adds significant complexity (ammo catalog, caliber enums, cross-highlighting between weapon and ammo panels, reload flow).

**Simpler v1:** weapon instances track `currentAmmo` / `shots` (loaded vs capacity). A "reload" action resets to full. Total ammo reserves can be gear items (`"10mm rounds"` with quantity) or just mental accounting. This covers 90% of combat use (how many shots left in this clip?) without the caliber-linking system.

**Upgrade path:** When we build the Weapons sub-tab in Inventory, ammo becomes its own type with caliber matching, the right panel shows ammo lists cross-linked to weapons, and reload pulls from reserves. The weapon instance shape doesn't change — just `currentAmmo` gets decremented from a tracked pool instead of refilled to max.

**Note on damage types:** Damage type (normal, AP, edged, mono, etc.) is a property of the *ammo*, not the weapon. A Glock fires normal 9mm or AP 9mm — same weapon, different damage interaction with armor. When ammo types are modeled, `currentAmmoType` on the weapon instance determines which damage type applies. This also means ammo type can alter the damage roll itself (e.g., AP rounds might do less raw damage but halve armor SP). For now this is flavor/reference only — the damage type system already exists in `armor/damage-types.ts` for the hit resolution side, it just isn't linked to weapons yet.

**Caliber → damage auto-fill (stopgap):** `CALIBER_DAMAGE` in `catalog.ts` maps common calibers to their standard damage dice. The custom weapon form auto-fills damage when a recognized caliber is entered. This is a convenience shortcut — when ammo becomes its own item type, **ammo will be the authoritative source of damage**, not the weapon. The weapon's `damage` field will become a display default that gets overridden by whatever ammo is loaded. The `CALIBER_DAMAGE` lookup may then move to or be superseded by the ammo catalog.

---

## Store Design

### New files

**`src/scripts/weapons/catalog.ts`** — `WEAPON_CATALOG: Record<string, WeaponTemplate>`, starting with corebook weapons. Helper function `w()` for concise template construction (same pattern as gear's `t()`).

**`src/stores/weapons.ts`** — persistence + actions + computed stores.

### Persistent atoms

| Store                    | Key                          | Shape                         | Notes                                                                     |
| ------------------------ | ---------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `$ownedWeapons`          | `"character-weapons"`        | `Record<id, WeaponInstance>`  | Owned weapon instances. Validated on decode (drop stale).                 |
| `$customWeaponTemplates` | `"character-custom-weapons"` | `Record<id, CustomWeaponDef>` | User-created weapon definitions. Same pattern as `$customArmorTemplates`. |

### Computed stores

| Store               | Depends on                                | Shape              | Purpose                                                                                    |
| ------------------- | ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `$allOwnedWeapons`  | `$ownedWeapons`, `$customWeaponTemplates` | `WeaponPiece[]`    | Hydrated list: template + instance state merged. Used by both Inventory and Combat panels. |
| `$customWeaponList` | `$customWeaponTemplates`                  | `WeaponTemplate[]` | For the Custom tab in weapon list.                                                         |

### Actions

```
acquireWeapon(templateId)     — create instance from catalog/custom template, full ammo
discardWeapon(instanceId)     — remove from $ownedWeapons
fireWeapon(instanceId, shots) — decrement currentAmmo
reloadWeapon(instanceId)      — reset currentAmmo to clip size
setAmmoType(instanceId, type) — change loaded ammo type
```

Custom weapon CRUD:
```
addCustomWeapon(fields)       — add to $customWeaponTemplates + acquire one
updateCustomWeapon(id, fields)
removeCustomWeapon(id)        — remove template + all instances
```

### UI atoms (in `ui.ts`)

```
$selectedWeapon / $addingWeapon — mutually exclusive pair, same pattern as armor/gear/skills
```

### Skill integration (read-only, no skill store changes)

The combat panel needs to show `REF + Handgun = Total` per weapon. This is a render-time computation, not a store:

```ts
// In component:
const skills = useStore($allSkills)
const REF = useStore($REF)
const skillEntry = skills[weapon.skill]
const skillLevel = skillEntry?.level ?? 0
const statValue = REF.current // almost always REF for combat skills
const total = statValue + skillLevel + weapon.wa
```

No new computed stores needed — `$allSkills` and stat stores already provide everything.

---

## Build Sequence

### Phase 1: Weapon data + store (foundation)

**Files:**
- `src/scripts/weapons/catalog.ts` — types + `WEAPON_CATALOG`
- `src/stores/weapons.ts` — persistent atoms, actions, computed stores
- `src/stores/ui.ts` — add `$selectedWeapon` / `$addingWeapon`

**What it does:** Weapons exist in the data layer. Nothing renders yet, but we can acquire/discard/fire/reload via store actions. Testable in isolation.

**Update:** `STORES.md`, `charsheet-dataflow.md`

### Phase 2: Equipment tab — Weapons sub-tab

**Files:**
- `src/components/charsheet/equipment/WeaponListPanel.tsx` — owned / custom / catalog tabs (same structure as `ArmorListPanel`)
- `src/components/charsheet/equipment/WeaponCard.tsx` — compact card: name, type badge, concealability, skill name
- `src/components/charsheet/equipment/BottomBarWeapon.tsx` — detail view + custom weapon form (reuse `BottomBarItemShell` if it exists, or the pattern from `BottomBarArmor`)
- `src/components/charsheet/equipment/EquipmentView.tsx` — add "Weapons" sub-tab

**Layout:** Single panel with `WeaponListPanel` (no body grid — weapons aren't location-bound). Later when ammo becomes its own type, this becomes `TwoPanelView` with weapons left / ammo right.

**What it does:** Players can browse the weapon catalog, acquire weapons, create custom weapons, manage inventory. Cards show logistics info (type, concealability, availability, cost) per the design doc principle — combat stats are secondary, shown in bottom bar detail.

### Phase 3: Biomon combat panel — weapon cards

**Files:**
- `src/components/charsheet/biomon/CombatPanel.tsx` — replaces the placeholder in `Biomonitor.tsx`
- `src/components/charsheet/biomon/WeaponCombatCard.tsx` — combat-focused card per weapon

**Layout:** List of owned weapons inside the existing right panel of biomon's `TwoPanelView`. Each card shows:

```
┌──────────────────────────────────────────────┐
│ Glock 20 (10mm)                    [🔫 12/15] │  ← name, ammo button (current/clip)
│ Range 50m │ WA +1 │ 2d6+3 │ RoF 2 │ ST      │  ← compact stat row, same layout between cards for scannability
│ REF 8 + Handgun 5 (+1 WA) = 14               │  ← skill breakdown, highlighted total as the most important number
│                                              │  ← To hit numbers are different by range, It'd make sense to show an approximate DC to the player. Point blank (<1m) is 10 (also full on point blank, gun to head, means max damage instead of a roll, but that's a help popup detail). Close - 1/4 weapon range is 15, Medium - 1/2 is 20, long range is 25, Extreme - 2x weapon range - is 30. Makes sense to show to the player this range/DC table with values computed from weapon range as a reference, but gotta figure out the UI for it.
└──────────────────────────────────────────────┘
```

**Ammo button:** Click → open a popover with ammo edit (steal layout from armor repair), later with ammo type selection and reserve tracking.

**Skill breakdown:** Reads `$allSkills[weapon.skill]` + `$REF` (or whatever stat the skill uses). Shows the formula. This is the killer feature — instant reference for "what do I roll?" and "What's my bonus?"

**What it does:** Players see their weapons during combat with all relevant stats, can track ammo, and get instant skill breakdowns. The biomon tab becomes functional for ranged combat.

### Phase 4 (later): Ammo system, smartchips, melee tab

Not part of this plan. Mentioned for upgrade path awareness:

- **Ammo as item type** — `AmmoTemplate`, `$ownedAmmo`, caliber linking, equipment sub-tab Weapons panel becomes TwoPanelView
- **Smartchip toggle** — manual toggle on combat card (green/gray chip icon), +2 WA when active. Eventually ties in with cyberware store - for smartchip to work we need both weapon mods and neuralware implants, but the toggle can exist stright away.
- **Melee tab** — sub-tab within CombatPanel (Ranged / Melee). Melee weapons show RoF = skill/3, damage + skill/2 (or full for martial arts once Option C from design doc is implemented). Brawling as synthetic weapon. Hand-2-hand should be thought out more delicately, it has different rules and priorities (maneuvres and martial arts)

---

## Risks and Decisions

**Decision: weapon instances vs quantity-based**
Armor uses instances (each piece has its own SP degradation state). Gear uses quantities (fungible). Weapons are instances — each weapon tracks its own ammo state, and players think of weapons as individual items ("my Glock", not "3 handguns").

**Decision: no ammo item type in v1**
Per above. Reload = reset to full. Ammo reserves are the player's problem (or a gear item). Reduces scope significantly.

**Decision: melee follows Option A**
Melee weapons exist with `melee: true`. Combat panel shows skill breakdown but doesn't auto-calc martial art bonuses. Upgrade to Option C (skill-side `martialArt` flag) is additive — weapon model doesn't change.

**Decision: no `$equippedWeapons` subset**
Unlike armor (worn/unworn affects SP calculations), there's no mechanical difference between an "equipped" and "stowed" weapon for this charsheet. All owned weapons show on combat panel. If the list gets long, scroll and potentially filter by type is the answer, not an equip toggle.

**Risk: weapon.skill string coupling**
Weapons reference skills by name string. If a skill is renamed in the catalog, the link breaks. Mitigation: skill names are stable identifiers (corebook-defined). Custom skills could be renamed — but weapon's `skill` field is user-editable (custom weapons, not editing owned copies), so they can fix it. Not worth an ID-based indirection layer.

## Caliber damage lookup
5mm	1d6
.25 ACP	1d6+1
.22 Long Rifle	1d6
6mm	1d6+1
7mm	1d6+2
.38	1d6+2
9mm	2d6+1
.41 CL	2d6+1
10mm	2d6+3
Militech 88 ISTS	3d6
.338	3d6
.357 Magnum	3d6+1
.45ACP	2d6+2
.400 Cor-Bon	3d6
.40S&W	2d6+3
11mm	3d6
CA 10.4mm	3d6+3
.408 Magnum	3d6+2
.41 Magnum	3d6+2
12mm	4d6+1
.44 Magnum	4d6
.454 Casull	4d6+3
.50AE (12.7mm)	4d6+2
.44 Cor-Bon Magnum	4d6+3
.525 Magnum Express	5d6
.577 Boomer Magnums	5d6AP
14mm Malorian Short	6d6
4.5mm Liquid Prop	4d6
5.5mm Chinese	4d6+2
5.56mm NATO	5d6
5.54mm PACT	5d6
5.7mm Caseless	3d6
6mm Caseless	5d6
7mm Federated Caseless	5d6
7mm Can Long	6d6-2
7.62mm Sov Short	5d6+2
7.62mm Sov Long	6d6
7.62mm NATO Long	6d6+2
6.5CL Hybrid	6d6-1
9mm CL Long	2d6+4
.300 Winchester Magnum	7d6+3
12.7mm BMG / .50 BMG	6d10
20mm Reduced	4d10
14.5mm	7d10
15mm BMG	7d10
15mm Kurz	4d10+3
20mm	8d10
30mm	10d10
