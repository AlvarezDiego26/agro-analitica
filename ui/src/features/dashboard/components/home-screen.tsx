"use client";

import { useEffect, useState } from "react";
import type { DashboardOverviewResponse } from "../types";
import type { HomeShowcaseResponse } from "../../showcase/types";
import { useAuth } from "../../../providers/auth-provider";
import { DesktopHomeScreen } from "./home-screen.desktop";
import { MobileHomeScreen } from "./home-screen.mobile";
import { NewUserHome } from "./new-user-home";
import { VisitorHome } from "./visitor-home";
import { getCurrentUserCampaigns } from "../../planificador/services/get-current-user-campaigns";
import { DashboardShell } from "../../../components/shell/dashboard-shell";

export function HomeScreen(props: Readonly<{ dashboard: DashboardOverviewResponse; showcase: HomeShowcaseResponse }>) {
  const { isReady, isAuthenticated, isNewUser } = useAuth();
  const [userCampaigns, setUserCampaigns] = useState<any[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCampaigns = () => {
      if (isAuthenticated) {
        getCurrentUserCampaigns()
          .then(res => {
            if (isMounted) {
              setUserCampaigns(res.campaigns || []);
            }
          })
          .catch(() => {
            if (isMounted) setUserCampaigns([]);
          });
      } else {
        setUserCampaigns([]);
      }
    };

    fetchCampaigns();
    window.addEventListener("campaigns-updated", fetchCampaigns);

    return () => { 
      isMounted = false; 
      window.removeEventListener("campaigns-updated", fetchCampaigns);
    };
  }, [isAuthenticated]);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <VisitorHome dashboard={props.dashboard} showcase={props.showcase} />;
  }

  if (userCampaigns === null) {
    return (
      <DashboardShell
        title="Inicio"
        subtitle="Cargando panel general..."
        activeTab="inicio"
        bodyClassName="flex items-center justify-center min-h-[60vh]"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          <span className="text-gray-400 text-sm font-medium">Cargando campañas...</span>
        </div>
      </DashboardShell>
    ); // Loading state
  }

  const hasCampaigns = userCampaigns.length > 0;

  if (!hasCampaigns && isNewUser) {
    return <NewUserHome dashboard={props.dashboard} showcase={props.showcase} />;
  }

  return (
    <>
      <div className="hidden md:block">
        <DesktopHomeScreen {...props} initialCampaigns={userCampaigns} />
      </div>
      <div className="md:hidden">
        <MobileHomeScreen dashboard={props.dashboard} showcase={props.showcase} initialCampaigns={userCampaigns} />
      </div>
    </>
  );
}
