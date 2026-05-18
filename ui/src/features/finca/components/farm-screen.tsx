import { MobileFarmScreen } from "./farm-screen.mobile";
import { DesktopFarmScreen } from "./farm-screen.desktop";

export function FarmScreen() {
  return (
    <>
      <div className="block xl:hidden">
        <MobileFarmScreen />
      </div>
      <div className="hidden xl:block">
        <DesktopFarmScreen />
      </div>
    </>
  );
}
