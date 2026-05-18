import { MobileLoginScreen } from "./login-screen.mobile";
import { DesktopLoginScreen } from "./login-screen.desktop";

export function LoginScreen() {
  return (
    <>
      <div className="block lg:hidden">
        <MobileLoginScreen />
      </div>
      <div className="hidden lg:block">
        <DesktopLoginScreen />
      </div>
    </>
  );
}
