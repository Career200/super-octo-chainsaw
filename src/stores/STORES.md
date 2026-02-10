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

### `$spaTab` (ui.ts)
```
'biomon' | 'armor' (default: 'biomon')
```
SPA-level tab selection. Subscribed by `Charsheet`.

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

## Dependency Graph (compact)
```
$health ──┬──▸ stat penalties (REF, INT, CL, TECH, MA)
          ├──▸ $bodyType.save
          ├──▸ $woundLevel
          └──▸ $character

$stats ────▸ all 9 computed stat stores ──▸ $bodyType

$ownedArmor ──▸ $encumbrance ──▸ $REF, $character

$damageHistory (standalone, no dependents)

$spaTab ────▸ Charsheet (tab selection)
```
