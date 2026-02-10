# Charsheet Data Flow

```
                        STORES                                    COMPONENTS
                        ══════                                    ══════════

                   ┌─────────────┐
                   │   $health   │─────────────────────┬──▸ WoundTracker ◂──▸ WoundBox
                   │  (persist)  │                     │    StabilizedControl
                   └──────┬──────┘                     │
                          │ wound penalties            │
                          ▾                            │
┌──────────┐    ┌─────────────────┐                    │
│  $stats  │───▸│  $REF $INT $CL  │                    │
│ (persist)│    │  $TECH $MA      │───────────────────┼──▸ StatsPanel (via StatColumnWrapper)
│          │───▸│  $LK $ATT $EMP  │                    │
│          │───▸│  $BT ──▸ $body  │───────────────────┼──▸ BodyInfo
└──────────┘    │         Type    │                    │    StatColumn ◂──▸ (mutates $stats)
                └────────▲────────┘                    │
                         │ EV penalty (REF only)       │
                ┌────────┴────────┐                    │
                │  $encumbrance   │───────────────────┼──▸ EVDisplay
                │   (computed)    │                    │
                └────────▲────────┘                    │
                         │                             │
               ┌─────────┴──────────┐                  │
               │    $ownedArmor     │─────────────────┼──▸ InventoryPanel, ArmorItem
               │     (persist)      │                  │    BodyPartCard, FaceCard
               │                    │                  │    SkinweaveDisplay, ImplantsDisplay
               └────────────────────┘                  │    HitPopover, RepairPopover
                                                       │
               ┌────────────────────┐                  │
               │  $damageHistory    │─────────────────┴──▸ DamageHistoryPanel
               │     (persist)      │                       HitPopover, RepairPopover
               └────────────────────┘                       (record entries)

               ┌────────────────────┐
               │    $character      │  Aggregator: re-exports $health + $encumbrance
               │    (computed)      │  Not directly subscribed by components
               └────────────────────┘

               ┌────────────────────┐
               │     $spaTab       │─────────────────────▸ Charsheet ◂──▸ TabStrip
               │     (persist)      │                       (SPA-level tab switching)
               └────────────────────┘

               ┌────────────────────┐
               │     $skills       │─────────────────────▸ AwarenessLine ◂──▸ (mutates $skills)
               │     (persist)      │
               └────────┬───────────┘
                        │
                        ▾
               ┌────────────────────┐
               │    $awareness     │─────────────────────▸ AwarenessLine
               │    (computed)      │
               └────────────────────┘
                Depends on: $INT, $skills

                                    StatsStrip ──▸ reads all 9 computed stat stores
                                    (compact strip in header, expands to StatsPanel)
```

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$damageHistory`, `$spaTab`, `$skills`) own the data, persist to localStorage
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$encumbrance`, `$character`, `$awareness`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$encumbrance` (from armor) affects REF; `$INT` + `$skills` → `$awareness`
- **Mutations**: components call action functions exported from store modules, never set computed stores directly
- `◂──▸` = component both reads and mutates that store
