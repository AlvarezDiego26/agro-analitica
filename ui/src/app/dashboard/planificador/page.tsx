import { Suspense } from "react";
import { PlannerScreen } from "../../../features/planificador/components/planner-screen";

export default function PlannerPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PlannerScreen />
    </Suspense>
  );
}
