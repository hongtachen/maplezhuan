"use client";

import { useRouter } from "next/navigation";
import { usePublishStore } from "@/store/usePublishStore";
import { useApp } from "@/components/app/AppContext";
import LocationPicker from "@/components/ui/LocationPicker";

export default function SubletStep1Page() {
  const router = useRouter();
  const { subletData, setSubletData } = usePublishStore();
  const { showToast } = useApp();

  const handleNext = () => {
    if (
      !subletData.title ||
      !subletData.propertyType ||
      !subletData.spaceType ||
      !subletData.address
    ) {
      showToast(
        "请填写所有必填项（标题、房源类型、租客空间、完整地址）",
        "error",
      );
      return;
    }
    router.push("/publish/sublet/step2");
  };

  const isStepValid = !!(
    subletData.title &&
    subletData.propertyType &&
    subletData.spaceType &&
    subletData.address
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

          {/* Progress Bar */}
          <div className="flex-1 max-w-[200px] mx-4 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-[rgba(31,41,51,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2f9e6d] rounded-full"
                style={{ width: "25%" }}
              ></div>
            </div>
            <span className="text-xs text-[#5a6b73] font-medium shrink-0">
              1 / 4
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
            1
          </div>
          <span className="text-sm text-[#5a6b73] font-medium">步骤 1 / 4</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1f2933] mb-8">介绍你的房源</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          <div className="flex flex-col">
            {/* Section: Title */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                转租标题 <span className="text-[#2f9e6d]">*</span>
              </h2>
              <input
                type="text"
                value={subletData.title}
                onChange={(e) => setSubletData({ title: e.target.value })}
                placeholder="例：滑大附近温馨主卧转租"
                className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] bg-white focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px]"
              />
            </section>

            {/* Section: Property Type */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                房源类型 <span className="text-[#2f9e6d]">*</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSubletData({ propertyType: "house" })}
                  className={`p-4 rounded-2xl border text-left transition-all ${subletData.propertyType === "house" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                >
                  <svg
                    className={`w-8 h-8 mb-3 ${subletData.propertyType === "house" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <h3 className="font-bold text-[#1f2933] mb-1">House</h3>
                  <p className="text-xs text-[#5a6b73]">独栋或联排住宅</p>
                </button>
                <button
                  onClick={() => setSubletData({ propertyType: "apartment" })}
                  className={`p-4 rounded-2xl border text-left transition-all ${subletData.propertyType === "apartment" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                >
                  <svg
                    className={`w-8 h-8 mb-3 ${subletData.propertyType === "apartment" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="font-bold text-[#1f2933] mb-1">Apartment</h3>
                  <p className="text-xs text-[#5a6b73]">公寓或共管楼</p>
                </button>
              </div>
            </section>

            {/* Section: Space Type */}
            <section className="mb-8 md:mb-0">
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                租客将拥有什么样的空间？{" "}
                <span className="text-[#2f9e6d]">*</span>
              </h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setSubletData({ spaceType: "entire" })}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${subletData.spaceType === "entire" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                >
                  <svg
                    className={`w-6 h-6 shrink-0 ${subletData.spaceType === "entire" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold text-[#1f2933] mb-1 text-[15px]">
                      整套出租
                    </h3>
                    <p className="text-xs text-[#5a6b73]">租客独享整套住所</p>
                  </div>
                </button>
                <button
                  onClick={() => setSubletData({ spaceType: "private" })}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${subletData.spaceType === "private" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                >
                  <svg
                    className={`w-6 h-6 shrink-0 ${subletData.spaceType === "private" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold text-[#1f2933] mb-1 text-[15px]">
                      独立房间
                    </h3>
                    <p className="text-xs text-[#5a6b73]">
                      租客有独立房间，共用公共空间
                    </p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          <div className="flex flex-col">
            {/* Section: Address */}
            <section>
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                房源地址
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1f2933] mb-2">
                    完整地址 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <LocationPicker
                    value={subletData.locationData}
                    onChange={(data) => {
                      setSubletData({ locationData: data, address: data.text });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1f2933] mb-2">
                    单元号（可选）
                  </label>
                  <input
                    type="text"
                    value={subletData.unit}
                    onChange={(e) => setSubletData({ unit: e.target.value })}
                    placeholder="Apt / Unit / Room"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] bg-white focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#f3fbf7]/90 backdrop-blur-md pb-safe border-t border-[rgba(31,41,51,0.08)]">
        <div className="max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-4 pb-8 flex items-center justify-end">
          <div className="w-full md:w-[300px]">
            <button
              onClick={handleNext}
              disabled={!isStepValid}
              className={`block w-full py-3.5 rounded-xl text-center font-bold text-[15px] transition-colors ${
                isStepValid
                  ? "bg-[#2f9e6d] text-white hover:bg-[#267a56]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
