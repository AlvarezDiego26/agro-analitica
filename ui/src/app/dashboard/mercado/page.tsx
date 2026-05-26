import { BackendRequiredState } from "../../../components/states/backend-required-state";
import { MarketplaceScreen } from "../../../features/marketplace/components/marketplace-screen";
import { getMarketBuyersShowcase } from "../../../features/marketplace/services/get-market-buyers-showcase";
import { getMarketOverview } from "../../../features/marketplace/services/get-market-overview";

export default async function MarketPage({ searchParams }: { searchParams: Promise<{ producto?: string }> }) {
  try {
    const params = await searchParams;
    const [market, buyersShowcase] = await Promise.all([getMarketOverview(), getMarketBuyersShowcase()]);
    return <MarketplaceScreen market={market} buyersShowcase={buyersShowcase} preSelectedProduct={params.producto} />;
  } catch {
    return (
      <BackendRequiredState
        title="Mercado"
        subtitle="Demanda e insumos"
        activeTab="mercado"
        message="No hay compradores ni indicadores porque la API no esta disponible."
      />
    );
  }
}
