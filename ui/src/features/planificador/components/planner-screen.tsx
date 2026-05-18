import type { PlannerAnalysis } from "../types";
import { MobilePlannerScreen } from "./planner-screen.mobile";
import { DesktopPlannerScreen } from "./planner-screen.desktop";

export function PlannerScreen(props: Readonly<{ analysis: PlannerAnalysis }>) {
  return (
    <>
      <div className="block xl:hidden">
        <MobilePlannerScreen {...props} />
      </div>
      <div className="hidden xl:block">
        <DesktopPlannerScreen {...props} />
      </div>
    </>
  );
}
