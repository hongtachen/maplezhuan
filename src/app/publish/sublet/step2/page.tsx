"use client";

import { useRouter } from "next/navigation";
import { usePublishStore } from "@/store/usePublishStore";
import { useApp } from "@/components/app/AppContext";

export default function SubletStep2Page() {
  const router = useRouter();
  const { subletData, setSubletData } = usePublishStore();
  const { showToast } = useApp();

  const handleNext = () => {
    const isOtherRoom = subletData.roomTypes?.includes("other");
    if (
      !subletData.roomTypes?.length ||
      (isOtherRoom && !subletData.customRoomType?.trim()) ||
      !subletData.leaseTerms?.length ||
      !subletData.moveInDate
    ) {
      showToast(
        isOtherRoom && !subletData.customRoomType?.trim()
          ? "请填写自定义房型"
          : "请完善房型、租期和入住时间",
        "error",
      );
      return;
    }
    router.push("/publish/sublet/step3");
  };

  const isOtherRoomSelected = (subletData.roomTypes || []).includes("other");

  const isStepValid = !!(
    subletData.roomTypes?.length &&
    (!isOtherRoomSelected || subletData.customRoomType?.trim()) &&
    subletData.leaseTerms?.length &&
    subletData.moveInDate
  );

  const roomTypes = [
    { id: "studio", title: "Studio", desc: "开放式一室" },
    { id: "1b1b", title: "一房一卫", desc: "1 bed · 1 bath" },
    { id: "2b2b", title: "两房两卫", desc: "2 bed · 2 bath" },
    { id: "ensuite", title: "Ensuite", desc: "独立卫浴" },
    { id: "shared", title: "合租", desc: "共享公共空间" },
    { id: "room", title: "单间", desc: "独立一个房间" },
    { id: "other", title: "其他", desc: "自定义填写" },
  ];

  const terms = [
    "1个月",
    "4个月",
    "8个月",
    "12个月",
    "1年以上",
    "可商量",
    "不限",
  ];

  const toggleRoomType = (id: string) => {
    if (id === "other") {
      setSubletData({
        roomTypes: ["other"],
        customRoomType: subletData.customRoomType || "",
      });
    } else {
      setSubletData({ roomTypes: [id], customRoomType: "" });
    }
  };

  const toggleTerm = (term: string) => {
    setSubletData({ leaseTerms: [term] });
  };

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
                style={{ width: "50%" }}
              ></div>
            </div>
            <span className="text-xs text-[#5a6b73] font-medium shrink-0">
              2 / 4
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
            2
          </div>
          <span className="text-sm text-[#5a6b73] font-medium">步骤 2 / 4</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1f2933] mb-8">房源详情</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          <div className="flex flex-col">
            {/* Room Types */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">房型</h2>
              <div className="grid grid-cols-2 gap-3">
                {roomTypes.map((rt) => {
                  const isSelected = (subletData.roomTypes || []).includes(
                    rt.id,
                  );
                  return (
                    <button
                      key={rt.id}
                      onClick={() => toggleRoomType(rt.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${isSelected ? "border-[#2f9e6d] bg-[#f3fbf7] ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                    >
                      <h3
                        className={`font-bold mb-1 ${isSelected ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                      >
                        {rt.title}
                      </h3>
                      <p
                        className={`text-xs ${isSelected ? "text-[#267a56]" : "text-[#5a6b73]"}`}
                      >
                        {rt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
              {isOtherRoomSelected && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    自定义房型 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <input
                    type="text"
                    value={subletData.customRoomType || ""}
                    onChange={(e) =>
                      setSubletData({ customRoomType: e.target.value })
                    }
                    placeholder="例如：主卧合租、地下室单间、客厅隔间"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px] placeholder:text-[#a0aeb5] bg-white"
                  />
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col">
            {/* Lease Terms */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                租期要求
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {terms.map((t) => {
                  const isSelected = (subletData.leaseTerms || []).includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTerm(t)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${isSelected ? "border-[#2f9e6d] bg-[#2f9e6d] text-white" : "border-[rgba(31,41,51,0.12)] bg-white text-[#1f2933] hover:border-[#2f9e6d]"}`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Move-in Date */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                可入住时间
              </h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setSubletData({ moveInDate: "flexible" })}
                  className={`p-4 rounded-xl border bg-white text-left transition-colors ${subletData.moveInDate === "flexible" ? "border-[#2f9e6d] ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] hover:border-[#2f9e6d]"}`}
                >
                  <h3
                    className={`font-bold mb-1 ${subletData.moveInDate === "flexible" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                  >
                    时间灵活
                  </h3>
                  <p
                    className={`text-xs ${subletData.moveInDate === "flexible" ? "text-[#267a56]" : "text-[#5a6b73]"}`}
                  >
                    可与租客商量
                  </p>
                </button>
                <div
                  className={`p-4 rounded-xl border bg-white text-left transition-colors flex flex-col gap-3 ${subletData.moveInDate && subletData.moveInDate !== "flexible" ? "border-[#2f9e6d] ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] hover:border-[#2f9e6d]"}`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setSubletData({
                        moveInDate:
                          subletData.moveInDate &&
                          subletData.moveInDate !== "flexible"
                            ? subletData.moveInDate
                            : new Date().toISOString().split("T")[0],
                      })
                    }
                  >
                    <div>
                      <h3
                        className={`font-bold mb-1 ${subletData.moveInDate && subletData.moveInDate !== "flexible" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                      >
                        具体日期
                      </h3>
                      <p
                        className={`text-xs ${subletData.moveInDate && subletData.moveInDate !== "flexible" ? "text-[#267a56]" : "text-[#5a6b73]"}`}
                      >
                        选择具体的入住时间
                      </p>
                    </div>
                  </div>
                  {subletData.moveInDate &&
                    subletData.moveInDate !== "flexible" && (
                      <input
                        type="date"
                        value={subletData.moveInDate}
                        onChange={(e) =>
                          setSubletData({ moveInDate: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none text-[15px] mt-2"
                      />
                    )}
                </div>
              </div>
            </section>

            {/* Renewable */}
            <section>
              <h2 className="text-sm font-bold text-[#5a6b73] mb-4">
                是否可续租（选填）
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setSubletData({
                      renewable:
                        subletData.renewable === true ? undefined : true,
                    })
                  }
                  className={`flex-1 p-4 rounded-xl border text-center transition-colors ${subletData.renewable === true ? "border-[#2f9e6d] bg-[#f3fbf7] ring-1 ring-[#2f9e6d] font-bold text-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white text-[#1f2933] hover:border-[#2f9e6d]"}`}
                >
                  可续租
                </button>
                <button
                  onClick={() =>
                    setSubletData({
                      renewable:
                        subletData.renewable === false ? undefined : false,
                    })
                  }
                  className={`flex-1 p-4 rounded-xl border text-center transition-colors ${subletData.renewable === false ? "border-[#2f9e6d] bg-[#f3fbf7] ring-1 ring-[#2f9e6d] font-bold text-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white text-[#1f2933] hover:border-[#2f9e6d]"}`}
                >
                  不可续租
                </button>
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
