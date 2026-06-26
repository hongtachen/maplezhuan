import dynamic from "next/dynamic";
import { ShieldCheck } from "lucide-react";

const MapWithNoSSR = dynamic(
  () => import("@/components/ui/GlobalMapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#f3fbf7] animate-pulse flex items-center justify-center text-[#2f9e6d] font-medium">
        加载地图中...
      </div>
    ),
  },
);

/* Cities coverage section */
export default function Cities() {
  return (
    <section
      id="cities"
      className="border-t border-[rgba(31,41,51,0.05)] relative z-0"
      style={{ background: "rgba(227,241,234,0.4)" }}
    >
      <div className="max-w-[996px] mx-auto px-6 py-20 text-center">
        <h2 className="text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-[#1f2933] tracking-[0.4px] mb-3">
          支持区域
        </h2>
        <p className="text-[#5a6b73] text-base mb-8">
          在地图上寻找附近的优质好物或转租。
        </p>

        {/* Interactive Leaflet Map Container */}
        <div className="relative w-full max-w-[800px] aspect-[4/3] sm:aspect-[16/9] mx-auto mt-12 bg-white rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(47,158,109,0.1)] border border-[rgba(47,158,109,0.1)] z-10 flex flex-col">
          <MapWithNoSSR className="h-full flex-1" />
        </div>

        {/* Privacy Note below map for better mobile UI/UX */}
        <div className="max-w-[800px] mx-auto mt-4 sm:mt-5 flex items-start sm:items-center justify-center gap-2 text-left sm:text-center px-4">
          <ShieldCheck className="w-[18px] h-[18px] text-[#2f9e6d] shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-sm text-[#5a6b73] leading-relaxed">
            <strong className="font-semibold text-[#1f2933]">隐私保护：</strong>
            商品位置仅供参考，
            <br className="md:hidden" /> 双方达成交易后，才会显示具体取货地址。
          </span>
        </div>
      </div>
    </section>
  );
}
