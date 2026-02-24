export const StatsSkillsHelpContent = () => {
  return (
    <>
      <h3>Stats & Skills</h3>
      <section>
        <h4>Stats</h4>
        <p>
          Your base abilities, rated <strong>1-10</strong>. Stats determine
          skill check bonuses, derived values (BTM, Carry/Lift), and are
          referenced by wound penalties.
        </p>
        <p>
          <strong>Inherent</strong> is your natural value.{" "}
          <strong>Cyber</strong> adds bonuses from cyberware.{" "}
          <strong>Current</strong> reflects active penalties (wounds,
          drugs, etc.).
        </p>
      </section>
      <section>
        <h4>Skills</h4>
        <p>
          Skills represent training, rated <strong>0-10</strong>. On checks,
          roll <strong>1d10 + Stat + Skill</strong> vs a difficulty value. Some
          skills (marked combat) apply to attack rolls.
        </p>
        <p>
          Use the <strong>Catalog</strong> tab for the full list grouped by
          stat. <strong>My</strong> shows only skills you've leveled up.{" "}
          <strong>Custom</strong> lets you add homebrew skills.
        </p>
      </section>
    </>
  );
};
