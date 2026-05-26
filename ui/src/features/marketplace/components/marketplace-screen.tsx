import type { MarketBuyersShowcaseResponse } from "../../showcase/types";
import type { MarketOverview } from "../types";
import { DesktopMarketplaceScreen } from "./marketplace-screen.desktop";
import { MobileMarketplaceScreen } from "./marketplace-screen.mobile";

type MarketplaceScreenProps = Readonly<{
  market: MarketOverview;
  buyersShowcase: MarketBuyersShowcaseResponse;
  preSelectedProduct?: string;
}>;

export function MarketplaceScreen(props: MarketplaceScreenProps) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopMarketplaceScreen {...props} preSelectedProduct={props.preSelectedProduct} />
      </div>
      <div className="md:hidden">
        <MobileMarketplaceScreen market={props.market} />
      </div>
    </>
  );
}
