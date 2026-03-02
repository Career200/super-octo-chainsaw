# Charsheet Data Flow

```
                        STORES                                    COMPONENTS
                        ══════                                    ══════════

                   ┌─────────────┐
                   │   $health   │─────────────────────┬──▸ WoundIndicator (header chip)
                   │  (persist)  │                     │    WoundTracker ◂──▸ WoundBox (DefensePanel)
                   └──────┬──────┘                     │    StabilizedControl, HitPopover ◂──▸
                          │ wound penalties            │
                          ▾                            │
┌──────────┐    ┌─────────────────┐                    │
│  $stats  │───▸│  $REF $INT $CL  │                    │
│ (persist)│    │  $TECH $MA      │───────────────────┼──▸ StatsPanel (via StatColumnWrapper)
│          │───▸│  $LK $ATT $EMP  │                    │
│          │───▸│  $BT ──▸ $body  │───────────────────┼──▸ BodyInfo (name/carry/lift), DamageInfo (BTM/Save)
└──────────┘    │         Type    │                    │    StatColumn ◂──▸ (mutates $stats)
                └────────▲────────┘                    │
                         │ EV penalty (REF only)       │
                ┌────────┴────────┐                    │
                │  $encumbrance   │───────────────────┼──▸ EVDisplay
                │   (computed)    │                    │
                └────────▲────────┘                    │
                         │                             │
               ┌─────────┴──────────┐                  │
               │    $ownedArmor     │─────────────────┼──▸ ArmorListPanel, ArmorCard
               │     (persist)      │                  │    BodyPartCard, BottomBarArmor
               │                    │                  │    SkinweaveDisplay, ImplantsDisplay
               └─────────▲──────────┘                  │    HitPopover ◂──▸, RepairPopover
                         │                             │
               ┌─────────┴──────────────┐              │
               │ $customArmorTemplates  │─────────────┼──▸ BottomBarArmor ◂──▸
               │       (persist)        │              │    ArmorListPanel (Custom tab)
               └─────────┬──────────────┘              │
                         │                             │
                         ▾                             │
               ┌────────────────────┐                  │
               │ $customArmorList  │─────────────────┼──▸ ArmorListPanel (Custom tab count)
               │   (computed)       │                  │
                                                       │
               ┌────────────────────┐                  │
               │  $damageHistory    │─────────────────┴──▸ BottomBarHistory (combat bottom bar)
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
               │  equipment-sub-tab,│                       ArmorListPanel,
               │  armor-list-tab,  │                       WeaponListPanel,
               │  weapon-list-tab, │                       StatsSkillsPanel, NotesPanel,
               │  gear-tab,        │                       CombatView (offense-tab)
               │  skills-filter,   │
               │  notes-tab,       │
               │  offense-tab      │
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

                                    StatsStrip ──▸ reads all 9 computed stat stores (incl. BT)
                                    (compact strip in header, chips only)

                                    DefensePanel ──▸ WoundTracker + DamageInfo + BodyPartGrid(combat)
                                    (wound column left, armor list right)

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

               ┌──────────────────────────┐
               │    $ownedWeapons        │──────────────────▸ WeaponListPanel ◂──▸
               │       (persist)          │                    BottomBarWeapon ◂──▸
               │  instances: id →        │
               │  { templateId,          │
               │    currentAmmo,         │
               │    loadedAmmo,          │
               │    smartchipActive }    │
               └──────────┬──────────────┘
                          │
                          │  ┌────────────────────────────┐
                          │  │  $customWeaponTemplates    │──▸ BottomBarWeapon ◂──▸
                          │  │       (persist)             │
                          │  └──────┬──┬─────────────────┘
                          │         │  │
                          ├─────────┘  │
                          ▾            │
               ┌───────────────────┐   │
               │ $allOwnedWeapons │   │──▸ CombatPanel → WeaponCombatCard (ranged only)
               │    (computed)     │   │    (also reads $allSkills + $REF)
               └───────────────────┘   │    WeaponCombatCard reads $ammoByCaliberLookup (reload popover)
                                       │    MeleePanel → MeleeWeaponCard (melee only)
                                       │    (also reads $allSkills + $REF + $BT)
                                       │    reloadWeapon() cross-store: reads $ammoByCaliberLookup, mutates $ownedAmmo
                                       ▾
                          ┌──────────────────┐
                          │$customWeaponList │
                          │   (computed)     │
                          └──────────────────┘

               ┌────────────────────┐
               │ $selectedWeapon   │─────────────────────▸ BottomBarWeapon (detail view)
               │      (atom)       │                       WeaponCard (highlight)
               └────────────────────┘

               ┌────────────────────┐
               │  $addingWeapon    │─────────────────────▸ BottomBarWeapon (add-weapon form)
               │      (atom)       │                       BottomBar (auto-expand)
               └────────────────────┘
                Mutually exclusive with $selectedWeapon
                Cross-highlighting: selectWeapon/startAddingWeapon clear $selectedAmmo/$addingAmmo

               ┌──────────────────────────┐
               │    $ownedAmmo           │──────────────────▸ AmmoListPanel ◂──▸
               │       (persist)          │                    BottomBarAmmo ◂──▸
               │  templateId → quantity   │
               └──────────┬──────────────┘
                          │
                          │  ┌────────────────────────────┐
                          │  │  $customAmmoItems          │──▸ BottomBarAmmo ◂──▸
                          │  │       (persist)             │
                          │  └──────┬──┬─────────────────┘
                          │         │  │
                          ├─────────┘  │
                          ▾            │
               ┌───────────────────┐   │
               │  $allOwnedAmmo   │   │──▸ AmmoListPanel (owned tab)
               │    (computed)     │   │
               └───────┬───────────┘   │
                       │               ▾
                       ▾     ┌──────────────────┐
               ┌────────────────────────────┐   │  $customAmmoList │
               │ $ammoByCaliberLookup      │   │   (computed)     │
               │    (computed)              │   └──────────────────┘
               │ caliber → OwnedAmmoItem[] │
               └────────────────────────────┘
                 Used by reload popover for ammo type switching

               ┌────────────────────┐
               │  $selectedAmmo    │─────────────────────▸ BottomBarAmmo (detail view)
               │      (atom)       │                       AmmoRow (highlight)
               └────────────────────┘

               ┌────────────────────┐
               │   $addingAmmo     │─────────────────────▸ BottomBarAmmo (add-ammo form)
               │      (atom)       │                       BottomBar (auto-expand)
               └────────────────────┘
                Mutually exclusive with $selectedAmmo
                Cross-highlighting: selectAmmo/startAddingAmmo clear $selectedWeapon/$addingWeapon

               ┌────────────────────┐
               │  $selectedArmor  │─────────────────────▸ BottomBarArmor (detail view)
               │      (atom)       │                       ArmorCard (highlight)
               └────────────────────┘                      BodyPartCard (layer active state)

               ┌────────────────────┐
               │   $addingArmor   │─────────────────────▸ BottomBarArmor (add-armor form)
               │      (atom)       │                       BottomBar (auto-expand)
               └────────────────────┘
                Mutually exclusive with $selectedArmor

               ┌────────────────────┐
               │ $highlightedPart │─────────────────────▸ BodyPartCard (body part highlight)
               │      (atom)       │                       ArmorListPanel (card highlight)
               └────────────────────┘
```

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$customArmorTemplates`, `$damageHistory`, `$notes`, `$skills`, `$gear`, `$customGearItems`, `$ownedWeapons`, `$customWeaponTemplates`) own the data, persist to localStorage
- **Tab stores** via `tabStore()` factory — 8 keys (`spa-tab`, `equipment-sub-tab`, `armor-list-tab`, `weapon-list-tab`, `gear-tab`, `skills-filter`, `notes-tab`, `offense-tab`) each persist to localStorage, cached by key so all subscribers share one atom
- **Sparse persistence** (used by `$skills` and `$gear`): only stores what differs from catalog defaults. Catalog skills at level 0 are not persisted; gear stores only id → quantity. Full objects come from static catalogs at read time. Custom skills are stored as full objects in `$skills`; custom gear definitions live in a separate `$customGearItems` store (persists independently of quantity).
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$encumbrance`, `$character`, `$allSkills`, `$awareness`, `$skillsByStat`, `$combatSkills`, `$mySkills`, `$mySkillsCount`, `$customSkills`, `$ownedGear`, `$ownedGearCount`, `$customArmorList`, `$allOwnedWeapons`, `$customWeaponList`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$encumbrance` (from armor) affects REF; `$INT` + `$allSkills` → `$awareness`
- **Mutations**: components call action functions exported from store modules, never set computed stores directly
- **UI atoms**: `$selectedSkill`/`$addingSkill`, `$selectedGear`/`$addingGear`, `$selectedArmor`/`$addingArmor`, and `$selectedWeapon`/`$addingWeapon` are each mutually exclusive pairs — setting one clears the other via helper functions. `$highlightedPart` is an independent atom for body part highlighting on the inventory grid.
- **Weapons** use instance-based persistence (like armor, unlike gear's quantity-based). Each weapon has its own ammo state. Template resolution via `resolveWeaponTemplate()` checks `WEAPON_CATALOG` + `$customWeaponTemplates`. Combat panel will read `$allOwnedWeapons` + `$allSkills` + stat stores for skill breakdowns (render-time, no new computed store needed).
- `◂──▸` = component both reads and mutates that store
