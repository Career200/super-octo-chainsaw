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
```

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$damageHistory`) own the data, persist to localStorage
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$encumbrance`, `$character`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$encumbrance` (from armor) affects REF
- **Mutations**: components call action functions exported from store modules, never set computed stores directly
- `◂──▸` = component both reads and mutates that store
