"use client";

import { useRouter } from "next/navigation";
import { usePublishStore } from "@/store/usePublishStore";
import { useApp } from "@/components/app/AppContext";
import ImageUpload from "@/components/ui/ImageUpload";

export default function SubletStep3Page() {
  const router = useRouter();
  const { subletData, setSubletData } = usePublishStore();
  const { showToast } = useApp();

  const handleNext = () => {
    if (!subletData.images || subletData.images.length < 3) {
      showToast("请至少上传三张照片", "error");
      return;
    }
    router.push("/publish/sublet/step4");
  };

  const isStepValid = !!(subletData.images && subletData.images.length >= 3);

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
                style={{ width: "75%" }}
              ></div>
            </div>
            <span className="text-xs text-[#5a6b73] font-medium shrink-0">
              3 / 4
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
            3
          </div>
          <span className="text-sm text-[#5a6b73] font-medium">步骤 3 / 4</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1f2933] mb-1">上传房间照片</h1>
        <p className="text-[#5a6b73] text-sm mb-8">至少 3 张图片</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col">
            {/* Upload Area */}
            <section className="mb-8 md:mb-0">
              <ImageUpload
                images={subletData.images || []}
                onImagesChange={(images) => setSubletData({ images })}
                maxImages={9}
              />
            </section>
          </div>

          <div className="flex flex-col">
            {/* Tips */}
            <div className="bg-white p-4 rounded-xl border border-[rgba(31,41,51,0.08)] flex items-start gap-3">
              <span className="text-xl shrink-0">💡</span>
              <p className="text-sm text-[#5a6b73] leading-relaxed">
                清晰的照片能吸引更多租客，建议拍摄客厅、卧室、卫生间各区域
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#f3fbf7]/90 backdrop-blur-md pb-safe border-t border-[rgba(31,41,51,0.08)]">
        <div className="max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-4 pb-8 flex items-center justify-end">
          <div className="w-full md:w-[300px] flex flex-col items-center gap-2">
            <span className="text-xs text-[#5a6b73]">
              已上传{" "}
              <strong className="text-[#1f2933]">
                {subletData.images?.length || 0}
              </strong>{" "}
              张照片
            </span>
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
