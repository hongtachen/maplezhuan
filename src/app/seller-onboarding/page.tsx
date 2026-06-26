"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUserProfile, UserProfile } from "@/lib/firebase/users";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LocationPicker, { LocationData } from "@/components/ui/LocationPicker";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();

  const [wechat, setWechat] = useState("");
  const [phone, setPhone] = useState("");
  const [addressData, setAddressData] = useState<LocationData | undefined>(
    undefined,
  );
  const [isPublic, setIsPublic] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!wechat && !phone) {
        alert("请至少填写一项联系方式（微信号或手机号）以便平台备案。");
        return;
      }
      if (isPublic && !wechat && !phone) {
        alert("如果您希望公开联系方式，请至少填写微信号或手机号。");
        return;
      }
      if (!agreed) {
        alert("请阅读并同意卖家规范承诺");
        return;
      }

      if (!user) {
        alert("错误：未检测到登录用户");
        return;
      }
      if (!userProfile) {
        alert("错误：用户资料尚未加载完成，请刷新页面重试");
        return;
      }

      const updates: Partial<UserProfile> = {
        isVerifiedSeller: true,
        wechat,
        phone,
        isPublicContact: isPublic,
      };

      if (addressData) {
        // Ensure no undefined values inside addressData
        updates.defaultAddress = {
          lat: addressData.lat,
          lng: addressData.lng,
          text: addressData.text,
          showExactLocation: addressData.showExactLocation ?? true,
        };
      }

      await updateUserProfile(user.uid, updates);

      useAuthStore.setState({
        userProfile: {
          ...userProfile,
          isVerifiedSeller: true,
          wechat,
          phone,
          isPublicContact: isPublic,
          defaultAddress: updates.defaultAddress || userProfile.defaultAddress,
        },
      });

      alert("🎉 恭喜！您已成功开通发布权限。");
      router.replace("/publish");
    } catch (error: unknown) {
      console.error("Submit error:", error);
      alert("提交失败: " + ((error as Error).message || "未知错误"));
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-[#f3fbf7]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#f3fbf7]/80 backdrop-blur-md px-4 py-3 flex items-center justify-center">
          <div className="max-w-[500px] md:max-w-2xl w-full flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 shadow-sm border border-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-[#1f2933]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="font-bold text-[#1f2933]">卖家认证</span>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </header>

        <div className="flex-1 max-w-[500px] md:max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 pb-12 flex flex-col relative z-20">
          {/* Title Area */}
          <div className="mb-8 text-center px-4">
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[rgba(31,41,51,0.04)] rotate-3 hover:rotate-0 transition-transform">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-black text-[#1f2933] mb-2">
              成为认证卖家
            </h1>
            <p className="text-[14px] text-[#5a6b73] leading-relaxed">
              为了打造一个安全可靠的交易环境，
              <br />
              发布闲置前需要进行简单的邮箱认证。
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Email Information (Read-only) */}
            <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#e8f5ee] text-[#2f9e6d] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-[16px] font-bold text-[#1f2933]">
                  账号绑定的邮箱
                </h2>
              </div>
              <div className="bg-[#f7f9fc] rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-[#5a6b73] flex items-center opacity-70 cursor-not-allowed">
                <svg
                  className="w-5 h-5 mr-3 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {user?.email}
              </div>
            </section>

            {/* Contact Info Card */}
            <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-[#5a6b73] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-[16px] font-bold text-[#1f2933]">
                  发布联系方式
                </h2>
              </div>
              <p className="text-[13px] text-[#5a6b73] mb-5 ml-11">
                请至少填写一项真实联系方式。
              </p>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] grayscale opacity-70">
                    💬
                  </span>
                  <input
                    type="text"
                    value={wechat}
                    onChange={(e) => setWechat(e.target.value)}
                    placeholder="微信号"
                    className="w-full bg-[#f7f9fc] border border-transparent rounded-[16px] pl-11 pr-4 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#2f9e6d] transition-all"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] grayscale opacity-70">
                    📱
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="手机号"
                    className="w-full bg-[#f7f9fc] border border-transparent rounded-[16px] pl-11 pr-4 py-3.5 text-[15px] outline-none focus:bg-white focus:border-[#2f9e6d] transition-all"
                  />
                </div>

                {/* Privacy Toggle */}
                <div className="pt-4 mt-2 border-t border-[rgba(31,41,51,0.04)]">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="pr-4">
                      <span className="block text-[14px] font-bold text-[#1f2933] mb-0.5">
                        向买家公开联系方式
                      </span>
                      <span className="block text-[12px] text-[#5a6b73] leading-relaxed">
                        {isPublic
                          ? "买家在商品页可直接看到您的联系方式"
                          : "联系方式将被隐藏，通过站内信沟通"}
                      </span>
                    </div>
                    <div className="relative shrink-0 flex items-center justify-center w-12 h-7 bg-gray-200 rounded-full group-hover:bg-gray-300 transition-colors duration-300">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                      <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring"></div>
                      <div className="absolute inset-0 rounded-full bg-[#2f9e6d] opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></div>
                      {/* The dot needs to be rendered above the background */}
                      <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring z-10"></div>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* Location Map Card */}
            <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-[#5a6b73] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-[16px] font-bold text-[#1f2933]">
                  默认发货/面交地址
                </h2>
              </div>
              <p className="text-[13px] text-[#5a6b73] mb-5 ml-11">
                设置后，发布闲置时可一键带入该地址。未来可在设置中随时修改。
              </p>

              <div className="ml-11">
                <LocationPicker value={addressData} onChange={setAddressData} />
              </div>
            </section>

            {/* Agreement */}
            <section className="px-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0 mt-[2px]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-300 rounded-[5px] cursor-pointer checked:bg-[#2f9e6d] checked:border-[#2f9e6d] transition-colors"
                  />
                  <svg
                    className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="text-[13px] text-[#5a6b73] leading-relaxed select-none -mt-0.5">
                  我承诺发布的商品信息真实有效，与买家友好沟通交流。同意遵守
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowGuidelines(true);
                    }}
                    className="text-[#2f9e6d] font-bold hover:underline ml-1"
                  >
                    卖家规范
                  </button>
                  。
                </div>
              </label>
            </section>
          </div>
        </div>

        {/* Sticky Bottom Action Bar - Using sticky wrapper to guarantee alignment */}
        <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#f3fbf7]/90 backdrop-blur-md pb-safe">
          {/* Subtle top gradient shadow */}
          <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[#f3fbf7] to-transparent opacity-80 pointer-events-none" />
          <div className="max-w-[500px] md:max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 pb-8">
            <button
              onClick={handleSubmit}
              className="w-full bg-[#2f9e6d] hover:bg-[#267a56] text-white font-bold text-[16px] py-4 rounded-[16px] shadow-[0_8px_20px_-8px_rgba(47,158,109,0.5)] transition-all active:scale-[0.98] flex items-center justify-center"
            >
              开启发布权限
            </button>
          </div>
        </div>

        {/* Guidelines Modal */}
        {showGuidelines && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1f2933]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-[400px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[rgba(31,41,51,0.04)] flex items-center justify-between bg-gray-50/50">
                <h3 className="text-[16px] font-bold text-[#1f2933]">
                  平台卖家行为规范
                </h3>
                <button
                  onClick={() => setShowGuidelines(false)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#5a6b73] hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-5 text-[14px] text-[#5a6b73] leading-relaxed">
                  <div>
                    <strong className="text-[#1f2933] block mb-1">
                      1. 信息真实
                    </strong>
                    卖家应如实描述商品的新旧程度、瑕疵及历史使用情况，不得隐瞒重大质量问题。
                  </div>
                  <div>
                    <strong className="text-[#1f2933] block mb-1">
                      2. 严禁违禁品
                    </strong>
                    严禁发布黄赌毒、管制刀具、处方药及其他违反当地法律法规的物品。
                  </div>
                  <div>
                    <strong className="text-[#1f2933] block mb-1">
                      3. 遵守契约
                    </strong>
                    在与买家达成交易意向后，请勿随意毁约、涨价或“放鸽子”。
                  </div>
                  <div>
                    <strong className="text-[#1f2933] block mb-1">
                      4. 隐私保护
                    </strong>
                    请勿在公共区域泄露他人的个人隐私信息。
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-[rgba(31,41,51,0.04)] bg-white">
                <button
                  onClick={() => {
                    setAgreed(true);
                    setShowGuidelines(false);
                  }}
                  className="w-full bg-[#1f2933] text-white font-bold py-3.5 rounded-[16px] hover:bg-[#323d46] transition-colors active:scale-[0.98]"
                >
                  我已阅读并了解
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
