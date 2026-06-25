import { CheckCircle2, Star, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge";

const trustPoints = [
  "公开的买家与卖家评分与成交数",
  "买家真实留言，不可删除",
  "举报与内容审核机制",
  "认证状态可见，隐私信息不公开",
];

const reviews = [
  { reviewer: "陈某某", text: "卖家很爽快，东西比照片还新！" },
  { reviewer: "张某某", text: "约取货很准时，价格也实在，推荐此卖家。" },
];

/* Five star icons */
function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-[#2f9e6d] text-[#2f9e6d]" />
      ))}
    </div>
  );
}

/* Trust section — 2-col on desktop, stacked on mobile */
export default function Trust() {
  return (
    <section id="trust" className="bg-[#f3fbf7] py-20">
      <div className="max-w-[996px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          {/* Left — text content */}
          <div className="flex flex-col gap-6 md:max-w-[450px] shrink-0 items-start">
            <Badge variant="red">信任机制</Badge>

            <h2 className="text-fluid-h2 font-semibold text-[#1f2933] tracking-[0.4px]">
              二手交易，最重要是
              <span className="text-[#2f9e6d]">放心</span>。
            </h2>

            <p className="text-[#5a6b73] text-fluid-p md:text-xl leading-relaxed">
              每一位用户都有公开的交易记录、星级评价。
              <br />
              好评价，会帮你说话。
            </p>

            {/* Trust bullet list */}
            <ul className="flex flex-col gap-4 mt-2">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2f9e6d] shrink-0" />
                  <span className="text-[#1f2933] text-base md:text-lg font-medium">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — testimonial card */}
          <div className="flex-1">
            <div
              className="group bg-white border border-[rgba(31,41,51,0.05)] rounded-[14px] p-6 flex flex-col gap-6
                            cursor-default transition-all duration-300
                            hover:-translate-y-1.5
                            hover:shadow-[0_12px_32px_rgba(47,158,109,0.1)]
                            hover:border-[rgba(47,158,109,0.2)]"
            >
              {/* Seller profile */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1f7a55] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white text-base font-bold">王</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1f2933] text-base font-bold">
                      王某某
                    </span>

                    <div className="relative">
                      {/* Glowing dot on verified badge */}
                      <span className="relative flex items-center gap-1 bg-[rgba(47,158,109,0.1)] text-[#2f9e6d] text-xs font-medium px-2 py-0.5 rounded-lg border border-[rgba(47,158,109,0.2)]">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2f9e6d] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2f9e6d]"></span>
                        </span>
                        认证卖家
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5a6b73] text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    4.9 · 32 单完成 · Toronto
                  </div>
                </div>
              </div>

              {/* Review bubbles */}
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <div
                    key={review.reviewer}
                    className="bg-[#e3f1ea] rounded-[10px] p-3 flex flex-col gap-1 transition-all duration-300 
                               cursor-default hover:-translate-y-1 hover:bg-[#d4eadb] hover:shadow-[0_4px_16px_rgba(47,158,109,0.15)]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="transition-transform duration-300 hover:scale-110">
                        <StarRating />
                      </div>
                      <span className="text-[#5a6b73] text-sm font-medium">
                        {review.reviewer}
                      </span>
                    </div>
                    <p className="text-[#1f2933] text-sm leading-5">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
