"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  updateUserProfile,
  uploadUserAvatar,
  UserProfile,
} from "@/lib/firebase/users";
import { useApp } from "@/components/app/AppContext";
import LocationPicker, { LocationData } from "@/components/ui/LocationPicker";

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile } = useAuthStore();
  const { showToast } = useApp();

  const [nickname, setNickname] = useState("");
  const [wechat, setWechat] = useState("");
  const [phone, setPhone] = useState("");
  const [addressData, setAddressData] = useState<LocationData | undefined>(
    undefined,
  );
  const [isPublic, setIsPublic] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setTimeout(() => {
        if (userProfile.nickname) setNickname(userProfile.nickname);
        if (userProfile.wechat) setWechat(userProfile.wechat);
        if (userProfile.phone) setPhone(userProfile.phone);
        if (userProfile.isPublicContact !== undefined)
          setIsPublic(userProfile.isPublicContact);
        if (userProfile.emailNotifications !== undefined)
          setEmailNotifications(userProfile.emailNotifications);
        if (userProfile.defaultAddress)
          setAddressData(userProfile.defaultAddress);
      }, 0);
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      if (!user) {
        showToast("错误：未检测到登录用户", "error");
        return;
      }
      if (!userProfile) {
        showToast("错误：用户资料尚未加载完成", "error");
        return;
      }
      if (!nickname.trim()) {
        showToast("昵称不能为空", "error");
        return;
      }

      setIsSaving(true);
      const updates: Partial<UserProfile> = {
        nickname: nickname.trim(),
        wechat: wechat.trim(),
        phone: phone.trim(),
        isPublicContact: isPublic,
        emailNotifications: emailNotifications,
      };

      if (addressData) {
        updates.defaultAddress = {
          lat: addressData.lat,
          lng: addressData.lng,
          text: addressData.text,
          showExactLocation: addressData.showExactLocation ?? true,
        };
      }

      console.log("Saving settings updates:", updates);
      await updateUserProfile(user.uid, updates);

      // Update local store so UI reflects immediately
      useAuthStore.setState({
        userProfile: { ...userProfile, ...updates },
      });
      showToast("资料已更新", "success");
      router.back();
    } catch (error: unknown) {
      console.error("Save error:", error);
      showToast(
        "更新失败: " + ((error as Error).message || "未知错误"),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !userProfile) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("图片大小不能超过 5MB", "error");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadUserAvatar(user.uid, file);
      useAuthStore.setState({
        userProfile: { ...userProfile, avatarUrl: url },
      });
      showToast("头像上传成功", "success");
    } catch (error) {
      console.error(error);
      showToast("头像上传失败", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#f3fbf7]">
        <div className="w-8 h-8 border-4 border-[#2f9e6d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const avatarUrl = userProfile.avatarUrl || user.photoURL;

  return (
    <div className="flex flex-col min-h-screen bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f3fbf7]/80 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-[rgba(31,41,51,0.05)]">
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
          <span className="font-bold text-[#1f2933]">账号与隐私设置</span>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-[500px] md:max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 pb-6 flex flex-col relative z-20">
        <div className="space-y-4">
          {/* Avatar Section */}
          <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)] flex flex-col items-center">
            <h2 className="text-[16px] font-bold text-[#1f2933] w-full mb-4">
              头像
            </h2>
            <div className="relative mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover shadow-inner"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-inner">
                  {userProfile.nickname?.charAt(0).toUpperCase()}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#2f9e6d] hover:bg-[#267a56] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors"
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-[#5a6b73]">支持 JPG, PNG，最大 5MB</p>
          </section>

          {/* Location Map Card (Sellers Only) */}
          {userProfile.isVerifiedSeller && (
            <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="text-[16px] font-bold text-[#1f2933] mb-4">
                默认发货/面交地址
              </h2>
              <div className="space-y-4">
                <LocationPicker value={addressData} onChange={setAddressData} />
              </div>
            </section>
          )}

          {/* Account Details */}
          <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
            <h2 className="text-[16px] font-bold text-[#1f2933] mb-4">
              基本信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                  昵称
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="您的昵称"
                  className="w-full bg-[#f7f9fc] border border-transparent rounded-[16px] px-4 py-3 text-[15px] outline-none focus:bg-white focus:border-[#2f9e6d] transition-all text-[#1f2933]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                  绑定邮箱
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-[#f7f9fc] border border-transparent rounded-[16px] px-4 py-3 text-[15px] outline-none opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email Notifications Toggle */}
            <div className="pt-4 mt-2 border-t border-[rgba(31,41,51,0.04)]">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="pr-4">
                  <span className="block text-[14px] font-bold text-[#1f2933] mb-0.5">
                    接收交易邮件通知
                  </span>
                  <span className="block text-[12px] text-[#5a6b73] leading-relaxed">
                    {emailNotifications
                      ? "当买家申请预订/购买时，发送邮件通知您"
                      : "已关闭交易邮件通知"}
                  </span>
                </div>
                <div className="relative shrink-0 flex items-center justify-center w-12 h-7 bg-gray-200 rounded-full group-hover:bg-gray-300 transition-colors duration-300">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring"></div>
                  <div className="absolute inset-0 rounded-full bg-[#2f9e6d] opacity-0 peer-checked:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring z-10"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Contact Details (Sellers Only) */}
          {userProfile.isVerifiedSeller && (
            <section className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="text-[16px] font-bold text-[#1f2933] mb-4">
                发布联系方式
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                    微信号
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] grayscale opacity-70">
                      💬
                    </span>
                    <input
                      type="text"
                      value={wechat}
                      onChange={(e) => setWechat(e.target.value)}
                      placeholder="微信号 (选填)"
                      className="w-full bg-[#f7f9fc] border border-transparent rounded-[16px] pl-11 pr-4 py-3 text-[15px] outline-none focus:bg-white focus:border-[#2f9e6d] transition-all text-[#1f2933]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#5a6b73] mb-1.5 ml-1">
                    手机号
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] grayscale opacity-70">
                      📱
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="手机号 (选填)"
                      className="w-full bg-[#f7f9fc] border border-transparent rounded-[16px] pl-11 pr-4 py-3 text-[15px] outline-none focus:bg-white focus:border-[#2f9e6d] transition-all text-[#1f2933]"
                    />
                  </div>
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
                      <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-sm peer-checked:translate-x-5 transition-transform duration-300 ease-spring z-10"></div>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-[500px] md:max-w-2xl w-full mx-auto px-4 sm:px-6 py-2 pb-12">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#1f2933] hover:bg-[#323d46] text-white font-bold text-[16px] py-4 rounded-[16px] shadow-[0_8px_20px_-8px_rgba(31,41,51,0.5)] transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
        >
          {isSaving ? "保存中..." : "保存修改"}
        </button>
      </div>
    </div>
  );
}
