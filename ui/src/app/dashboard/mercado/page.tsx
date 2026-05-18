import { MarketplaceScreen } from "../../../features/marketplace/components/marketplace-screen";
import { getMarketOverview } from "../../../features/marketplace/services/get-market-overview";

export default async function MarketPage() {
  const market = await getMarketOverview();

  return <MarketplaceScreen market={market} />;
}
