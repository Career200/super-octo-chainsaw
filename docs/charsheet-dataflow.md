# Charsheet Data Flow

```
                        STORES                                    COMPONENTS
                        ══════                                    ══════════

                   ┌─────────────┐
                   │   $health   │─────────────────────┬──▸ WoundTracker ◂──▸ WoundBox
                   │  (persist)  │                     │    StabilizedControl, HitPopover ◂──▸
                   └──────┬──────┘                     │
                          │ wound penalties            │
                          ▾                            │
┌──────────┐    ┌─────────────────┐                    │
│  $stats  │───▸│  $REF $INT $CL  │                    │
│ (persist)│    │  $TECH $MA      │───────────────────┼──▸ StatsPanel (via StatColumnWrapper)
│          │───▸│  $LK $ATT $EMP  │                    │
│          │───▸│  $BT ──▸ $body  │───────────────────┼──▸ BodyInfo, HitPopover (reads BTM)
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
               │     (persist)      │                  │    BodyPartCard
               │                    │                  │    SkinweaveDisplay, ImplantsDisplay
               └────────────────────┘                  │    HitPopover ◂──▸, RepairPopover
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
               │  tabStore()       │─────────────────────▸ TabStrip (self-persisting)
               │  factory (persist) │                       Charsheet, BottomBar,
               │  keys: spa-tab,   │                       EquipmentView, GearPanel,
               │  equipment-sub-tab,│                       StatsSkillsPanel, NotesPanel
               │  gear-tab,        │
               │  skills-filter,   │
               │  notes-tab        │
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

               ┌────────────────────┐
               │      $gear        │─────────────────────▸ GearPanel ◂──▸ (mutates $gear)
               │     (persist)      │                       (Catalog + Custom + Owned tabs)
               │                    │                       Quantities: id → number
               └──┬──┬─────────────┘
                  │  │
                  │  │  ┌──────────────────────┐
                  │  │  │  $customGearItems    │─────────▸ BottomBarEquipment ◂──▸
                  │  │  │     (persist)         │           (custom gear definitions)
                  │  │  └──┬──┬────────────────┘
                  │  │     │  │
                  │  ├─────┘  │
                  │  ▾        │
                  │ ┌──────────────┐
                  │ │ $customGear  │─────────────────────▸ GearPanel (Custom tab)
                  │ │  (computed)  │
                  │ └──────────────┘
                  ├────────────┘
                  ▾
               ┌──────────────┐
               │  $ownedGear  │─────────────────────────▸ GearPanel (owned count badge)
               │  (computed)  │                            BottomBarEquipment (selected item)
               └──────┬───────┘
                      │
                      ▾
               ┌──────────────┐
               │$ownedGearCnt │
               │  (computed)  │
               └──────────────┘

               ┌────────────────────┐
               │  $selectedGear    │─────────────────────▸ BottomBarEquipment (detail view)
               │      (atom)       │                       GearCard (highlight)
               └────────────────────┘

               ┌────────────────────┐
               │   $addingGear    │─────────────────────▸ BottomBarEquipment (add-gear form)
               │      (atom)       │                       BottomBar (auto-expand)
               └────────────────────┘
                Mutually exclusive with $selectedGear
```

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$damageHistory`, `$notes`, `$skills`, `$gear`, `$customGearItems`) own the data, persist to localStorage
- **Tab stores** via `tabStore()` factory — 5 keys (`spa-tab`, `equipment-sub-tab`, `gear-tab`, `skills-filter`, `notes-tab`) each persist to localStorage, cached by key so all subscribers share one atom
- **Sparse persistence** (used by `$skills` and `$gear`): only stores what differs from catalog defaults. Catalog skills at level 0 are not persisted; gear stores only id → quantity. Full objects come from static catalogs at read time. Custom skills are stored as full objects in `$skills`; custom gear definitions live in a separate `$customGearItems` store (persists independently of quantity).
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$encumbrance`, `$character`, `$allSkills`, `$awareness`, `$skillsByStat`, `$combatSkills`, `$mySkills`, `$mySkillsCount`, `$customSkills`, `$ownedGear`, `$ownedGearCount`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$encumbrance` (from armor) affects REF; `$INT` + `$allSkills` → `$awareness`
- **Mutations**: components call action functions exported from store modules, never set computed stores directly
- **UI atoms**: `$selectedSkill`/`$addingSkill` and `$selectedGear`/`$addingGear` are each mutually exclusive pairs — setting one clears the other via helper functions
- `◂──▸` = component both reads and mutates that store
