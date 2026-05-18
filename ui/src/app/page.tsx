import { HomeScreen } from "../features/dashboard/components/home-screen";
import { getDashboardOverview } from "../features/dashboard/services/get-dashboard-overview";

export default async function HomePage() {
  const dashboard = await getDashboardOverview();

  return <HomeScreen dashboard={dashboard} />;
}
