import { ReactNode } from "react";

interface BadgeProps {
  variant?: "green" | "red" | "white" | "city";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/* Reusable badge with variant styling */
export default function Badge({
  variant = "green",
  icon,
  children,
  className = "",
}: BadgeProps) {
  const styles: Record<string, string> = {
    green: "bg-[rgba(31,122,85,0.15)] text-[#1f7a55]",
    red: "bg-[rgba(217,74,56,0.15)] text-[#d94a38]",
    white: "bg-white border border-[rgba(31,41,51,0.1)] text-[#1f2933]",
    city: "bg-white border border-[rgba(31,41,51,0.1)] text-[#1f2933]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium overflow-hidden ${styles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
