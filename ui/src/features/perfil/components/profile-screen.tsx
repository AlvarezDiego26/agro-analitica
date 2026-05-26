"use client";

import { AuthRequiredState } from "../../../components/states/auth-required-state";
import { useAuth } from "../../../providers/auth-provider";
import { MobileProfileScreen } from "./profile-screen.mobile";
import { DesktopProfileScreen } from "./profile-screen.desktop";

export function ProfileScreen() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Mi Perfil"
        subtitle="Configuracion y preferencias"
        activeTab="perfil"
        message="Tu perfil se activa cuando creas una cuenta. Desde ahi podras gestionar tu informacion, alertas y configuracion personal."
      />
    );
  }

  return (
    <>
      <div className="block xl:hidden">
        <MobileProfileScreen />
      </div>
      <div className="hidden xl:block">
        <DesktopProfileScreen />
      </div>
    </>
  );
}
