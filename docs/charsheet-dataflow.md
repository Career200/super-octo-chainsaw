# Charsheet Data Flow

## State layers

Stores are organized into layers by when they load and whether they depend on catalog data. This is what makes lazy-loading work — always-visible components (StatsStrip, BodyInfo, WoundIndicator) never import catalogs.

```
Layer 1 — Persistent inputs (synchronous, localStorage)
─────────────────────────────────────────────────────────
  $health, $stats, $homerules, $notes, $damageHistory
  tabStore() keys (spa-tab, equipment-sub-tab, etc.)

  User-entered data. No catalog dependency. Available immediately.


Layer 2 — Cached domain effects (persistent atoms, written by listeners)
────────────────────────────────────────────────────────────────────────
  $armorEffects   ← listener on $ownedArmor (in armor/state.ts)
  $cyberEffects   ← listener on $ownedCyber (in cyber.ts)

  Catalog-free summaries of domain state. Read from localStorage on
  first load (instant). Kept in sync by listeners that fire when their
  lazy module loads and on every subsequent change.

  This is the bridge: lazy modules write these, eager stores read them.


Layer 3 — Always-visible computed stores (catalog-free)
───────────────────────────────────────────────────────
  $REF..$BT, $bodyType         ← L1 ($stats, $health) + L2 ($armorEffects)
  $hcData                       ← L2 ($cyberEffects) + L3 ($EMP)

  Derived from L1 + L2 only. Rendered by synchronous components
  (StatsStrip, BodyInfo) and lazy-but-always-needed ones
  (WoundIndicator, AwarenessLine).


Layer 4 — Panel-specific stores (catalog-dependent, lazy)
─────────────────────────────────────────────────────────
  $allSkills, $awareness, $skillsByStat, $meleeSkills, ...
  $ownedArmor → getArmorPiece(), getBodyPartLayers(), ...
  $allOwnedWeapons, $ownedGear, $allOwnedAmmo, ...
  $hydratedCyber, $installedByCategory, ...

  Hydrate catalog data at read time. Only imported by view components
  (CombatView, DossierView, EquipmentView) which are lazy-loaded.
  Prefetched via requestIdleCallback after first paint.
```

### Loading sequence

1. **Synchronous** — `StatsStrip`, `BodyInfo` import L1+L2 stores directly. Render with cached localStorage values. No catalogs touched.
2. **Suspense** — `AwarenessLine`, `WoundIndicator` are `lazy()` but load early. AwarenessLine pulls in `SKILL_CATALOG` (L4) but only after first paint.
3. **requestIdleCallback** — prefetches all three views + sub-views. This triggers L4 module loads, which register listeners that sync L2 atoms.
4. **View render** — user navigates to a tab, view component mounts, L4 stores hydrate from catalog + persistent state.

## Key patterns

- **Persistent stores** (`$health`, `$stats`, `$ownedArmor`, `$customArmorTemplates`, `$damageHistory`, `$homerules`, `$notes`, `$skills`, `$gear`, `$customGearItems`, `$ownedWeapons`, `$customWeaponTemplates`, `$unarmedSkill`, `$ownedCyber`, `$cyberEffects`, `$armorEffects`) own the data, persist to localStorage
- **Tab stores** via `tabStore()` factory — keys persist to localStorage, cached so all subscribers share one atom
- **Sparse persistence** (`$skills`, `$gear`): only stores what differs from catalog defaults. Full objects hydrated from static catalogs at read time. Custom items stored as full objects (no catalog entry).
- **Computed stores** (`$REF`..`$BT`, `$bodyType`, `$allSkills`, `$awareness`, `$skillsByStat`, `$meleeSkills`, `$myMartialArts`, `$mySkills`, `$mySkillsCount`, `$customSkills`, `$ownedGear`, `$ownedGearCount`, `$customArmorList`, `$allOwnedWeapons`, `$customWeaponList`, `$hydratedCyber`, `$installedByCategory`, `$hcData`) derive from persistent stores
- **Cross-store deps**: `$health` wounds affect stat penalties; `$armorEffects.ev` affects REF; `$INT` + `$allSkills` → `$awareness`; `$cyberEffects` + `$EMP` → `$hcData`
- **Cyber** uses instance-based persistence (like armor). `$cyberEffects` is listener-driven (catalog-free, safe for eager import). HC is rolled on install, zeroed on uninstall.
- **Mutations**: components call action functions, never set computed stores directly
- **UI atoms**: `$selected*`/`$adding*` are mutually exclusive pairs — setting one clears the other. Cross-highlighting between weapon/ammo pairs.
- **Weapons** use instance-based persistence (like armor, unlike gear's quantity-based). Each weapon has its own ammo state. Template resolution via `resolveWeaponTemplate()`.
- `◂──▸` = component both reads and mutates that store

## Detailed store chart

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
                │ $armorEffects  │───────────────────┼──▸ EVDisplay
                │ (persist, sync) │                    │
                └────────▲────────┘                    │
                         │ listener                    │
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
               │    $homerules     │─────────────────────────▸ applyHit() (degradation mode)
               │     (persist)      │                          RepairPopover (hide part selector)
               │ locationalDeg,    │                          ArmorHelpContent ×2 (conditional text)
               │ scaledDeg         │  Mutated by vanilla JS dialog (localStorage + StorageEvent)
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
               │  offense-tab,     │
               │  cyber-list-tab  │
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
               │(comp)│ │ │$meleeSkills │  (melee: true, ordered)
               └──────┘ │ │  (computed)  │
                         │ └──────────────┘
                         │ ┌──────────────┐
                         │ │$myMartialArts│  (martialArt: true, level > 0)
                         │ │  (computed)  │──────────────────────▸ MeleePanel (unarmed card,
                         │ └──────────────┘                        dodge bonuses, ManeuverTable)
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

               ┌──────────────────────────┐
               │ $resolvedUnarmedSkill   │───────────▸ MeleePanel (unarmed card)
               │       (computed)         │
               └──────────────────────────┘
                Depends on: $unarmedSkill (persist), $allSkills

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
                                       │    (also reads $meleeSkills + $REF + $BT)
                                       │    MeleeWeaponCard ◂──▸ setMeleeSkill (persists skill per instance)
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
               │   $ownedCyber   │─────────────────────▸ CyberSubView ◂──▸
               │     (persist)    │                       BottomBarCyber ◂──▸
               │  OwnedItem[]    │                       (takeCyber, installCyber, installOwned,
               └──┬──┬───────────┘                        uninstallCyber, discardCyber, slotOption,
                  │  │                                     unslotOption, setItemHc)
                  │  │
                  │  ▾
                  │ ┌──────────────┐
                  │ │$hydratedCyber│──▸ $installedByCategory
                  │ │  (computed)  │
                  │ └──────────────┘
                  │
                  ▾
               ┌──────────────────┐
               │  $cyberEffects   │──▸ $hcData (+ $EMP)
               │     (persist)    │    { humanity, hcTotal, empBase, empCurrent }
               │  listener-driven │
               └──────────────────┘

               ┌────────────────────┐
               │  $selectedCyber   │─────────────────────▸ BottomBarCyber (detail view)
               │      (atom)       │                       CyberSubView (highlight)
               └────────────────────┘

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
