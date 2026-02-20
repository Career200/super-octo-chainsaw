# Store Schema

## Persistent Atoms

### `$health` (health.ts)
```
{ physical: 0-40, stun: 0-40, stabilized: bool }
```
Actions: `takeDamage`, `heal`, `setDamage`, `setStabilized`, `syncStunToPhysical`, `resetHealth`

### `$stats` (stats.ts)
```
{ [ref|int|cl|tech|lk|att|ma|emp|bt]: { inherent: number, cyber: number } }
```
Actions: `setStatInherent`, `setStatCyber`

### `$customArmorTemplates` (armor/)
```
Record<string, CustomArmorDef>
CustomArmorDef: { name, type: "soft"|"hard", spMax, bodyParts: BodyPartName[], ev, cost, description, availability }
```
Custom armor definitions — user-created extension to `ARMOR_CATALOG`. Persists independently of instances. Used by `resolveTemplate()` to hydrate owned instances.

Actions: `addCustomArmor`, `updateCustomArmor`, `removeCustomArmor`
Helper: `isCustomArmor(id)` — true if not in `ARMOR_CATALOG` or `IMPLANT_TEMPLATES`

### `$ownedArmor` (armor/)
```
Record<instanceId, { id, templateId, spByPart: { [bodyPart]: currentSP }, worn: bool }>
```
Actions: `acquireArmor`, `toggleArmor`, `wearArmor`, `damageArmor`, `setArmorSP`, `discardArmor`
Implants: `installImplant`, `uninstallImplant`, `installSkinweave`, `repairImplant`
Reads: `getArmorPiece`, `getBodyPartLayers`, `getImplantsForPart`, `getInstalledImplants`, `getSkinweaveLevel`, `isImplantInstalled`, `getImplantTemplates`
Template resolution: `resolveTemplate()` — checks `ARMOR_CATALOG` + `IMPLANT_TEMPLATES` + `$customArmorTemplates`

### `$damageHistory` (damage-history.ts)
```
Array<DamageHistoryEntry | ManipulationHistoryEntry>
DamageHistoryEntry includes optional: headMultiplied, btm, woundDamage
```
Actions: `recordDamage`, `recordManipulation`, `clearHistory`

### `$notes` (notes.ts)
```
{ freeform: string, contacts: [{ id, name, note }] }
```
Actions: `setFreeformNote`, `addContact`, `updateContact`, `removeContact`

### `tabStore()` factory (ui.ts)
```
tabStore(key: string, defaultVal: string) → WritableAtom<string>
```
Creates/returns a cached `persistentAtom<string>` per key. Invalid stored values fall back to default.

Keys in use:
- `spa-tab` (default: `"combat"`) — SPA-level tab, read by Charsheet + BottomBar
- `equipment-sub-tab` (default: `"gear"`) — Armor/Gear sub-tab in EquipmentView
- `armor-list-tab` (default: `"catalog"`) — Catalog/Custom/Owned in ArmorListPanel
- `gear-tab` (default: `"catalog"`) — Catalog/Custom/Owned in GearPanel
- `weapon-list-tab` (default: `"catalog"`) — Catalog/Custom/Owned in WeaponListPanel
- `skills-filter` (default: `"default"`) — Default/Custom/My in StatsSkillsPanel
- `notes-tab` (default: `"notes"`) — Notes/Contacts in NotesPanel

### `$selectedSkill` (ui.ts)
```
string | null (default: null)
```
Currently selected skill name for the bottom bar. Non-persistent (resets on reload).
Mutually exclusive with `$addingSkill` — use `selectSkill()` to set.

### `$addingSkill` (ui.ts)
```
boolean (default: false)
```
Whether the add-custom-skill form is open in the bottom bar. Non-persistent.
Mutually exclusive with `$selectedSkill` — use `startAddingSkill()` to set.

### `$skills` (skills.ts)
```
Record<string, { stat: SkillStat, level: 0-10, combat: bool }>
```
**Sparse persistence**: only stores catalog skills with level > 0 and all custom skills. Catalog skills at level 0 are NOT stored — they come from `SKILL_CATALOG` via `$allSkills`.

Old format (all catalog skills at level 0) is dropped on load — no migration.

Actions: `setSkillLevel`, `addSkill`, `removeSkill`, `updateSkill`
Helper: `isCustomSkill(name)` — true if not in `SKILL_CATALOG`

### `$gear` (gear.ts)
```
Record<string, number>
```
**Sparse persistence**: stores templateId/customName → quantity for all owned gear. Entries with quantity 0 are removed. Works for both catalog and custom items — definitions come from `GEAR_CATALOG` or `$customGearItems`.

