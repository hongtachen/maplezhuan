type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-10 h-10 border-4",
};

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizes[size]} border-[#2f9e6d] border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="加载中"
    />
  );
}

export function PageLoading({ label = "加载中..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size="md" />
      <p className="text-[14px] text-[#5a6b73] font-medium">{label}</p>
    </div>
  );
}
