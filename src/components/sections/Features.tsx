import { Tag, Star, Share2 } from "lucide-react";
import { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string | ReactNode;
}

const features: Feature[] = [
  {
    icon: <Tag className="w-5 h-5 text-white" />,
    title: "已售 / 预订状态",
    description: (
      <>
        卖家一键标记 已出 / 已预订 / 在售。
        <br />
        买家一眼看清，不用问
        <span className="relative inline-block text-[#1f2933] font-medium mx-0.5">
          「还在吗？」
          {/* Animated red strike line that expands on card hover */}
          <span className="absolute top-1/2 left-0 h-[2px] bg-[#d94a38]/80 w-0 transition-all duration-500 ease-out group-hover:w-full"></span>
        </span>
        。
      </>
    ),
  },
  {
    icon: <Star className="w-5 h-5 text-white" />,
    title: "卖家评价系统",
    description:
      "完整的成交记录、\n星级评价和真实买家反馈，\n 买家一眼浏览卖家信任度。",
  },
  {
    icon: <Share2 className="w-5 h-5 text-white" />,
    title: "APP 互相联动",
    description: "一键分享到其他APP，\n 点击即可查看商品或房源。",
  },
];

/* Icon circle with gradient + glow — scales up on card hover via group */
function FeatureIcon({ icon }: { icon: ReactNode }) {
  return (
    <div className="relative w-14 h-14 shrink-0">
      {/* Blurred glow disc — intensifies on hover */}
      <div
        className="absolute inset-0 rounded-full blur-[12px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(47,158,109,0.3) 0%, rgba(31,122,85,0.3) 100%)",
        }}
      />
      {/* Gradient icon circle — scales on hover */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
        style={{
          backgroundImage: "linear-gradient(135deg, #2f9e6d 0%, #1f7a55 100%)",
        }}
      >
        {icon}
      </div>
    </div>
  );
}

/* Features section — 3-col grid on desktop, 1-col on mobile */
export default function Features() {
  return (
    <section id="features" className="bg-[#f3fbf7] py-20">
      <div className="max-w-[996px] mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1rem,20vw,2.5rem)] md:text-[clamp(1rem,4vw,4.5rem)] font-semibold text-[#1f2933] tracking-[0.4px] mb-3">
            为什么选择
            <span style={{ color: "#64b16a" }}>枫转</span>？
          </h2>
          <p className="text-[#5a6b73] text-fluid-p-mobile md:text-fluid-p max-w-xl mx-auto leading-7">
            买/卖闲置、房屋转租，
            <br /> 不需要再加一堆陌生人和群聊。
            <br /> 在枫转，商品和房源信息直接看。 <br /> 买家<b>少问一句</b>
            ，卖家<b>少回一遍</b>。
          </p>
        </div>

        {/* 3×2 grid on desktop, 1 col on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white border border-[rgba(31,41,51,0.05)] rounded-[14px] p-6 flex flex-col gap-6
                         cursor-default transition-all duration-300
                         hover:-translate-y-1.5
                         hover:shadow-[0_12px_32px_rgba(47,158,109,0.12)]
                         hover:border-[rgba(47,158,109,0.25)]
                         hover:bg-[rgba(47,158,109,0.02)]"
            >
              <FeatureIcon icon={f.icon} />
              <div className="flex flex-col gap-2">
                <h3 className="text-fluid-h4 text-[#1f2933] font-medium transition-colors duration-300 group-hover:text-[#2f9e6d]">
                  {f.title}
                </h3>
                <p className="text-[clamp(1rem,3vw,1.4rem)] md:text-[clamp(0.9rem,0.9vw,1.5rem)] text-[#5a6b73] leading-5 whitespace-pre-line">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