Actions: `addGear`, `removeGear`

### `$customGearItems` (gear.ts)
```
Record<string, CustomGearDef>
CustomGearDef: { name, description, type, cost?, availability? }
```
Custom gear definitions — user-created extension to `GEAR_CATALOG`. Persists independently of quantity (items survive at qty 0). Validated for shape on decode.

Actions: `addCustomGear`, `updateCustomGear`, `removeCustomGear`
Helper: `isCustomGear(id)` — true if not in `GEAR_CATALOG`

### `$ownedWeapons` (weapons.ts)
```
Record<instanceId, { id, templateId, currentAmmo, currentAmmoType, smartchipActive }>
```
Owned weapon instances. Each weapon tracks its own ammo state. Validated on decode.

Actions: `acquireWeapon`, `discardWeapon`, `fireWeapon`, `reloadWeapon`, `setCurrentAmmo`, `setAmmoType`, `setSmartchipActive`
Template resolution: `resolveWeaponTemplate()` — checks `WEAPON_CATALOG` + `$customWeaponTemplates`
Helper: `isCustomWeapon(id)` — true if not in `WEAPON_CATALOG`

### `$customWeaponTemplates` (weapons.ts)
```
Record<string, CustomWeaponDef>
CustomWeaponDef: { name, type, skill, wa, concealability, availability, damage, ammo, shots, rof, reliability, range, cost, description, melee, smartchipped }
```
Custom weapon definitions — user-created extension to `WEAPON_CATALOG`. Persists independently of instances.

Actions: `addCustomWeapon`, `updateCustomWeapon`, `removeCustomWeapon`

### `$selectedWeapon` (ui.ts)
```
string | null (default: null)
```
Currently selected weapon instance ID for the bottom bar. Non-persistent.
Mutually exclusive with `$addingWeapon` — use `selectWeapon()` to set.

### `$addingWeapon` (ui.ts)
```
boolean (default: false)
```
Whether the add-custom-weapon form is open in the bottom bar. Non-persistent.
Mutually exclusive with `$selectedWeapon` — use `startAddingWeapon()` to set.

### `$selectedArmor` (ui.ts)
```
string | null (default: null)
```
Currently selected armor instance/template ID for the bottom bar. Non-persistent.
Mutually exclusive with `$addingArmor` — use `selectArmor()` to set.

### `$addingArmor` (ui.ts)
```
boolean (default: false)
```
Whether the add-custom-armor form is open in the bottom bar. Non-persistent.
Mutually exclusive with `$selectedArmor` — use `startAddingArmor()` to set.

### `$highlightedPart` (ui.ts)
```
BodyPartName | null (default: null)
```
Body part being highlighted on the inventory body grid. Non-persistent.
Use `highlightPart()` to set/toggle.

### `$selectedGear` (ui.ts)
```
string | null (default: null)
```
Currently selected gear item ID (templateId or custom name) for the bottom bar. Non-persistent.
Mutually exclusive with `$addingGear` — use `selectGear()` to set.

### `$addingGear` (ui.ts)
```
boolean (default: false)
```
Whether the add-custom-gear form is open in the bottom bar. Non-persistent.
Mutually exclusive with `$selectedGear` — use `startAddingGear()` to set.

## Computed Stores

### Per-stat: `$REF`, `$INT`, `$CL`, `$TECH`, `$LK`, `$ATT`, `$MA`, `$EMP`, `$BT` (stats.ts)
```
{ inherent, cyber, total, current, penalties: string[] }
```
- `total` = inherent + cyber
- `current` = total - wound penalties - EV penalty (REF only)
- REF, INT, CL, TECH, MA: affected by wounds
- REF: also affected by $encumbrance

### `$bodyType` (stats.ts)
```
{ bt, name, carry, lift, btm, save }
```
Depends on: `$BT`, `$health` (wound penalties on save)

### `$encumbrance` (armor/)
```
number (total EV)
```
Depends on: `$ownedArmor` (worn armor EV + layer penalty)

### `$character` (character.ts)
```
{ health, woundLevel, stunLevel, ev }
```
Aggregator. Depends on: `$health`, `$encumbrance`

### `$woundLevel` (character.ts)
```
string | null (e.g. "Light", "Serious", "Mortal 2")
```
Depends on: `$health`

### `$allSkills` (skills.ts)
```
Record<string, { stat: SkillStat, level: 0-10, combat: bool }>
```
Full view: all catalog skills (hydrated with stored levels) + all custom skills.
Depends on: `$skills`

### `$skillTotal` (skills.ts)
```
number
```
Sum of all skill levels. Depends on: `$allSkills`

