import { WoundTracker } from "./WoundTracker";
import { BodyInfo } from "./BodyInfo";
import { StatsPanel } from "./StatsPanel";
import { HitLocationTable } from "./HitLocationTable";

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
