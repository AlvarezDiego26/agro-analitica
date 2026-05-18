import { MobileProfileScreen } from "./profile-screen.mobile";
import { DesktopProfileScreen } from "./profile-screen.desktop";

export function ProfileScreen() {
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
