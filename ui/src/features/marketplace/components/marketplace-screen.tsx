import type { MarketOverview } from "../types";
import { MobileMarketplaceScreen } from "./marketplace-screen.mobile";
import { DesktopMarketplaceScreen } from "./marketplace-screen.desktop";

export function MarketplaceScreen(props: Readonly<{ market: MarketOverview }>) {
  return (
    <>
      <div className="block xl:hidden">
        <MobileMarketplaceScreen {...props} />
      </div>
      <div className="hidden xl:block">
        <DesktopMarketplaceScreen {...props} />
      </div>
    </>
  );
}
