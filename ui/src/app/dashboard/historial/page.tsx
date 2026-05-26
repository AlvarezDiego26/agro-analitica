import { getDashboardOverview } from "../../../features/dashboard/services/get-dashboard-overview";
import { MarketHistory } from "../../../features/dashboard/components/market-history";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistorialPage(props: { searchParams: Promise<{ producto?: string }> }) {
  const searchParams = await props.searchParams;
  const productoName = searchParams?.producto;

  if (!productoName) {
    redirect("/");
  }

  // Obtenemos 1 año de datos para que el cliente tenga toda la historia para filtrar
  const dashboard = await getDashboardOverview("1a");
  
  const productData = dashboard.marketCards.find(
    c => c.productoNombre.toLowerCase() === productoName.toLowerCase()
  );

  if (!productData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[500px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
        <p className="text-gray-500 mb-6">No se encontraron datos históricos para "{productoName}".</p>
        <Link href="/" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8">
      <MarketHistory productData={productData} />
    </div>
  );
}
