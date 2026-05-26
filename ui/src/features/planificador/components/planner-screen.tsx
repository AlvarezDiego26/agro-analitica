import { DesktopPlannerScreen } from "./planner-screen.desktop";
import { MobilePlannerScreen } from "./planner-screen.mobile";

export function PlannerScreen() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopPlannerScreen />
      </div>
      <div className="md:hidden">
        <MobilePlannerScreen />
      </div>
    </>
  );
}