### `$awareness` (skills.ts)
```
{ int, awarenessNotice, combatSense, total, totalCombat }
```
- `total` = INT.current + skills["Awareness/Notice"].level
- `totalCombat` = total + skills["Combat Sense"].level
- Depends on: `$INT`, `$allSkills`

### `$skillsByStat` (skills.ts)
```
Record<SkillStat, [name, SkillEntry][]>
```
Skills grouped by stat, sorted alphabetically within each group.
Depends on: `$allSkills`

### `$combatSkills` (skills.ts)
```
[name, SkillEntry][]
```
Skills with `combat: true`, ordered by `COMBAT_SKILLS_ORDER` then alphabetically.
Depends on: `$allSkills`

### `$mySkills` (skills.ts)
```
[name, SkillEntry][]
```
All skills with level > 0 (both default and custom).
Depends on: `$allSkills`

### `$mySkillsCount` (skills.ts)
```
number
```
Count of skills with level > 0.
Depends on: `$mySkills`

### `$customSkills` (skills.ts)
```
[name, SkillEntry][]
```
Non-catalog entries from `$skills` store.
Depends on: `$skills`

### `$ownedGear` (gear.ts)
```
OwnedGearItem[] (each: GearTemplate + quantity + custom?)
```
All owned gear (qty > 0): catalog items hydrated from `GEAR_CATALOG`, custom items from `$customGearItems`. `custom: true` flag on custom items.
Depends on: `$gear`, `$customGearItems`

### `$ownedGearCount` (gear.ts)
```
number
```
Total quantity of all owned gear.
Depends on: `$ownedGear`

### `$customGear` (gear.ts)
```
OwnedGearItem[] (custom: true)
```
All custom gear definitions with current quantities (including qty 0).
Depends on: `$gear`, `$customGearItems`

### `$allOwnedWeapons` (weapons.ts)
```
WeaponPiece[] (each: WeaponTemplate + instance state + custom?)
```
All owned weapons: instances hydrated with template data from `WEAPON_CATALOG` or `$customWeaponTemplates`. Used by both Inventory and Combat panels.
Depends on: `$ownedWeapons`, `$customWeaponTemplates`

### `$customWeaponList` (weapons.ts)
```
WeaponTemplate[]
```
All custom weapon definitions as full `WeaponTemplate` objects.
Depends on: `$customWeaponTemplates`

### `$customArmorList` (armor/)
```
ArmorTemplate[]
```
All custom armor definitions as full `ArmorTemplate` objects.
Depends on: `$customArmorTemplates`

## Dependency Graph (compact)
```
$health ──┬──▸ stat penalties (REF, INT, CL, TECH, MA)
          ├──▸ $bodyType.save
          ├──▸ $woundLevel
          └──▸ $character

$stats ────▸ all 9 computed stat stores ──▸ $bodyType

$customArmorTemplates ──▸ $customArmorList
                       ──▸ resolveTemplate() (used by $ownedArmor load, getArmorPiece, acquireArmor, setArmorSP)

$ownedArmor ──▸ $encumbrance ──▸ $REF, $character

$damageHistory (standalone, no dependents)

HitPopover reads $bodyType.btm, mutates $health via takeDamage

$notes (standalone, no dependents)

tabStore() ────▸ TabStrip (6 persisted keys, see factory docs above)

$gear ──────────┬──▸ $ownedGear ──▸ $ownedGearCount
$customGearItems┼──▸ $customGear
                └──▸ GearPanel (catalog + custom + owned views)

$ownedWeapons ─────────┬──▸ $allOwnedWeapons (hydrated with templates)
$customWeaponTemplates─┼──▸ $customWeaponList
                       └──▸ resolveWeaponTemplate() (used by acquireWeapon, reloadWeapon, $allOwnedWeapons)

$selectedWeapon ◂──▸ $addingWeapon (mutually exclusive via selectWeapon/startAddingWeapon)

$selectedArmor ◂──▸ $addingArmor (mutually exclusive via selectArmor/startAddingArmor)
$highlightedPart ──▸ BodyPartCard (highlight), ArmorListPanel (highlight cards)

$selectedGear ◂──▸ $addingGear (mutually exclusive via selectGear/startAddingGear)

$selectedSkill ◂──▸ $addingSkill (mutually exclusive via selectSkill/startAddingSkill)

$skills ──┬──▸ $allSkills ──┬──▸ $awareness (+ $INT)
          │                 ├──▸ $skillsByStat
          │                 ├──▸ $skillTotal
          │                 ├──▸ $combatSkills
          │                 └──▸ $mySkills ──▸ $mySkillsCount
          └──▸ $customSkills
```
