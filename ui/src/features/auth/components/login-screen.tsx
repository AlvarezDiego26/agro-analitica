import { MobileLoginScreen } from "./login-screen.mobile";
import { DesktopLoginScreen } from "./login-screen.desktop";

type LoginScreenProps = {
  nextHref?: string;
  reason?: string;
};

export function LoginScreen({ nextHref, reason }: Readonly<LoginScreenProps>) {
  return (
    <>
      <div className="block lg:hidden">
        <MobileLoginScreen nextHref={nextHref} reason={reason} />
      </div>
      <div className="hidden lg:block">
        <DesktopLoginScreen nextHref={nextHref} reason={reason} />
      </div>
    </>
  );
}
