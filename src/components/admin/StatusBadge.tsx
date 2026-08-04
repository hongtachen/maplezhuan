export default function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const styles = {
    neutral: "bg-[#f7f9fc] text-[#5a6b73] border-[rgba(31,41,51,0.08)]",
    success: "bg-[#f3fbf7] text-[#2f9e6d] border-[#2f9e6d]/20",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-600 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
  }[tone];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${styles}`}
    >
      {label}
    </span>
  );
}
