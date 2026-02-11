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
               │      $notes       │─────────────────────▸ NotesPanel ◂──▸ (mutates $notes)
               │     (persist)      │                       (freeform notes + contacts)
               └────────────────────┘

               ┌────────────────────┐
               │     $spaTab       │─────────────────────▸ Charsheet ◂──▸ TabStrip
               │     (persist)      │                       (SPA-level tab switching)
               └────────────────────┘

               ┌────────────────────┐
               │     $skills       │─────────────────────▸ AwarenessLine ◂──▸ (mutates $skills)
               │     (persist)      │
               └──┬─────┬──────┬───┘
                  │     │      │
                  ▾     │      ▾
               ┌──────┐ │  ┌──────────────┐
               │$skil-│ │  │$combatSkills │  (combat: true, ordered)
               │lsBy- │ │  │  (computed)  │
               │Stat  │ │  └──────────────┘
               │(comp)│ │  ┌──────────────┐
               └──────┘ │  │ $skillTotal  │─────────────────────▸ SkillsPanel (header)
                        │  │  (computed)  │
                        │  └──────────────┘
               └──────┘ ▾
               ┌────────────────────┐
               │    $awareness     │─────────────────────▸ AwarenessLine
               │    (computed)      │
               └────────────────────┘
                Depends on: $INT, $skills

                                    StatsStrip ──▸ reads all 9 computed stat stores
                                    (compact strip in header, chips only)

                                    StatsSkillsPanel ──▸ combined panel in RP tab
                                    (StatsPanel + SkillsList side by side)
```

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$damageHistory`, `$notes`, `$spaTab`, `$skills`) own the data, persist to localStorage
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$encumbrance`, `$character`, `$awareness`, `$skillsByStat`, `$combatSkills`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$encumbrance` (from armor) affects REF; `$INT` + `$skills` → `$awareness`
- **Mutations**: components call action functions exported from store modules, never set computed stores directly
- `◂──▸` = component both reads and mutates that store
