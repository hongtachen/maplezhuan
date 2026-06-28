import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-24 md:py-32 text-center px-6 ${className}`}
    >
      {icon ? (
        <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-[rgba(31,41,51,0.06)] flex items-center justify-center mb-4">
          {icon}
        </div>
      ) : emoji ? (
        <div className="text-5xl mb-4">{emoji}</div>
      ) : null}
      <h3 className="text-[#1f2933] font-bold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-[#5a6b73] text-sm max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
