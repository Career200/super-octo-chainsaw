import { createPopover } from "../ui/popover";

/*
For healing section later:
--- WOUND LEVELS EXPLAINED ----
Light Wound: The patient is fully ambulatory; he can go about his business with a
minor amount of pain.
Serious Wound: The patient is ambulatory, but will need his dressings changed
once a day, and will be at -2 REF for all actions.
Critical Wound: The patient must spend at least half of his day in bed in order to
regain any lost points of damage. Other activities must be limited at simple tasks, at
a -4 REF to all actions. Dressings must be changed twice a day, and nursing care of
some sort must be available.
Mortal Wound: The patient is bedridden. At Mortal Wounds 3 and above, he is
probably comatose (50%) most of the time, and wired into all kinds of machinery
for life support. He requires constant care during the entire process, although he will
not have to make Death Saves (he's been stabilized).

STUN/SHOCK Save Penalties by Wound Level - not in this popup, show current in a separate place next to BTM.
Serious -1
Critical -2
Mortal 0 -3
Mortal 1 -4
Mortal 2 -5
Mortal 3 -6
Mortal 4 -7
Mortal 5 -8
Mortal 6 -9

here:
At a SERIOUS wound level, the character will be at -2 to his REF stat for all actions.
He's hurting, bleeding, and definitely hampered.
• At a CRITICAL wound level, the character's REF, INT and CL stats are automatically
reduced by half (round up). The character is holding his guts in with one hand and doing
his damndest to stay in the battle.
If MORTALLY wounded, the character's REF, INT and CL stats are reduced to 1/3rd
normal (divide by 3, rounding up). Most characters are already out of the action by now,
and are quietly going about the business of expiring. Messily.

short version here, remember to add in bodyparts (with the implants (uhh, implants will need sdp explanation too)) later
Limb Loss: If a character takes more than eight points of damage to a limb area in
any one attack, the area is severed or crushed beyond recognition. The character must
make an immediate Death Save at Mortal 0. A head wound of this type will kill automatically.
Head Hits: A head hit always doubles damage.

remember for death saves info popup
To make the Save, roll a 1D10 value lower than your character's Body Type,
subtracting the level of Mortality from your base chance to save. Each turn, you must
make another death save to see if the character makes it through another turn.
On a successful roll, you make it; on a failed roll, you will die at the end of the turn in
which the roll was made.

----- stabilization ----- to healing section later

Stabilization means the patient is no longer losing blood and that his major damage has
been contained through use of drugs, battlefield surgery, and/or wound dressing.
A stabilized character will no longer be required to make Death saves each turn.
Anyone (except the patient himself) can attempt to stabilize a mortally wounded
character; it just works better if the physician has had some medical training. A lot better.

A successful stabilization is made by rolling a total of your TECH stat, any Medical Skill
and one D10 for a result equal to or higher than the total number of damage points
the patient has taken. For example, Savage has taken 20 points of damage, placing him
in a Mortal 1 Wound State. To stabilize him will require a roll of 20 or greater. Once
stabilized, the character is no longer in danger of dying unless another wound is
taken. At that point, the whole messy business begins again...
The chances of a successful stabilization roll can be increased by the following
modifiers, added to your die roll.
Advantage Add to die roll
Full Hospital & Surgery +5
Trauma Team Ambulance +3
Cryo Tank +3

--- DEATH STATE ---- - maybe not on char sheet?? Something to think about
once you're DEAD 10, you're dead. Because twenty-first century medicine is so good at
reviving the clinically dead, Trauma Team Inc. (the world's largest paramedical service,
with offices worldwide), has established ten levels of death, each succeeding level a
measure of how difficult it will be to revive the patient. This measuring system is called
Death State. For every minute (six turns) that you are clinically dead, your death state
increases by two levels. Example: I am killed at 9:00. Three minutes pass before the
Trauma Team AV-4 arrives. I am now at Death State 6.
A roll must be made to determine if the patient can be revived. This roll, on 1D10, must
be higher than the current Death State number, or the patient is a candidate for the
Body Bank. On a successful roll, the patient is stabilized at his last Wound State and
the process of healing can begin.

--- MORE INFO FOR LATER AND OTHER PARTS --- for healing section later
Okay, so you're not on a slab in Savage Doc's place...
In order to recover from damage, characters must make some type of medical skill
check. Otherwise, the patient continues to take damage (from infection and system
shock) at the rate of 2 points per day. If the patient is at a Mortal Wound State, he must
make a daily Death Save as well as taking this damage. Without medical aid, you're
going to run out of luck pretty soon. This is probably why humans invented medicine
in the first place.
To make a successful medical skill check, you must roll a value (using TECH, your
medical Skill and 1D10) greater than the total number of points of damage the
patient has taken. Medical skill checks are made with two skills, First Aid or Medical Tech.

First Aid
First Aid involves cleaning and dressing the wounds, administering medication, setting
broken limbs and putting on splints. When a character makes a successful First Aid skill
check, the patient will recover at the rate of 0.5 points per day. Example: A Light wound
would be healed in 8 days. A Critical wound would heal in 24 days, a Mortal 3 wound in
56 days. Only one check need be made. You may (within reason and at Referee's
discretion), perform first aid on yourself. On an unsuccessful roll, the patient regains
no points. New attempts may be made once per day until a successful roll is made.

Medical Tech
Medical Tech skill assumes that the character has studied medicine in a professional
setting. This gives him the ability to perform surgery, prescribe drugs, and know
the proper treatment of injuries. He can replace damaged organs with vatgrown
pieces, graft on new limbs, or install cyberlimbs. You cannot perform Medical Tech
skills on yourself.
A character with Medical Tech skills makes a check as if using the First Aid skill, however,
with Medical Tech, the patient will recover at the rate of 1 point per day. For example,
a light wound would be healed in 4 days. A Mortal 3 wound would heal in 28 days.
Using Medical Tech skills supersedes the use of First Aid skills; a patient on which
both have been successfully performed regains points at the rate of 1 per day, not 1.5!
As with First Aid, the patient regains no points until a successful roll has been made.
However, second attempts may be made once per day until a successful roll is made.

p.s. handle speedheal and nanotech in medtech subsystem (not healing, specifically medtech, role-dependant) later
*/

