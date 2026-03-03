import type { StatName } from "@scripts/combat/types";

export type SkillStat = StatName | "special";

export const MANEUVER_NAMES = [
  "strike",
  "kick",
  "block",
  "dodge",
  "throw",
  "hold",
  "escape",
  "choke",
  "sweep",
  "grapple",
] as const;

export type Maneuver = (typeof MANEUVER_NAMES)[number];

export const MANEUVER_LABELS: Record<Maneuver, string> = {
  strike: "Strike",
  kick: "Kick",
  block: "Block",
  dodge: "Dodge",
  throw: "Throw",
  hold: "Hold",
  escape: "Escape",
  choke: "Choke",
  sweep: "Sweep",
  grapple: "Grapple",
};

export interface SkillDefinition {
  stat: SkillStat;
  melee: boolean;
  /** IP multiplier */
  diffMod: number;
  martialArt?: boolean;
  keyAttacks?: Partial<Record<Maneuver, number>>;
  description?: string;
}

export const SKILL_CATALOG: Record<string, SkillDefinition> = {
  // Special abilities (one per role)
  Authority: {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "The force of the law — question suspects, make arrests, command respect.\n2 — you can flash a badge and get compliance from civilians.\n6 — you face down gangers and corporate security.\n9 — high-level mobsters think twice before crossing you.",
  },
  "Charismatic Leadership": {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Sway crowds through force of personality. Controls a number of people equal to level squared × 200.\n2 — you can work a stage.\n6 — you control a crowd of thousands, enough to trash a neighborhood.\n9 — mesmerizing on a national scale; you raise movements and destroy nations.",
  },
  "Combat Sense": {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Constant training and professional awareness. Add its level as a bonus to Initiative and if relevant, to Awareness/Notice.\n2 — you react faster than most civilians.\n6 — you perceive danger before it happens.\n9 — an almost supernatural ability to avoid harm.",
  },
  Credibility: {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "The ability to be believed — by your viewers, your editors, the public.\n2 — local beat reporter, people read your column.\n6 — your exposés make the evening news.\n9 — when you say it, the world believes it.",
  },
  Family: {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Call upon your Nomad tribe for weapons, cash, information, or a small army of relatives.\n2 — you can get a few Pack members to help wreck a hood.\n6 — you make Pack decisions and lead troops.\n9 — you may be the Leader of your Pack.",
  },
  Interface: {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Manipulate Netrunner interface programs — Locate Remote, Run Software, Control, Downlink, Load, Create, Delete.\n2 — you can navigate the Net and run basic programs.\n6 — you crack corporate ICE and run complex operations.\n9 — legendary presence in the Net; sysops fear your handle.",
  },
  "Jury Rig": {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Temporarily repair or alter anything for 1D6 turns per level of skill. Not a permanent fix though.\n2 — you can duct-tape a gun back together.\n6 — you get a wrecked AV flying long enough to land.\n9 — you could jury rig a space shuttle with baling wire.",
  },
  "Medical Tech": {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Perform major surgery and medical repairs. The trauma team skill.\n2 — you can assist in surgery.\n6 — you perform complex operations independently.\n9 — you're the surgeon other surgeons call.",
  },
  Resources: {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Command corporate resources — eddies, equipment, facilities, vehicles and troops.\n2 — you ride a company car.\n6 — you fly a corporate private jet.\n9 — you can send Corporate Security Division to Mideast if you want to.",
  },
  Streetdeal: {
    stat: "special",
    melee: false,
    diffMod: 1,
    description:
      "Deal with the underground information network — find people, things, and secrets. Add its level to Streetwise or other relevant rolls. \n2 — you have general contacts for weapons and minor illegal operations.\n6 — you know the secrets of all but the most powerful crime families.\n9 — Mafia Consigliere level; know of rats sneezing on the Street.",
  },

  // ATT
  "Personal Grooming": {
    stat: "att",
    melee: false,
    diffMod: 1,
    description:
      'Proper grooming, hair styling, and presentation to maximize your physical attractiveness.\n2 — you look basically put together.\n6 — fashion model material.\n9 — you are always "together" — trendsetter level, and you know it.',
  },
  "Wardrobe & Style": {
    stat: "att",
    melee: false,
    diffMod: 1,
    description:
      "Knowing the right clothes, when to wear them, and how to look cool even in a spacesuit.\n2 — you pick good clothes off the rack.\n6 — friends ask you for wardrobe tips; you never buy off the rack.\n9 — your personal style influences major fashion trends.",
  },

  // BT (body)
  Endurance: {
    stat: "bt",
    melee: false,
    diffMod: 1,
    description:
      "Withstand pain and hardship over long periods by conserving strength and energy.\n2 — you can pull an all-nighter.\n6 — you keep going after days without sleep or food.\n9 — you outlast almost anyone, anywhere.",
  },
  "Strength Feat": {
    stat: "bt",
    melee: false,
    diffMod: 1,
    description:
      "Bending bars, ripping phone books, juggling kettlebells and other feats of force and body mastery.\n2 — you crush cans and do one-handed pushups.\n6 — rip phonebooks, snap handcuffs, hold an iron cross on gymnastic rings.\n9 — you lift whole trucks and bend prison bars.",
  },
  Swimming: {
    stat: "bt",
    melee: false,
    diffMod: 1,
    description:
      "The ability to swim. Required to not drown (GM-specific).\n2 — you stay afloat and move through the water somehow.\n6 — strong open-water swimmer.\n9 — competitive or rescue-diver caliber.",
  },

  // CL (cool/will)
  Interrogation: {
    stat: "cl",
    melee: false,
    diffMod: 1,
    description:
      "Drawing information from a subject and forcing secrets into the open.\n2 — you can reliably tell if your boyfriend is lying.\n6 — professional interrogator, equivalent to a skilled detective.\n9 — you make the most powerful people squirm; Mike Wallace level.",
  },
  Intimidate: {
    stat: "cl",
    melee: false,
    diffMod: 1,
    description: `Getting people to do what you want through force of personality or physical coercion.\n2 — you can cow most everyday people.\n6 — you intimidate Stallone and any "tough guy".\n9 — you could stare down Adam Smasher... Well, that's an overstatement, but you feel like you could try.`,
  },
  Oratory: {
    stat: "cl",
    melee: false,
    diffMod: 1,
    description:
      'Public speaking and rhetoric.\n2 — you win high school speech contests.\n6 — you get paid to speak in public.\n9 — you deliver speeches to rival Kennedy\'s "Ich Bin Ein Berliner" or the Gettysburg Address.',
  },
  "Resist Torture/Drugs": {
    stat: "cl",
    melee: false,
    diffMod: 1,
    description:
      "Toughened against interrogation, torture, and mind control drugs. Success raises the difficulty of any interrogation by one level.\n2 — you can hold out longer than average.\n6 — professional-grade resistance; most drugs barely faze you.\n9 — they'll break the equipment before they break you.",
  },
  Streetwise: {
    stat: "cl",
    melee: false,
    diffMod: 1,
    description:
      "Knowledge of the street — who to talk to, where to score, how to survive.\n2 — you know your neighborhood.\n6 — you have contacts across the city.\n9 — fixers come to you.",
  },

  // EMP
  "Human Perception": {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Detecting lies, evasions, moods, and emotional clues from others.\n2 — you can usually tell when you're not getting the whole truth.\n6 — you detect subtle evasions and mood swings.\n9 — you read people like open books; almost nothing gets past you.",
  },
  Interview: {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Eliciting personal information and anecdotes from a subject through skilled questioning.\n2 — people share surface-level info willingly.\n6 — subjects reveal attitudes, philosophies, and personal details.\n9 — they tell you everything, including secrets they've never told anyone.",
  },
  Leadership: {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Leading and controlling people to follow you.\n2 — you manage a small office and earn respect.\n6 — you can lead troops into battle without getting backstabbed.\n9 — you could lead an empire into war and look good doing it.",
  },
  Seduction: {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Forming and maintaining romantic relationships, including your abilities as a lover.\n2 — you can get a date on a good night.\n6 — you rarely get turned down.\n9 — practically irresistible; legends follow you around.",
  },
  Social: {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Navigating social situations — knowing the right fork to use, when not to tell the joke.\n2 — you can get by at a fine restaurant without embarrassment.\n6 — you lunch with the President with aplomb.\n9 — no social situation can faze you; you are Emily Post incarnate.",
  },
  "Persuasion & Fast Talk": {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Talking others into doing what you want, individually or in groups.\n2 — you win most casual arguments.\n6 — smooth talker of professional caliber.\n9 — you could sell ice to a penguin; Hitler-level persuasion.",
  },
  Perform: {
    stat: "emp",
    melee: false,
    diffMod: 1,
    description:
      "Trained acting, singing, or other stage performance.\n2 — you can carry a tune at karaoke.\n6 — professional caliber with contracts and fans.\n9 — star caliber, no composition too complex for you, could be recognized on the street.",
  },

  // INT
  Accounting: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Balancing books, juggling numbers, creating budgets, and day-to-day business operations.\n2 — you can manage a household budget.\n6 — you handle corporate-level finances.\n9 — forensic accountant; you find what others hide.",
  },
  Anthropology: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Knowledge of human cultures, habits, and customs — general background, not just the Street.\n2 — you know the basics of major world cultures.\n6 — academic-level understanding of cultural patterns.\n9 — world-class ethnographer; you understand any culture you encounter.",
  },
  "Awareness/Notice": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "General awareness and ability to notice things.\n2 — you spot the obvious.\n6 — you catch a tail in a crowd.\n9 — TV cop show observancy.",
  },
  Biology: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "General knowledge of animals, plants, and their biological systems.\n2 — you remember high school bio.\n6 — detailed knowledge of genetics and cellular biology.\n9 — you can perform most bio-science research, including gene mapping.",
  },
  Botany: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Knowledge of plants and plant identification.\n2 — you know common garden plants.\n6 — you identify most important pharmaceutical and medicinal plants.\n9 — doctoral-level expertise; you know rare poisons and exotic orchids.",
  },
  Chemistry: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Mixing and identifying various chemical compounds.\n2 — high school chemistry level.\n6 — trained pharmacist or college-level chemist.\n9 — top lab chemist; you synthesize world-shattering compounds.",
  },
  Composition: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Writing songs, articles, stories, or other creative written works.\n2 — you write decent blog posts.\n6 — you produce salable, professional work.\n9 — if you don't have a Pulitzer, you will soon.",
  },
  "Diagnose Illness": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Clinically diagnosing symptoms and medical problems.\n2 — you can spot a cold or a sprain.\n6 — well-trained intern; you recognize uncommon illnesses and treat common ones.\n9 — everybody lies much? You are a skilled diagnostician; other physicians come to you.",
  },
  "Education & General Knowledge": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Basic education — reading, writing, math, and general trivia. Some INT skills can be replaced with this at 1/3 value (GM-specific).\n2 — high school equivalency.\n6 — well-educated; you get asked to play Trivial Pursuit a lot.\n9 — you know a lot about everything, and hopefully have the sense to keep your mouth shut.",
  },
  Expert: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description: `Deep expertise in one specific subject — rare stamps, obscure weapons, a foreign language, etc. Use Custom skills to populate this as "Expert: Field".\n2 — you're a hobbyist with good knowledge.\n6 — you publish books on the subject.\n9 — your books are the major texts; you do the talk-show circuit.`,
  },
  Gamble: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Making bets, figuring odds, and playing games of chance. Not a luck skill.\n2 — you're the local card shark at Saturday night poker.\n6 — you make a living at the tables in Vegas and Monte Carlo.\n9 — you take on James Bond at roulette and break the bank.",
  },
  Geology: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Functional knowledge of rocks, minerals, and geological structures.\n2 — you identify common rocks and minerals.\n6 — college-degree equivalent; you read terrain and geology with ease.\n9 — you could teach geology at university level.",
  },
  "Hide/Evade": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Losing pursuers, covering tracks, and evading people already on your trail. Unlike Stealth, this is reactive — they know you're there and you're shaking them.\n2 — you can duck into an alley and lose a casual follower.\n6 — you ditch cops and private eyes.\n9 — you lose Solos and professional trackers.",
  },
  History: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Knowledge of facts and figures of past events.\n2 — grade school history education.\n6 — college-level grasp; you could teach high school history.\n9 — you've written definitive texts on historical eras.",
  },
  "Know Language": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      'Knowledge of a foreign tongue. Use "Add custom skill" to add specific language.\n2 — you can "get by" with basic phrases.\n6 — fluent, though not mistaken for a native.\n9 — you speak and read like a native.',
  },
  "Library Search": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Using databases, DataTerms, libraries, and other compiled sources to find facts.\n2 — you can use most simple databases.\n6 — you easily access the Library of Congress.\n9 — you can find almost anything in any public database, no matter how obscure.",
  },
  Mathematics: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Understanding calculations and mathematical formulas.\n2 — you can handle basic arithmetic and simple algebra.\n6 — you perform calculus.\n9 — you deduce your own mathematical formulas.",
  },
  Physics: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Calculating physical principles — gas pressures, mechanical energies, structural loads.\n2 — you understand basic mechanics.\n6 — you solve engineering-level physics problems.\n9 — theoretical physicist; you push the boundaries of the field.",
  },
  Programming: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Writing programs and reprogramming computer systems. Does not cover hardware repair.\n2 — you write simple programs in high-level languages.\n6 — professional software engineer; you build operating systems.\n9 — other programmers speak your name with reverence; young hackers try to crack your systems.",
  },
  "Shadow/Track": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Shadowing and following people, primarily in urban or inhabited areas.\n2 — you can tail someone who isn't paying attention.\n6 — you follow trained subjects through crowded streets.\n9 — you could shadow a Solo through their own neighborhood.",
  },
  "Stock Market": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Playing the stock market, routine transactions, and illegal manipulation.\n2 — you invest in junk bonds and lose your shirt.\n6 — your investments pay off 75% of the time.\n9 — major market player; you routinely dabble in international stocks.",
  },
  "System Knowledge": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Knowledge of the Net's geography, lore, history, and important computer systems.\n2 — you can navigate the Net and find local BBSes.\n6 — you know most places in the Net and understand its largest systems.\n9 — you know the Net like the back of your hand, layouts and all.",
  },
  Teaching: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Imparting knowledge to others. You cannot teach a skill higher than your own level.\n2 — you can tutor someone one-on-one.\n6 — college professor level.\n9 — top of your field; students travel far to learn from you.",
  },
  "Wilderness Survival": {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Surviving in the wilds — setting traps, foraging, tracking game, building shelters, making fires.\n2 — you were a Boy Scout once.\n6 — Special Forces Green Beret level.\n9 — Grizzly Adams, Mountain Man of the Wilderness.",
  },
  Zoology: {
    stat: "int",
    melee: false,
    diffMod: 1,
    description:
      "Knowledge of lifeforms, biological processes, and their relation to the environment.\n2 — you know most common animals.\n6 — you know rare, exotic, and endangered species; +1 to Wilderness Survival.\n9 — you are knowledgeable on almost all animals and their habitats.",
  },

  // REF
  Archery: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Using bows, crossbows, and other arrow-based ranged weapons.\n2 — you can hit a target at the range.\n6 — you compete in tournaments.\n9 — you split arrows like Robin Hood.",
  },
  Athletics: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Throwing, climbing, and balancing — general physical coordination.\n2 — you're in decent shape, weekend warrior.\n6 — college-level competitor.\n9 — Olympic or professional caliber.",
  },
  Brawling: {
    stat: "ref",
    melee: true,
    diffMod: 1,
    description:
      "Unarmed fighting — punches, kicks, headbutts, dirty tricks.\n2 — bar fighter.\n6 — you win street fights reliably.\n9 — bare-knuckle legend.",
  },
  Dance: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Professional dance ability.\n2 — you can keep rhythm and not embarrass yourself.\n6 — professional caliber; regular performances and fans.\n9 — star caliber; recognized on the street.",
  },
  "Dodge & Escape": {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Dodging attacks and escaping grapples and holds. Cannot be used against attacks you don't know about. GM-specific(!) - with REF and/or Dodge over 8, can dodge bullets. \n2 — you can duck a clumsy swing.\n6 — you slip holds and armbars.\n9 — almost untouchable in a fight, dodge gunfire in close quarters.",
  },
  Driving: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Piloting ground vehicles — cars, trucks, tanks, hovercraft. Not for aircraft.\n2 — good non-professional driver.\n6 — moderately skilled race driver.\n9 — nationally known veteran of professional racing.",
  },
  Fencing: {
    stat: "ref",
    melee: true,
    diffMod: 1,
    description:
      "Mastery of swords, rapiers, and monoblades.\n2 — you know which end to hold.\n6 — nationally known competitor.\n9 — true swordsman of duelist caliber; D'Artagnan or Musashi level.",
  },
  Handgun: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Accuracy and handling of pistols and revolvers.\n2 — you hit the target at the range, usually.\n6 — quick-draw artist, reliable under pressure.\n9 — you shoot coins out of the air.",
  },
  "Heavy Weapons": {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Grenade launchers, autocannon, mortars, heavy MGs, missiles, and rocket launchers.\n2 — you can fire without hurting yourself.\n6 — equivalent to military Heavy Weapons training.\n9 — you place rounds exactly where you want them, every time.",
  },
  // Martial arts — each style is a separate skill with key attacks and difficulty level
  Aikido: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 3,
    keyAttacks: {
      block: 4,
      dodge: 3,
      throw: 3,
      hold: 3,
      escape: 3,
      choke: 1,
      sweep: 3,
      grapple: 2,
    },
    description:
      "The way of harmony — redirect an attacker's force against them. Defensive art focused on locks, throws, and joint control.\n2 — you can take a fall safely and perform basic wrist locks.\n6 — you blend with incoming attacks and throw opponents effortlessly.\n9 — grandmaster; attackers crumple the moment they touch you.",
  },
  "Animal Kung Fu": {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 3,
    keyAttacks: { strike: 2, kick: 2, block: 2, sweep: 1 },
    description:
      "Traditional Chinese martial arts mimicking animal movements — tiger, crane, snake, mantis, dragon.\n2 — you know the basic forms and stances.\n6 — you flow between animal styles in combat.\n9 — master of the five animals; your strikes are legend.",
  },
  Boxing: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 1,
    keyAttacks: { strike: 3, block: 3, dodge: 1 },
    description:
      "The sweet science — footwork, jabs, hooks, and combinations.\n2 — you keep your hands up and throw a decent jab.\n6 — Golden Gloves competitor; you work the ring.\n9 — heavyweight contender; your punch is a registered weapon.",
  },
  Capoeira: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 3,
    keyAttacks: { strike: 1, kick: 2, block: 2, dodge: 2, sweep: 3 },
    description:
      "Afro-Brazilian dance-fighting — acrobatic kicks, sweeps, and constant fluid motion.\n2 — you play the ginga and throw basic kicks.\n6 — you cartwheel through fights and sweep legs from handstands.\n9 — mestre; your fighting looks like impossible choreography.",
  },
  "Choi Li Fut": {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 3,
    keyAttacks: { strike: 2, kick: 2, block: 2, dodge: 1, throw: 1, sweep: 2 },
    description:
      "Southern Chinese style combining long and short range techniques with powerful circular strikes.\n2 — you know the basic hand and kick forms.\n6 — your circular strikes generate devastating power.\n9 — sifu; you command a school and your students fear sparring day.",
  },
  Judo: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 1,
    keyAttacks: {
      dodge: 1,
      throw: 3,
      hold: 2,
      escape: 2,
      sweep: 2,
      grapple: 2,
    },
    description:
      "The gentle way — throws, pins, and groundwork. Maximum efficiency, minimum effort.\n2 — you can execute a basic hip throw.\n6 — black belt competitor; you throw people twice your size.\n9 — Olympic-level judoka; touching you means hitting the mat.",
  },
  Karate: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 2,
    keyAttacks: { strike: 2, kick: 2, block: 2 },
    description:
      "The way of the empty hand — powerful strikes, blocks, and kata.\n2 — white belt; you know the basic blocks and punches.\n6 — black belt; your strikes break boards and bones.\n9 — grandmaster; your name is known in dojos worldwide.",
  },
  Savate: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 2,
    keyAttacks: { kick: 4, block: 1, dodge: 1 },
    description:
      "French kickboxing — elegant, devastating footwork and precision kicks.\n2 — you throw basic chassé and fouetté kicks.\n6 — your kicks are surgical; you hit what you aim at.\n9 — master of la boxe française; your feet are faster than most hands.",
  },
  "Tae Kwon Do": {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 4,
    keyAttacks: { strike: 3, kick: 3, block: 2, dodge: 1, sweep: 2 },
    description:
      "Korean art of foot and fist — explosive kicks and powerful strikes.\n2 — you can throw a roundhouse without falling over.\n6 — your spinning kicks connect reliably; tournament competitor.\n9 — master; your kicks are almost too fast to see.",
  },
  "Thai Boxing": {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 4,
    keyAttacks: { strike: 3, kick: 3, block: 2, grapple: 1 },
    description:
      "Muay Thai — the art of eight limbs. Punches, kicks, elbows, and knees.\n2 — you throw basic combos in the clinch.\n6 — you fight in the ring; your shins are like iron.\n9 — champion nak muay; your elbows end fights.",
  },
  Wrestling: {
    stat: "ref",
    melee: false,
    martialArt: true,
    diffMod: 1,
    keyAttacks: {
      throw: 3,
      hold: 4,
      escape: 4,
      choke: 2,
      sweep: 2,
      grapple: 4,
    },
    description:
      "Grappling and ground control — takedowns, pins, and submissions.\n2 — you can shoot a basic double-leg.\n6 — collegiate-level wrestler; nobody wants to go to the ground with you.\n9 — world-class; once you grab someone, the fight is over.",
  },
  Melee: {
    stat: "ref",
    melee: true,
    diffMod: 1,
    description:
      "Using knives, axes, clubs, and other hand weapons, including cyberweapons like scratchers, rippers, and battlegloves. \n2 — you can swing a bat.\n6 — knife fighter of street renown.\n9 — bladed combat artist; terrifying up close.",
  },
  Motorcycle: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Operating motorcycles, and other two/three-wheeled vehicles.\n2 — you can ride without falling off.\n6 — you weave through traffic at high speed.\n9 — stunt rider; you do things on a bike that shouldn't be possible.",
  },
  "Operate Heavy Machinery": {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Operating tractors, bulldozers, excavators, and similar equipment.\n2 — you can drive a forklift.\n6 — skilled heavy equipment operator.\n9 — you operate cranes and earthmovers with surgical precision.",
  },
  "Pilot (Gyro)": {
    stat: "ref",
    melee: false,
    diffMod: 3,
    description:
      "Piloting rotorwing aircraft — gyros, copters, and Ospreys.\n2 — you can hover and land in good weather.\n6 — combat-capable rotorwing pilot.\n9 — you fly helicopters like they're extensions of your body.",
  },
  "Pilot (Fixed Wing)": {
    stat: "ref",
    melee: false,
    diffMod: 2,
    description:
      "Piloting fixed wing jets and prop aircraft, Ospreys in straight-ahead mode.\n2 — you can fly a Cessna in clear skies.\n6 — jet-qualified; combat-ready.\n9 — top gun; widely known in the piloting community.",
  },
  "Pilot (Dirigible)": {
    stat: "ref",
    melee: false,
    diffMod: 2,
    description:
      "Piloting lighter-than-air vehicles — dirigibles, blimps, zeps and balloons.\n2 — you can keep it aloft and on course.\n6 — you navigate cargo dirigibles through bad weather.\n9 — master aeronaut; you can thread a blimp through a canyon.",
  },
  "Pilot (Vect. Trust Vehicle)": {
    stat: "ref",
    melee: false,
    diffMod: 3,
    description:
      "Piloting vectored thrust vehicles — hovercars, hover rafts, and AV-4/6/7 vehicles.\n2 — you can take off and set down without crashing.\n6 — you fly AVs in urban combat conditions.\n9 — you push vectored thrust vehicles to their absolute limits.",
  },
  Rifle: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Using rifles and shotguns effectively.\n2 — you can hit a man-sized target at medium range.\n6 — sharpshooter; reliable at long range under stress.\n9 — legendary marksman; confirmed kills at extreme distance.",
  },
  Stealth: {
    stat: "ref",
    melee: false,
    diffMod: 2,
    description:
      "Hiding in shadows, moving silently, evading guards. Unlike Hide/Evade, this is proactive — you avoid detection in the first place.\n2 — you sneak past inattentive people.\n6 — you slip from shadow to shadow without a sound.\n9 — you make ninjas sound like elephants.",
  },
  Submachinegun: {
    stat: "ref",
    melee: false,
    diffMod: 1,
    description:
      "Using submachine guns effectively.\n2 — you can fire in bursts without losing control.\n6 — professional-level accuracy in full auto.\n9 — you place burst fire like a surgeon with a scalpel.",
  },

  // TECH
  "Aero Tech": {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Repairing fixed wing aircraft — Ospreys, jets, and light aircraft.\n2 — you can do basic pre-flight checks.\n6 — engine teardowns and major structural repairs.\n9 — you design and build your own aircraft.",
  },
  "AV Tech": {
    stat: "tech",
    melee: false,
    diffMod: 3,
    description:
      "Repairing ducted fan aerodyne vehicles.\n2 — you can do basic maintenance checks.\n6 — you tear down engines and modify AVs.\n9 — you design your own AVs on common airframes.",
  },
  "Basic Tech": {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Building and repairing simple mechanical and electrical devices — car engines, TVs, appliances.\n2 — you can fix a leaky faucet and change your oil.\n6 — you rebuild engines and repair stereos.\n9 — you build computers from scratch and maintain industrial machinery.",
  },
  "Cryotank Operation": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Cryotank-related lifesaving, repairing, and maintaining life-suspension and body chilling devices.\n2 — you understand the readouts.\n4 — you can chill downa a healthy person. \n6 — you can chill down a wounded person.\n9 — you keep people alive in cryo that others would lose.",
  },
  "Cyberdeck Design": {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Designing cyberdecks for Netrunners.\n2 — you understand deck architecture.\n4 — you can modify an existing cyberdeck. \n6 — you design decks equal to most existing models.\n9 — your decks are substantially superior to anything on the market.",
  },
  CyberTech: {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Repairing and maintaining cyberwear.\n2 — you keep your cyberwear tuned and replace power batteries.\n6 — you strip down most cyberwear and make simple modifications.\n9 — you design custom cyberwear to order.",
  },
  Demolitions: {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Using explosives — choosing the right type, setting timers and detonators, calculating charges.\n2 — you can set a simple charge without blowing yourself up.\n6 — professional demolitions expert.\n9 — you can bring down a building exactly where you want it.",
  },
  Disguise: {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Disguising yourself to resemble someone else, real or fictitious. Combines makeup and acting.\n2 — you can change your look enough to avoid casual recognition.\n6 — you fool acquaintances and pass security checks.\n9 — you could walk past your own mother as a different person.",
  },
  Electronics: {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Maintaining, repairing, and modifying electronic instruments — computers, personal electronics, security systems, cameras.\n2 — you can solder a broken wire.\n6 — you repair and modify most electronic systems.\n9 — you build custom electronics from components.",
  },
  "Electronic Security": {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Installing or countering electronic eyes, locks, bugs, tracers, security cameras, and pressure plates.\n2 — you can spot obvious cameras and basic alarms.\n6 — you overcome most corporate office locks and traps.\n9 — you enter high-security areas with impunity.",
  },
  "First Aid": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Emergency medical treatment in the field.\n2 — you can apply a bandage.\n6 — you stabilize gunshot wounds.\n9 — battlefield surgeon, no table needed.",
  },
  Forgery: {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Copying and creating false documents and IDs. Can be used to detect forgeries as well.\n2 — you can fake a simple note.\n6 — your fake IDs pass most scanners.\n9 — your forgeries fool experts, and you spot fakes non-chalantly.",
  },
  "Gyro Tech": {
    stat: "tech",
    melee: false,
    diffMod: 3,
    description:
      "Repairing and maintaining rotorwing aircraft — helicopters and gyrocopters.\n2 — you handle routine checks.\n6 — you do full engine overhauls.\n9 — you build and modify rotorwing aircraft from scratch.",
  },
  "Paint or Draw": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Producing professional-caliber drawings and paintings.\n2 — you can sketch recognizably.\n6 — your art is recognizable, pleasant, and salable.\n9 — nationally known; exhibits in galleries, other artists study your style.",
  },
  "Photo & Film": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Producing professional-caliber photographs or motion pictures.\n2 — you make decent home movies.\n6 — Playboy cover or rock video quality.\n9 — nationally known photographer or cinematographer.",
  },
  Pharmaceuticals: {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Designing and manufacturing drugs and medicines. Requires Chemistry +4.\n2 — you can identify most common drugs.\n6 — you make hallucinogens or antibiotics.\n9 — you build designer drugs tailored to individual body chemistries.",
  },
  "Pick Lock": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Picking locks and breaking into sealed containers and rooms.\n2 — you can jimmy simple household locks.\n6 — you crack most safes.\n9 — master cracksman, known to all the major players.",
  },
  "Pick Pocket": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Picking pockets without being noticed, as well as shoplifting small items.\n2 — you can lift a wallet from a distracted mark.\n6 — you work crowds professionally.\n9 — your fingers are legendary; no pocket is safe.",
  },
  "Play Instrument": {
    stat: "tech",
    melee: false,
    diffMod: 1,
    description:
      "Playing a musical instrument. Taken separately for each instrument.\n2 — you can play simple songs.\n6 — professional gigs and session work.\n9 — widely acclaimed; recording contracts, features with Kerry Eurodyne.",
  },
  Weaponsmith: {
    stat: "tech",
    melee: false,
    diffMod: 2,
    description:
      "Repairing and maintaining weapons of all types.\n2 — you can do field stripping and basic repairs.\n6 — you repair all weapon types and make simple modifications.\n9 — you design and build custom weapons to order.",
  },
};

/** Display order for melee attack skill chips on weapon cards */
export const MELEE_SKILLS_ORDER: string[] = ["Melee", "Brawling", "Fencing"];

/** Name constants for computed stores */
export const AWARENESS_SKILL = "Awareness/Notice";
export const COMBAT_SENSE_SKILL = "Combat Sense";
