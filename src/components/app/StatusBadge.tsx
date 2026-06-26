interface StatusBadgeProps {
  status: "available" | "reserved" | "sold";
}

const config = {
  available: {
    label: "在售",
    className: "bg-[#d0fae5] border border-[#a4f4cf] text-[#007a55]",
  },
  reserved: {
    label: "已预订",
    className: "bg-[#fef9c3] border border-[#fde047] text-[#854d0e]",
  },
  sold: {
    label: "已售",
    className:
      "bg-[rgba(31,41,51,0.08)] border border-[rgba(31,41,51,0.12)] text-[#5a6b73]",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-4 ${className}`}
    >
      {label}
    </span>
  );
}
