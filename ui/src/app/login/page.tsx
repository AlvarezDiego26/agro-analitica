import { LoginScreen } from "../../features/auth/components/login-screen";

export const metadata = {
  title: "Inicia sesion | AgroAnalitica",
  description: "Ingresa a tu cuenta de productor en AgroAnalitica"
};

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  return <LoginScreen nextHref={resolvedSearchParams.next} reason={resolvedSearchParams.reason} />;
}
