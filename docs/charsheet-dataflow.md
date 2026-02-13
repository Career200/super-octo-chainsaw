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
               │  $damageHistory    │─────────────────┴──▸ BottomBarHistory (biomon bottom bar)
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
               │     (persist)      │                       (sparse: only level>0 defaults
               │                    │                        + all custom skills)
               └──┬──┬──┬──┬───┬──┘
                  │  │  │  │   │
                  │  │  │  │   ▾
                  │  │  │  │ ┌──────────────┐
                  │  │  │  │ │ $customSkills│─────────────▸ SkillsPanel (Custom tab)
                  │  │  │  │ │  (computed)  │
                  │  │  │  │ └──────────────┘
                  │  │  │  │
                  ▾  │  │  │
               ┌─────────────────┐
               │   $allSkills    │  Hydrates catalog with stored overrides + custom
               │   (computed)    │
               └──┬──┬──┬──┬────┘
                  │  │  │  │
                  ▾  │  │  │
               ┌──────┐ │  │
               │$skil-│ │  │
               │lsBy- │ │  ▾
               │Stat  │ │ ┌──────────────┐
               │(comp)│ │ │$combatSkills │  (combat: true, ordered)
               └──────┘ │ │  (computed)  │
                         │ └──────────────┘
                         │ ┌──────────────┐
                         │ │ $skillTotal  │─────────────────────▸ StatsSkillsPanel (header)
                         │ │  (computed)  │
                         │ └──────────────┘
                         │ ┌──────────────┐
                         ├▸│  $mySkills   │─────────────────────▸ SkillsPanel (My tab)
                         │ │  (computed)  │
                         │ └──────┬───────┘
                         │        │
                         │        ▾
                         │ ┌──────────────┐
                         │ │$mySkillsCount│─────────────────────▸ StatsSkillsPanel (tab badge)
                         │ │  (computed)  │
                         │ └──────────────┘
                         ▾
               ┌────────────────────┐
               │    $awareness     │─────────────────────▸ AwarenessLine
               │    (computed)      │
               └────────────────────┘
                Depends on: $INT, $allSkills

                                    StatsStrip ──▸ reads all 9 computed stat stores
                                    (compact strip in header, chips only)

               ┌────────────────────┐
               │   $selectedSkill  │─────────────────────▸ BottomBarSkills (dossier bottom bar)
               │      (atom)       │                       SkillRow (highlight)
               └────────────────────┘

               ┌────────────────────┐
               │   $addingSkill   │─────────────────────▸ BottomBarSkills (add-skill form)
               │      (atom)       │                       BottomBar (auto-expand)
               └────────────────────┘
                Mutually exclusive with $selectedSkill

                                    StatsSkillsPanel ──▸ combined panel in Dossier tab
                                    (StatsPanel + SkillsList side by side)
                                    Three tabs: Default / Custom / My
```

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$damageHistory`, `$notes`, `$spaTab`, `$skills`) own the data, persist to localStorage
- **`$skills` sparse persistence**: only stores catalog skills with level > 0 and all custom skills. Catalog skills at level 0 are not persisted — they come from `SKILL_CATALOG` via `$allSkills`
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$encumbrance`, `$character`, `$allSkills`, `$awareness`, `$skillsByStat`, `$combatSkills`, `$mySkills`, `$mySkillsCount`, `$customSkills`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$encumbrance` (from armor) affects REF; `$INT` + `$allSkills` → `$awareness`
- **Mutations**: components call action functions exported from store modules, never set computed stores directly
- **UI atoms**: `$selectedSkill` and `$addingSkill` are mutually exclusive — setting one clears the other via `selectSkill()` / `startAddingSkill()`
- `◂──▸` = component both reads and mutates that store
