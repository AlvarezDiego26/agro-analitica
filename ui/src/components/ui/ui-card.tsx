"use client";

import type { ReactNode } from "react";

type UiCardProps = Readonly<{
  children: ReactNode;
  tone?: "default" | "alert" | "success";
  className?: string;
  onClick?: () => void;
}>;

export function UiCard({ children, tone = "default", className = "", onClick }: UiCardProps) {
  let toneClasses = "";
  
  switch (tone) {
    case "alert":
      toneClasses = "bg-red-50 border-red-200";
      break;
    case "success":
      toneClasses = "bg-[#0C5C4D] border-transparent text-white";
      break;
    default:
      toneClasses = "bg-white border-gray-200 shadow-sm";
      break;
  }

  return (
    <article 
      className={`rounded-3xl p-4 border ${toneClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </article>
  );
}
