"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePublishStore } from "@/store/usePublishStore";
import { uploadMultipleImages } from "@/lib/firebase/storage";
import { addSublet } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import PublishSuccessOverlay from "@/components/motion/PublishSuccessOverlay";

export default function SubletStep4Page() {
  const router = useRouter();
  const { subletData, setSubletData, clearSubletData } = usePublishStore();
  const { user } = useAuthStore();
  const { showToast } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePublishSuccessComplete = useCallback(() => {
    router.push("/profile/listings");
  }, [router]);

  const handleSubmit = async () => {
    if (!subletData.propertyType || !subletData.price || !subletData.address) {
      showToast("请填写所有必填信息", "error");
      return;
    }

    if (!subletData.contactPhone && !subletData.contactWechat) {
      showToast("请至少提供一种联系方式（手机或微信）", "error");
      return;
    }

    if (!user) {
      showToast("请先登录", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload images
      let uploadedImageUrls: string[] = [];
      if (subletData.images && subletData.images.length > 0) {
        const files = subletData.images.filter(
          (img): img is File => img instanceof File,
        );
        const existingUrls = subletData.images.filter(
          (img): img is string => typeof img === "string",
        );

        const newUrls = await uploadMultipleImages(
          files,
          `sublets/${user.uid}`,
        );
        uploadedImageUrls = [...existingUrls, ...newUrls];
      }

      // Save to firestore
      await addSublet({
        title: subletData.title || "",
        propertyType: subletData.propertyType || "",
        spaceType: subletData.spaceType || "",
        roomTypes: subletData.roomTypes || [],
        leaseTerms: subletData.leaseTerms || [],
        moveInDate: subletData.moveInDate || "",
        ...(subletData.renewable !== undefined && {
          renewable: subletData.renewable,
        }),
        address: subletData.address || "",
        city: subletData.locationData?.city || "",
        ...(subletData.locationData && {
          locationData: subletData.locationData,
        }),
        unit: subletData.unit || "",
        hideAddress: subletData.hideAddress || false,
        price: subletData.price || 0,
        utilitiesIncluded: subletData.utilitiesIncluded || false,
        furnished: subletData.furnished || false,
        contactPhone: subletData.contactPhone || "",
        contactWechat: subletData.contactWechat || "",
        description: subletData.description || "",
        images: uploadedImageUrls,
        sellerId: user.uid,
        status: "招租中",
        views: 0,
        favorites: 0,
        inquiries: 0,
      });

      clearSubletData();
      setShowSuccess(true);
    } catch (error) {
      console.error("Publish failed:", error);
      showToast("发布失败，请重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = !!(
    subletData.price &&
    (subletData.contactPhone || subletData.contactWechat)
  );

  return (
    <div className="flex flex-col min-h-dvh bg-[#f3fbf7]">
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)]">
        <div className="flex items-center justify-between px-4 py-4 max-w-[600px] mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[#f3fbf7] text-[#1f2933]"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          <div className="flex-1 max-w-[200px] mx-4 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-[rgba(31,41,51,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2f9e6d] rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
            <span className="text-xs text-[#5a6b73] font-medium shrink-0">
              4 / 4
            </span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-[#5a6b73] text-sm font-medium"
          >
            退出
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-6 py-8 pb-32">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-[#2f9e6d] text-white flex items-center justify-center text-xs font-bold">
            4
          </div>
          <span className="text-sm text-[#5a6b73] font-medium">步骤 4 / 4</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1f2933] mb-8">
          月租 & 联系信息
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          <div className="flex flex-col">
            {/* Price Section */}
            <section className="mb-8 bg-white p-6 rounded-3xl border border-[rgba(31,41,51,0.04)] shadow-sm">
              <h2 className="text-sm font-bold text-[#1f2933] mb-4">
                月租金 <span className="text-[#2f9e6d]">*</span>
              </h2>
              <div className="relative mb-6">
                <span className="absolute left-4 top-3 text-[#1f2933] font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={subletData.price || ""}
                  onChange={(e) =>
                    setSubletData({ price: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full pl-8 pr-24 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px] font-bold"
                />
                <span className="absolute right-4 top-3 text-[#5a6b73]">
                  CAD / 月
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[#1f2933]">
                  是否包水电网？
                </span>
                <div
                  className={`w-11 h-6 rounded-full relative cursor-pointer flex items-center px-0.5 transition-colors ${subletData.utilitiesIncluded ? "bg-[#2f9e6d]" : "bg-[rgba(31,41,51,0.12)]"}`}
                  onClick={() =>
                    setSubletData({
                      utilitiesIncluded: !subletData.utilitiesIncluded,
                    })
                  }
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${subletData.utilitiesIncluded ? "translate-x-5" : ""}`}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1f2933]">
                  是否带家具？
                </span>
                <div
                  className={`w-11 h-6 rounded-full relative cursor-pointer flex items-center px-0.5 transition-colors ${subletData.furnished ? "bg-[#2f9e6d]" : "bg-[rgba(31,41,51,0.12)]"}`}
                  onClick={() =>
                    setSubletData({ furnished: !subletData.furnished })
                  }
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${subletData.furnished ? "translate-x-5" : ""}`}
                  ></div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-8 md:mb-0 bg-white p-6 rounded-3xl border border-[rgba(31,41,51,0.04)] shadow-sm">
              <h2 className="text-sm font-bold text-[#1f2933] mb-2">
                联系方式
              </h2>
              <p className="text-xs text-[#5a6b73] mb-4">
                买家通过此处联系你，至少填写一种
              </p>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-[#5a6b73]">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={subletData.contactPhone}
                    onChange={(e) =>
                      setSubletData({ contactPhone: e.target.value })
                    }
                    placeholder="手机号码"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-[#5a6b73]">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={subletData.contactWechat}
                    onChange={(e) =>
                      setSubletData({ contactWechat: e.target.value })
                    }
                    placeholder="微信号"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col">
            {/* Description Section */}
            <section className="bg-white p-6 rounded-3xl border border-[rgba(31,41,51,0.04)] shadow-sm h-full flex flex-col">
              <h2 className="text-sm font-bold text-[#1f2933] mb-4">
                其他补充（可选）
              </h2>
              <textarea
                rows={10}
                value={subletData.description}
                onChange={(e) => setSubletData({ description: e.target.value })}
                placeholder="介绍一下室友情况、对租客的要求，或任何其他想补充的信息..."
                className="w-full flex-1 px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-sm placeholder:text-[#a0aeb5] resize-none"
              ></textarea>
            </section>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#f3fbf7]/90 backdrop-blur-md pb-safe border-t border-[rgba(31,41,51,0.08)] shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-4 pb-8 flex items-center justify-end">
          <div className="w-full md:w-[300px]">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid}
              className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-sm mb-2 ${
                isStepValid && !isSubmitting
                  ? "bg-[#2f9e6d] text-white hover:bg-[#267a56]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "发布中..." : "发布房源"}
            </button>
            <p className="text-center text-[10px] text-[#5a6b73] flex items-center justify-center gap-1">
              <svg
                className="w-3 h-3 text-[#2f9e6d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              发布后 24 小时内完成审核
            </p>
          </div>
        </div>
      </div>
      <PublishSuccessOverlay
        open={showSuccess}
        onComplete={handlePublishSuccessComplete}
      />
    </div>
  );
}