export function setupBodyHelp() {
  const btn = document.getElementById("body-help");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const { popover } = createPopover(btn, {
      className: "popover-help",
    });

    popover.innerHTML = `
      <h3>Body Type</h3>
      <section>
        <h4>BT (Body Type)</h4>
        <p>Determines strength, endurance, damage capacity, carry/lift limits, shock recovery, and melee damage bonus.</p>
      </section>
      <section>
        <h4>Carry / Lift</h4>
        <p>Carry up to <strong>10×BT</strong> kg. Dead lift up to <strong>40×BT</strong> kg.</p>
      </section>
      <section>
        <h4>BTM (Body Type Modifier)</h4>
        <p>Subtracted from incoming damage after armor. Reflects toughness. Cannot reduce damage below 1.</p>
        <p>
          <strong>Very Weak (BT 1-2)</strong> 0 •
          <strong>Weak (BT 3-4)</strong> -1 •
          <strong>Average (BT 5-6)</strong> -2 •
          <strong>Strong (BT 7-8)</strong> -3 •
          <strong>Very Strong (BT 9-10)</strong> -4 •
          <strong>Superhuman (BT 11+)</strong> -5
        </p>
      </section>
      <section>
        <h4>Save (Stun/Shock)</h4>
        <p>Whenever you receive damage or stun damage, you experience pain and shock. Roll <strong>1d10 ≤ BT - wound penalty</strong> to stay conscious
          and focused. Failed = out of combat until recovered.</p>
        <p>Wound penalties: Light 0, Serious -1, Critical -2, Mortal 0-6 → -3 to -9.</p>
      </section>
      <section>
        <h4>Death Saves</h4>
        <p>At <strong>Mortal</strong> wounds, roll <strong>1d10 ≤ BT - mortal level</strong> each turn or die. Only stabilization stops the clock.</p>
      </section>
    `;
  });
}

export function setupWoundHelp() {
  const btn = document.getElementById("wound-help");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const { popover } = createPopover(btn, {
      className: "popover-help",
    });

    popover.innerHTML = `
      <h3>Wound Tracker</h3>
      <section>
        <h4>Wound Levels</h4>
        <p>
          Levels represent severity of injuries. Levels apply increasing penalties —
          always to STUN/SHOCK saves, and to other stats and actions depending on
          the character's state.
        </p>
        <p>
          <strong>Light</strong> — minor injuries, bruises, small cuts.
          No penalties, minor discomfort.
        </p>
        <p>
          <strong>Serious</strong> — moderate injuries, broken bones, deep cuts.
          -2 REF for all actions. Hurting, bleeding, requires medical attention.
        </p>
        <p>
          <strong>Critical</strong> — severe injuries, major impairment.
          REF, INT and CL are halved (round up). Immobile for at least half the day, REF at -2 during
          recovery.
        </p>
        <p>
          <strong>Mortal</strong> — high chance of death without immediate medical
          attention. Make <strong>DEATH SAVES</strong> each turn until stabilized.
          REF, INT and CL reduced to 1/3 (round up). Bedridden, likely comatose,
          or on life support. Requires constant care, REF at -4 during recovery.
        </p>
      </section>
      <section>
        <h4>Physical vs Stun</h4>
        <p><strong>Physical</strong> — real wounds (bullets, blades, fire).</p>
        <p><strong>Stun</strong> — shock, pain, exhaustion (tasers, stun grenades, concussion).</p>
        <p>Taking physical damage <strong>always applies stun</strong>. Stun damage determines wound penalties for saves.</p>
      </section>
      <section>
        <h4>Stable vs Unstable</h4>
        <p>
          <strong>Unstable</strong> — active combat or uncontrolled injury. Harsh penalties:
          REF at -2 (Serious), REF/INT/CL halved (Critical), or reduced to 1/3 (Mortal).
          Must make <strong>DEATH SAVES</strong> each turn at Mortal wounds.
        </p>
        <p>
          <strong>Stable</strong> — bleeding stopped, wounds dressed, or recovering.
          Only REF penalties apply (-2 Serious, -4 Critical, scaling at Mortal).
          No death saves required.
        </p>
        <p>
          Crossing into <strong>Mortal</strong> automatically destabilizes.
          Stabilization requires medical attention or successful stabilization roll.
        </p>
      </section>
    `;
  });
}
