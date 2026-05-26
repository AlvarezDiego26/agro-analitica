export function MetricBlock({ label, value, tone }: Readonly<{ label: string; value: string; tone: "danger" | "neutral" | "success" | "warning" }>) {
  const colorClass =
    tone === "danger" ? "text-[#D32F2F]" :
    tone === "success" ? "text-emerald-700" :
    tone === "warning" ? "text-amber-600" :
    "text-gray-900";
  return <div><p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">{label}</p><strong className={`text-[20px] font-black tracking-tight ${colorClass}`}>{value}</strong></div>;
}

export function LegendLine({ label, className }: Readonly<{ label: string; className: string }>) {
  return <div className="flex items-center gap-1.5"><span className={`w-4 border-b-[2px] ${className}`}></span><span className="text-[11px] font-medium text-gray-500">{label}</span></div>;
}
