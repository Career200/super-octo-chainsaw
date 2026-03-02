const MANEUVERS = [
  ["Block/Parry", "Absorb damage with your weapon"],
  ["Dodge", "\u22122 to attacker\u2019s hit roll"],
  ["Disarm", "Knock or remove weapon"],
  ["Sweep/Trip", "Opponent \u22122 next attack; you +2 next attack"],
  ["Grapple", "Block enemy movement. Prerequisite for Throw/Choke/Hold"],
  ["Escape", "Break free of hold"],
  ["Throw", "Req Grapple. 1D6+DM, stun at \u22122"],
  ["Hold", "Req Grapple. Immobilized until Escape"],
  ["Choke", "Req Hold/Grapple prev. 1D6/turn"],
] as const;

export const ManeuverTable = () => (
  <div class="melee-maneuvers">
    {MANEUVERS.map(([name, desc]) => (
      <div key={name} class="melee-maneuver-row">
        <span class="melee-maneuver-name">{name}</span>
        <span class="melee-maneuver-desc">{desc}</span>
      </div>
    ))}
  </div>
);
