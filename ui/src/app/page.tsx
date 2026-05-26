import { BackendRequiredState } from "../components/states/backend-required-state";
import { HomeScreen } from "../features/dashboard/components/home-screen";
import { getDashboardOverview } from "../features/dashboard/services/get-dashboard-overview";
import { getHomeShowcase } from "../features/dashboard/services/get-home-showcase";

export default async function HomePage(props: { searchParams: Promise<{ range?: string }> }) {
  const searchParams = await props.searchParams;
  const range = (searchParams?.range as any) || "30d";

  try {
    const [dashboard, showcase] = await Promise.all([getDashboardOverview(range), getHomeShowcase()]);
    return <HomeScreen dashboard={dashboard} showcase={showcase} />;
  } catch {
    return (
      <BackendRequiredState
        title="Inicio"
        subtitle="Panel general"
        activeTab="inicio"
        message="No hay datos cargados porque el backend esta apagado o no responde."
      />
    );
  }
}
