"use client";

import { useState } from "react";
import { ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import AppMockup from "@/components/ui/AppMockup";
import Badge from "@/components/ui/Badge";
import { Sprout } from "lucide-react";

interface HeroProps {
  onOpenFounder: () => void;
  onOpenBuyer: () => void;
}

/* Trust bullet items */
const trustBullets = ["信息一眼知晓", "真人交易评价", "本地中文社区"];

/* Hero — two-column on desktop, stacked on mobile */
export default function Hero({ onOpenFounder, onOpenBuyer }: HeroProps) {
  const [sellerStatus, setSellerStatus] = useState<"在售" | "已预定" | "已售">(
    "已预定",
  );

  return (
    <section id="hero" className="relative overflow-hidden bg-[#f3fbf7]">
      {/* Background blobs */}
      <div className="absolute w-96 h-96 rounded-full bg-[rgba(31,122,85,0.3)] blur-[64px] -top-32 right-32 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-[rgba(217,74,56,0.2)] blur-[64px] -bottom-20 -left-32 pointer-events-none" />

      <div className="relative max-w-[996px] mx-auto px-6 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          {/* Left — text content */}
          <div className="flex flex-col gap-6 md:max-w-[450px] shrink-0 items-start">
            {/* Badge */}
            <Badge variant="green" icon={<Sprout className="w-4 h-4" />}>
              {" "}
              加拿大华人本地闲置和房子转租市场
            </Badge>

            {/* H1 — multi-size matching Figma */}
            <h1 className="flex flex-col tracking-[0.35px]">
              <span className="text-fluid-h2-mobile md:text-fluid-h2 font-semibold text-[#1f2933] leading-[60px]">
                不用加好友，不用刷群翻帖
              </span>
              <span className="text-fluid-h1-mobile md:text-fluid-h1 font-semibold md:mt-3 text-[#1f2933] leading-[60px]">
                闲置一眼看清
              </span>
              <span className="text-fluid-h2-mobile md:text-fluid-h2 mt-3 font-semibold text-[#2f9e6d] leading-[60px]">
                价格、状态、位置直接展示
              </span>
            </h1>

            {/* Body copy */}
            <div className="text-[#5a6b73] text-base leading-6 flex flex-col gap-0">
              <p className="text-fluid-p-mobile md:text-fluid-p">
                买家看得明白，卖家回得轻松
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              {/* Primary: Gradient, pill shape, default shadow, animated arrow, shine effect on hover */}
              <button
                id="hero-founder-cta"
                onClick={onOpenFounder}
                className="group relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-[#2f9e6d] to-[#228056] text-white text-base font-medium px-8 py-3.5 rounded-full shadow-[0_8px_24px_rgba(47,158,109,0.25)]
                           transition-all duration-300 ease-out
                           hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(47,158,109,0.4)] hover:from-[#35b07a] hover:to-[#25855a]
                           active:translate-y-0 active:shadow-[0_4px_12px_rgba(47,158,109,0.2)] active:scale-[0.98]
                           cursor-pointer"
              >
                {/* Shine effect overlay */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                <span className="relative z-10">成为创始卖家</span>
                <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>

              {/* Secondary: Glass/Outline hybrid, pill shape, slight glow on hover */}
              <button
                id="hero-buyer-cta"
                onClick={onOpenBuyer}
                className="group flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm border-2 border-[#2f9e6d]/30 text-[#2f9e6d] text-base font-medium px-8 py-3.5 rounded-full shadow-[0_4px_12px_rgba(31,41,51,0.03)]
                           transition-all duration-300 ease-out
                           hover:bg-white hover:border-[#2f9e6d]/60 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(47,158,109,0.15)]
                           active:translate-y-0 active:shadow-none active:scale-[0.98]
                           cursor-pointer"
              >
                <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span>来逛逛</span>
              </button>
            </div>

            {/* Trust bullets */}
            <div className="flex items-center gap-6">
              {trustBullets.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7 text-[#2f9e6d] shrink-0" />
                  <span className="text-[#5a6b73] text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — App mockup */}
          <div className="relative flex justify-center md:justify-end md:pt-4">
            <AppMockup />

            {/* Lifestyle Floating Bubble (Buyer perspective) */}
            <div
              className="absolute -left-2 md:-left-8 top-[15%] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl rounded-tl-[4px] shadow-[0_12px_32px_rgba(31,41,51,0.12)] border border-[#e3f1ea] flex flex-col gap-1 z-20
                            transition-transform duration-500 hover:-translate-y-2 delay-100"
            >
              <span className="text-[#5a6b73] text-xs font-medium line-through decoration-[#d94a38]/60 decoration-2">
                &ldquo;还在吗？&rdquo;
              </span>
              <span className="text-[#1f2933] text-sm font-semibold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d94a38] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d94a38]"></span>
                </span>
                商品已出售
              </span>
            </div>

            {/* Seller Management Floating Bubble */}
            <div
              className="absolute -right-2 md:-right-12 bottom-[35%] bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-[0_12px_32px_rgba(31,41,51,0.12)] border border-[#e3f1ea] flex flex-col gap-1.5 z-20
                            transition-transform duration-500 hover:-translate-y-2 delay-300"
            >
              <div className="flex items-center gap-1.5 pl-1.5">
                <div className="relative flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2f9e6d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2f9e6d]"></span>
                </div>
                <span className="text-[#5a6b73] text-sm font-semibold uppercase tracking-wider">
                  一键更改商品状态
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#f3f3f5] p-1 rounded-xl">
                {(["在售", "已预定", "已售"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSellerStatus(status)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
                      ${
                        sellerStatus === status
                          ? "bg-white text-[#2f9e6d] font-bold shadow-sm border border-[rgba(31,41,51,0.02)] scale-105"
                          : "text-[#5a6b73] hover:text-[#1f2933] hover:bg-[#e8e8eb]"
                      }
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
