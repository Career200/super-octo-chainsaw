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

### `$ownedArmor` (armor.ts)
```
Record<instanceId, { id, templateId, spByPart: { [bodyPart]: currentSP }, worn: bool }>
```
Actions: `acquireArmor`, `toggleArmor`, `wearArmor`, `damageArmor`, `setArmorSP`, `discardArmor`
Implants: `installImplant`, `uninstallImplant`, `installSkinweave`, `repairImplant`
Reads: `getArmorPiece`, `getBodyPartLayers`, `getImplantsForPart`, `getInstalledImplants`, `getSkinweaveLevel`, `isImplantInstalled`, `getImplantTemplates`

### `$damageHistory` (damage-history.ts)
```
Array<DamageHistoryEntry | ManipulationHistoryEntry>
```
Actions: `recordDamage`, `recordManipulation`, `clearHistory`

### `$notes` (notes.ts)
```
{ freeform: string, contacts: [{ id, name, note }] }
```
Actions: `setFreeformNote`, `addContact`, `updateContact`, `removeContact`

### `$spaTab` (ui.ts)
```
'biomon' | 'dossier' | 'equipment' (default: 'biomon')
```
SPA-level tab selection. Subscribed by `Charsheet`. Migrates old values (`rp` → `dossier`, `armor` → `equipment`).

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

### `$encumbrance` (armor.ts)
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

## Dependency Graph (compact)
```
$health ──┬──▸ stat penalties (REF, INT, CL, TECH, MA)
          ├──▸ $bodyType.save
          ├──▸ $woundLevel
          └──▸ $character

$stats ────▸ all 9 computed stat stores ──▸ $bodyType

$ownedArmor ──▸ $encumbrance ──▸ $REF, $character

$damageHistory (standalone, no dependents)

$notes (standalone, no dependents)

$spaTab ────▸ Charsheet (tab selection)

$selectedSkill ◂──▸ $addingSkill (mutually exclusive via selectSkill/startAddingSkill)

$skills ──┬──▸ $allSkills ──┬──▸ $awareness (+ $INT)
          │                 ├──▸ $skillsByStat
          │                 ├──▸ $skillTotal
          │                 ├──▸ $combatSkills
          │                 └──▸ $mySkills ──▸ $mySkillsCount
          └──▸ $customSkills
```
