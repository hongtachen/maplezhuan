interface CTAProps {
  onOpenFounder: () => void;
  onOpenBuyer: () => void;
}

/* CTA banner — green background with blur orbs and two action buttons */
export default function CTA({ onOpenFounder, onOpenBuyer }: CTAProps) {
  return (
    <section className="bg-[rgba(227,241,234,0.4)] px-6 pt-24 pb-24">
      <div className="max-w-[996px] mx-auto">
        {/* Green banner */}
        <div className="relative bg-[#2f9e6d] rounded-3xl overflow-hidden py-16 px-8">
          {/* Decorative blur orbs */}
          <div className="absolute w-72 h-72 rounded-full bg-[rgba(217,74,56,0.4)] blur-[64px] -top-20 right-0 pointer-events-none" />
          <div className="absolute w-72 h-72 rounded-full bg-[rgba(31,122,85,0.4)] blur-[64px] -bottom-20 -left-20 pointer-events-none" />

          {/* Content */}
          <div className="relative text-center flex flex-col items-center gap-4">
            <h2 className="text-fluid-h2 font-semibold text-white tracking-[0.37px]">
              成为创始卖家
            </h2>
            <p className="text-white/90 text-base max-w-md leading-6">
              成为 MapleZhuan 第一批卖家，
              <br /> 提前获得更多曝光和平台支持。
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* Light button: White pill, green text, heavy shadow, green shine on hover */}
              <button
                id="cta-founder-btn"
                onClick={onOpenFounder}
                className="group relative overflow-hidden bg-white text-[#2f9e6d] text-base font-semibold px-8 py-3.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.15)]
                           transition-all duration-300 ease-out
                           hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]
                           active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-[0.98]
                           cursor-pointer"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#2f9e6d]/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10">申请成为创始卖家</span>
              </button>

              {/* Ghost-white: Pill shape, transparent white, white border, strong white glow */}
              <button
                id="cta-buyer-btn"
                onClick={onOpenBuyer}
                className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border-2 border-white/60 text-white text-base font-medium px-8 py-3.5 rounded-full
                           transition-all duration-300 ease-out
                           hover:bg-white/20 hover:border-white hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)]
                           active:translate-y-0 active:shadow-none active:scale-[0.98]
                           cursor-pointer"
              >
                <span>买家感兴趣</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
