import type { DashboardOverviewResponse } from "../types";
import { MobileHomeScreen } from "./home-screen.mobile";
import { DesktopHomeScreen } from "./home-screen.desktop";

export function HomeScreen(props: Readonly<{ dashboard: DashboardOverviewResponse }>) {
  return (
    <>
      <div className="block xl:hidden">
        <MobileHomeScreen {...props} />
      </div>
      <div className="hidden xl:block">
        <DesktopHomeScreen {...props} />
      </div>
    </>
  );
}
