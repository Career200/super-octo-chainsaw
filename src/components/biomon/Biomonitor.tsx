import { WoundTracker } from "./WoundTracker";
import { BodyInfo } from "./BodyInfo";
import { StatsPanel } from "./StatsPanel";

const HitLocationTable = () => {
  return (
    <div class="hit-location-table">
      <span class="hit-location">
        Head <span class="hit-roll">1</span>
      </span>
      <span class="hit-location">
        Torso <span class="hit-roll">2-4</span>
      </span>
      <span class="hit-location">
        RA <span class="hit-roll">5</span>
      </span>
      <span class="hit-location">
        LA <span class="hit-roll">6</span>
      </span>
      <span class="hit-location">
        RL <span class="hit-roll">7-8</span>
      </span>
      <span class="hit-location">
        LL <span class="hit-roll">9-10</span>
      </span>
    </div>
  );
};

export const Biomonitor = () => {
  return (
    <>
      <div class="fixed-bar">
        <WoundTracker />
        <div class="secondary-bar flex-between">
          <BodyInfo />
          <HitLocationTable />
        </div>
      </div>
      <div class="container">
        <StatsPanel />
      </div>
    </>
  );
};
