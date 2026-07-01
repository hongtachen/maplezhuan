"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePublishStore } from "@/store/usePublishStore";
import ImageUpload from "@/components/ui/ImageUpload";
import { uploadMultipleImages } from "@/lib/firebase/storage";
import { addItem } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import LocationPicker, { LocationData } from "@/components/ui/LocationPicker";
import PublishSuccessOverlay from "@/components/motion/PublishSuccessOverlay";
import UploadProgressOverlay from "@/components/ui/UploadProgressOverlay";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function isPriceFilled(price: number | "" | undefined): boolean {
  return (
    price !== "" &&
    price !== undefined &&
    !Number.isNaN(Number(price)) &&
    Number(price) >= 0
  );
}

function formatPriceInputValue(price: number | "" | undefined): string {
  return price === "" || price === undefined ? "" : String(price);
}

export default function ItemPublishPage() {
  const router = useRouter();
  const { itemData, setItemData, clearItemData } = usePublishStore();
  const { user } = useAuthStore();
  const { showToast } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("正在上传照片...");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFreeConfirm, setShowFreeConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [locationMode, setLocationMode] = useState<"default" | "custom">(
    "default",
  );
  const [customLocation, setCustomLocation] = useState<LocationData | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        setUserProfile(profile);
        if (!profile?.defaultAddress) {
          setLocationMode("custom"); // Force custom if no default address exists
        }
      });
    }
  }, [user]);

  const handlePublishSuccessBrowse = useCallback(() => {
    setShowSuccess(false);
    router.replace("/");
  }, [router]);

  const handlePublishSuccessListings = useCallback(() => {
    setShowSuccess(false);
    router.replace("/profile/listings");
  }, [router]);

  const handleSubmit = async () => {
    let finalLocationData = null;
    if (locationMode === "default" && userProfile?.defaultAddress) {
      finalLocationData = userProfile.defaultAddress;
    } else if (locationMode === "custom" && customLocation) {
      finalLocationData = customLocation;
    }

    if (
      !itemData.title ||
      !isPriceFilled(itemData.price) ||
      !itemData.category ||
      !finalLocationData?.text ||
      !itemData.images ||
      itemData.images.length < 2
    ) {
      showToast("请填写所有必填信息并上传至少2张照片", "error");
      return;
    }

    if (!user) {
      showToast("请先登录", "error");
      return;
    }

    if (Number(itemData.price) === 0) {
      setShowFreeConfirm(true);
      return;
    }

    if (!finalLocationData) return;
    await publishItem(finalLocationData);
  };

  const publishItem = async (finalLocationData: LocationData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      setUploadMessage("正在上传照片...");

      // Upload images
      let uploadedImageUrls: string[] = [];
      if (itemData.images && itemData.images.length > 0) {
        // Find files vs existing URLs
        const files = itemData.images.filter(
          (img): img is File => img instanceof File,
        );
        const existingUrls = itemData.images.filter(
          (img): img is string => typeof img === "string",
        );

        const newUrls = await uploadMultipleImages(files, `items/${user.uid}`);
        uploadedImageUrls = [...existingUrls, ...newUrls];
      }

      setUploadMessage("正在保存商品信息...");

      // Save to firestore
      await addItem({
        title: itemData.title,
        price: itemData.price as number,
        description: itemData.description,
        category: itemData.category,
        condition: itemData.condition,
        location: finalLocationData.text,
        city: finalLocationData.city || "",
        locationData: finalLocationData,
        images: uploadedImageUrls,
        sellerId: user.uid,
        status: "在售",
        views: 0,
        favorites: 0,
        inquiries: 0,
      });

      clearItemData();
      setShowSuccess(true);
    } catch (error) {
      console.error("Publish failed:", error);
      showToast("发布失败，请重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmFreePublish = async () => {
    let finalLocationData = null;
    if (locationMode === "default" && userProfile?.defaultAddress) {
      finalLocationData = userProfile.defaultAddress;
    } else if (locationMode === "custom" && customLocation) {
      finalLocationData = customLocation;
    }
    if (!finalLocationData?.text) {
      showToast("请填写所有必填信息并上传至少2张照片", "error");
      return;
    }
    setShowFreeConfirm(false);
    await publishItem(finalLocationData);
  };

  const categories = [
    { id: "furniture", label: "家具", icon: "🪑" },
    { id: "electronics", label: "电子商品", icon: "💻" },
    { id: "kitchen", label: "厨具", icon: "🍳" },
    { id: "study", label: "学习办公", icon: "📚" },
    { id: "living", label: "生活用品", icon: "🧴" },
    { id: "baby", label: "婴儿用品", icon: "🍼" },
    { id: "clothes", label: "服饰鞋包", icon: "👟" },
    { id: "sports", label: "运动商品", icon: "⚽" },
    { id: "other", label: "其他", icon: "📦" },
  ];

  const conditions = ["全新", "九成新", "八成新", "七成新", "六成新", "其他"];

  return (
    <div className="flex flex-col min-h-dvh bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 py-4">
        <div className="max-w-[600px] mx-auto flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-[#f3fbf7] text-[#5a6b73] transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-[#1f2933]">发布闲置</h1>
            <p className="text-xs text-[#5a6b73]">填写完整信息，即可上架</p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            {/* Section 1 */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)] h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="font-bold text-[#1f2933]">基本信息</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    标题 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemData.title}
                    onChange={(e) => setItemData({ title: e.target.value })}
                    placeholder="例：宜家 MICKE 书桌 白色 142cm 自取"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px] placeholder:text-[#a0aeb5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    价格 (CAD) <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formatPriceInputValue(itemData.price)}
                    onChange={(e) =>
                      setItemData({
                        price:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px] placeholder:text-[#a0aeb5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-3">
                    取货地址 <span className="text-[#2f9e6d]">*</span>
                  </label>

                  {/* Option toggle */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setLocationMode("default")}
                      disabled={!userProfile?.defaultAddress}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        locationMode === "default"
                          ? "border-[#2f9e6d] bg-[#f3fbf7] text-[#2f9e6d]"
                          : "border-[rgba(31,41,51,0.12)] text-[#5a6b73] hover:border-[#2f9e6d]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      使用预设地址
                    </button>
                    <button
                      onClick={() => setLocationMode("custom")}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        locationMode === "custom"
                          ? "border-[#2f9e6d] bg-[#f3fbf7] text-[#2f9e6d]"
                          : "border-[rgba(31,41,51,0.12)] text-[#5a6b73] hover:border-[#2f9e6d]"
                      }`}
                    >
                      选择新地址
                    </button>
                  </div>

                  {locationMode === "default" && userProfile?.defaultAddress ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-[rgba(31,41,51,0.08)] flex items-start gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="text-[14px] font-bold text-[#1f2933]">
                          {userProfile.defaultAddress.text}
                        </p>
                        <p className="text-[11px] text-[#5a6b73] mt-1">
                          这是您在“个人资料”中设置的默认发货地址。
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-[rgba(31,41,51,0.12)] relative z-0">
                      <LocationPicker
                        value={customLocation || undefined}
                        onChange={(data) => setCustomLocation(data)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            {/* Section 2 */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="font-bold text-[#1f2933]">分类与状态</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1f2933] mb-3">
                  分类 <span className="text-[#2f9e6d]">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setItemData({ category: c.id })}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border ${itemData.category === c.id ? "border-[#2f9e6d] bg-[#f3fbf7]" : "border-[rgba(31,41,51,0.12)] hover:border-[#2f9e6d]"} transition-all`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <span
                        className={`text-[10px] ${itemData.category === c.id ? "font-bold text-[#2f9e6d]" : "text-[#5a6b73]"}`}
                      >
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1f2933] mb-3">
                  状态
                </label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setItemData({ condition: c })}
                      className={`px-4 py-2 rounded-full text-sm font-medium border ${itemData.condition === c ? "border-[#2f9e6d] bg-[#2f9e6d] text-white" : "border-[rgba(31,41,51,0.12)] text-[#1f2933] hover:border-[#2f9e6d]"} transition-colors`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h2 className="font-bold text-[#1f2933]">商品描述</h2>
              </div>
              <p className="text-xs text-[#5a6b73] mb-4 pl-8">
                填写上面没有涵盖的细节
              </p>

              <textarea
                rows={4}
                value={itemData.description}
                onChange={(e) => setItemData({ description: e.target.value })}
                placeholder="例：LG 27寸 4K 显示器。型号 27UL550，IPS 屏无坏点，背面有轻微划痕（见图2）。"
                className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px] placeholder:text-[#a0aeb5] resize-none"
              ></textarea>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="font-bold text-[#1f2933] mb-1">
                商品图片 <span className="text-[#2f9e6d]">*</span>
              </h2>
              <p className="text-xs text-[#5a6b73] mb-4">
                请至少上传 2 张照片，全方位展示商品
              </p>
              <ImageUpload
                images={itemData.images}
                onImagesChange={(images) => setItemData({ images })}
                disabled={isSubmitting}
              />
            </section>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#f3fbf7]/90 backdrop-blur-md pb-safe">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[#f3fbf7] to-transparent opacity-80 pointer-events-none" />
        <div className="max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-4 pb-8 flex items-center justify-center md:justify-end">
          <div className="w-full md:w-[300px]">
            {(() => {
              const isComplete = Boolean(
                itemData.title &&
                isPriceFilled(itemData.price) &&
                itemData.category &&
                itemData.images &&
                itemData.images.length >= 2 &&
                (locationMode === "default"
                  ? userProfile?.defaultAddress
                  : customLocation),
              );
              return (
                <button
                  onClick={handleSubmit}
                  disabled={!isComplete || isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-sm mb-2 ${
                    isComplete
                      ? "bg-[#2f9e6d] hover:bg-[#267a56] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "发布中..." : "提交发布"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
      <UploadProgressOverlay
        open={isSubmitting}
        title={uploadMessage}
        description="上传完成前请勿关闭页面"
      />
      <PublishSuccessOverlay
        open={showSuccess}
        message="闲置发布成功！"
        actions={[
          {
            label: "去浏览看看",
            onClick: handlePublishSuccessBrowse,
            variant: "primary",
          },
          {
            label: "查看发布记录",
            onClick: handlePublishSuccessListings,
            variant: "secondary",
          },
        ]}
      />
      <ConfirmDialog
        open={showFreeConfirm}
        onClose={() => setShowFreeConfirm(false)}
        onConfirm={handleConfirmFreePublish}
        title="确认免费赠送？"
        description="价格为 $0 表示免费赠送，确定继续发布吗？"
        confirmLabel="确认发布"
        loading={isSubmitting}
      />
    </div>
  );
}
