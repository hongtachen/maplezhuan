"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import { uploadMultipleImages } from "@/lib/firebase/storage";
import { updateDocument } from "@/lib/firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/useAuthStore";
import { useApp } from "@/components/app/AppContext";
import { getUserProfile, UserProfile } from "@/lib/firebase/users";
import LocationPicker, { LocationData } from "@/components/ui/LocationPicker";
import { ItemDocument } from "@/lib/firebase/firestore";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function isPriceFilled(price: number | "" | undefined): boolean {
  return (
    price !== "" &&
    price !== undefined &&
    !Number.isNaN(Number(price)) &&
    Number(price) >= 0
  );
}

export default function ItemEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { showToast } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFreeConfirm, setShowFreeConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<(string | File)[]>([]);

  const [locationMode, setLocationMode] = useState<"default" | "custom">(
    "custom",
  );
  const [customLocation, setCustomLocation] = useState<LocationData | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        setUserProfile(profile);
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as ItemDocument;
          // Check ownership
          if (user && data.sellerId !== user.uid) {
            showToast("您无权编辑此商品", "error");
            router.push("/profile/listings");
            return;
          }
          setTitle(data.title);
          setPrice(data.price);
          setCategory(data.category);
          setCondition(data.condition);
          setDescription(data.description);
          setImages(data.images || []);
          if (data.locationData) {
            setCustomLocation(data.locationData);
            setLocationMode("custom");
          }
        } else {
          showToast("商品不存在", "error");
          router.back();
        }
      } catch (e) {
        console.error(e);
        showToast("加载失败", "error");
      } finally {
        setIsLoading(false);
      }
    };
    if (user && id) {
      fetchItem();
    }
  }, [id, user, showToast, router]);

  const handleSubmit = async () => {
    let finalLocationData = null;
    if (locationMode === "default" && userProfile?.defaultAddress) {
      finalLocationData = userProfile.defaultAddress;
    } else if (locationMode === "custom" && customLocation) {
      finalLocationData = customLocation;
    }

    if (
      !title ||
      !isPriceFilled(price) ||
      !category ||
      !finalLocationData?.text
    ) {
      showToast("除了商品描述外，请填写所有必填信息", "error");
      return;
    }

    if (!user) {
      showToast("请先登录", "error");
      return;
    }

    if (Number(price) === 0) {
      setShowFreeConfirm(true);
      return;
    }

    await saveItem(finalLocationData);
  };

  const saveItem = async (finalLocationData: LocationData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Upload images
      let uploadedImageUrls: string[] = [];
      if (images && images.length > 0) {
        const files = images.filter((img): img is File => img instanceof File);
        const existingUrls = images.filter(
          (img): img is string => typeof img === "string",
        );

        let newUrls: string[] = [];
        if (files.length > 0) {
          newUrls = await uploadMultipleImages(files, `items/${user.uid}`);
        }
        uploadedImageUrls = [...existingUrls, ...newUrls];
      }

      await updateDocument("items", id, {
        title,
        price: Number(price),
        description,
        category,
        condition,
        location: finalLocationData.text,
        locationData: finalLocationData,
        images: uploadedImageUrls,
      });

      showToast("保存成功！", "success");
      router.push("/profile/listings");
    } catch (error) {
      console.error("Edit failed:", error);
      showToast("保存失败，请重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmFreeSave = async () => {
    let finalLocationData = null;
    if (locationMode === "default" && userProfile?.defaultAddress) {
      finalLocationData = userProfile.defaultAddress;
    } else if (locationMode === "custom" && customLocation) {
      finalLocationData = customLocation;
    }
    if (!finalLocationData) return;
    setShowFreeConfirm(false);
    await saveItem(finalLocationData);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3fbf7]">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#f3fbf7]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 py-4">
        <div className="max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto flex items-center">
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
            <h1 className="text-xl font-bold text-[#1f2933]">编辑二手商品</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例：宜家 MICKE 书桌 白色 142cm 自取"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    价格 (CAD) <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-3">
                    取货地址 <span className="text-[#2f9e6d]">*</span>
                  </label>
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
                      使用此地址
                    </button>
                  </div>

                  {locationMode === "default" && userProfile?.defaultAddress ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-[rgba(31,41,51,0.08)] flex items-start gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="text-[14px] font-bold text-[#1f2933]">
                          {userProfile.defaultAddress.text}
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
                      onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border ${category === c.id ? "border-[#2f9e6d] bg-[#f3fbf7]" : "border-[rgba(31,41,51,0.12)] hover:border-[#2f9e6d]"} transition-all`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <span
                        className={`text-[10px] ${category === c.id ? "font-bold text-[#2f9e6d]" : "text-[#5a6b73]"}`}
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
                      onClick={() => setCondition(c)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border ${condition === c ? "border-[#2f9e6d] bg-[#2f9e6d] text-white" : "border-[rgba(31,41,51,0.12)] text-[#1f2933] hover:border-[#2f9e6d]"} transition-colors`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#e6f4ed] text-[#2f9e6d] flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h2 className="font-bold text-[#1f2933]">商品描述</h2>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述商品状态、成色等..."
                className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px] resize-none"
              ></textarea>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="font-bold text-[#1f2933]">商品图片</h2>
              </div>
              <span className="block text-[11px] text-[#5a6b73] mb-5">
                至少得上传2张图片
              </span>
              <ImageUpload images={images} onImagesChange={setImages} />
            </section>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-50 bg-[#f3fbf7]/90 backdrop-blur-md pb-safe">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[#f3fbf7] to-transparent opacity-80 pointer-events-none" />
        <div className="max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-4 pb-8 flex items-center justify-center md:justify-end">
          <div className="w-full md:w-[300px]">
            {(() => {
              const isComplete = Boolean(
                title &&
                isPriceFilled(price) &&
                category &&
                images.length >= 2 &&
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
                  {isSubmitting ? "保存中..." : "保存修改"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showFreeConfirm}
        onClose={() => setShowFreeConfirm(false)}
        onConfirm={handleConfirmFreeSave}
        title="确认免费赠送？"
        description="价格为 $0 表示免费赠送，确定继续保存吗？"
        confirmLabel="确认保存"
        loading={isSubmitting}
      />
    </div>
  );
}
