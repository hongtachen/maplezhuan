"use client";

import { Camera, Users, Handshake, ArrowRight } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface Step {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <Camera className="w-12 h-12 text-[#2f9e6d]" />,
    title: "拍照发布",
    description: "上传图片，填写价格和取货方式。\n30秒发布完成。",
  },
  {
    number: "02",
    icon: <Users className="w-12 h-12 text-[#2f9e6d]" />,
    title: "本地匹配",
    description: "系统自动推荐给附近的华人买家，\n分享到微信群和小红书。",
  },
  {
    number: "03",
    icon: <Handshake className="w-12 h-12 text-[#2f9e6d]" />,
    title: "安心成交",
    description: "约定自取地点完成交易，互相评价，\n建立社区信任。",
  },
];

/* HowItWorks — horizontal 3-step on desktop, sticky scrollytelling on mobile */
export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const { top, height } = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If we haven't reached the section yet
      if (top > 0) {
        setActiveIndex(0);
        return;
      }

      const scrollDistance = -top;
      const scrollableHeight = height - windowHeight;

      // If we've scrolled past the section
      if (scrollDistance >= scrollableHeight) {
        setActiveIndex(steps.length - 1);
        return;
      }

      // Calculate progress (0 to 1) and map to the 3 steps
      const progress = scrollDistance / scrollableHeight;
      const index = Math.floor(progress * steps.length);
      setActiveIndex(Math.min(index, steps.length - 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      // h-[300vh] on mobile forces scrolling, h-auto on desktop
      className="border-t border-b border-[rgba(31,41,51,0.05)] h-[250vh] md:h-auto relative"
      style={{ background: "rgba(227,241,234,0.4)" }}
    >
      {/* Sticky container for mobile, static for desktop */}
      <div className="sticky top-0 h-[100dvh] md:relative md:h-auto md:top-auto flex flex-col justify-center overflow-hidden md:overflow-visible">
        <div className="max-w-[996px] w-full mx-auto px-6 py-12 md:py-20 relative">
          {/* Heading */}
          <h2 className="text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-[#1f2933] text-center tracking-[0.4px] mb-8 md:mb-12">
            三步搞定闲置买卖
          </h2>

          {/* DESKTOP LAYOUT (Horizontal Grid) */}
          <div className="hidden md:flex flex-row items-stretch">
            {steps.map((step, i) => (
              <div key={step.number} className="flex flex-1 items-stretch">
                <div
                  className="group bg-[rgba(255,255,255,0.6)] border border-[rgba(31,41,51,0.05)] rounded-2xl p-6 flex flex-col gap-3 w-full
                               cursor-default transition-all duration-300
                               hover:-translate-y-1.5
                               hover:bg-[rgba(255,255,255,0.9)]
                               hover:shadow-[0_12px_32px_rgba(47,158,109,0.1)]
                               hover:border-[rgba(47,158,109,0.2)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-fluid-h1 font-bold text-[rgba(47,158,109,0.3)] tracking-[0.35px] leading-none transition-colors duration-300 group-hover:text-[rgba(47,158,109,0.55)]">
                      {step.number}
                    </span>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-fluid-h4 text-[#1f2933] font-medium transition-colors duration-300 group-hover:text-[#2f9e6d]">
                    {step.title}
                  </h3>
                  <p className="text-[#5a6b73] text-sm leading-5 whitespace-pre-line">
                    {step.description}
                  </p>
                </div>

                {i < steps.length - 1 && (
                  <div className="flex items-center px-3 shrink-0 pt-10">
                    <ArrowRight className="w-4 h-4 text-[rgba(47,158,109,0.4)]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* MOBILE LAYOUT (Sticky Scrollytelling) */}
          <div className="flex md:hidden relative w-full h-[320px]">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`absolute inset-0 w-full transition-all duration-700 ease-out flex flex-col
                  ${
                    activeIndex === i
                      ? "opacity-100 blur-none translate-y-0 scale-100 z-10"
                      : activeIndex > i
                        ? "opacity-0 blur-md -translate-y-12 scale-95 z-0 pointer-events-none"
                        : "opacity-0 blur-md translate-y-12 scale-95 z-0 pointer-events-none"
                  }
                `}
              >
                <div className="bg-[rgba(255,255,255,0.9)] shadow-[0_12px_32px_rgba(47,158,109,0.1)] border border-[rgba(47,158,109,0.2)] rounded-2xl p-8 flex flex-col gap-4 w-full h-full">
                  <div className="flex items-start justify-between">
                    <span className="text-fluid-h1 font-bold text-[rgba(47,158,109,0.55)] tracking-[0.35px] leading-none">
                      {step.number}
                    </span>
                    <div className="scale-110">{step.icon}</div>
                  </div>
                  <h3 className="text-fluid-h2-mobile text-[#2f9e6d] font-semibold mt-2">
                    {step.title}
                  </h3>
                  <p className="text-[#5a6b73] text-base leading-6 whitespace-pre-line">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Progress Dots (Right side vertical) */}
          <div className="flex md:hidden absolute right-2 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-500 ${activeIndex === i ? "h-6 bg-[#2f9e6d]" : "h-1.5 bg-[rgba(47,158,109,0.3)]"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
