import { PlannerScreen } from "../../../features/planificador/components/planner-screen";
import { getPlannerAnalysis } from "../../../features/planificador/services/get-planner-analysis";

export default async function PlannerPage() {
  const analysis = await getPlannerAnalysis();

  return <PlannerScreen analysis={analysis} />;
}
