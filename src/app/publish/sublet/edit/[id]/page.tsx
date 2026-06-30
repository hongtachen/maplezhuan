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
import LocationPicker, { LocationData } from "@/components/ui/LocationPicker";
import { SubletDocument } from "@/lib/firebase/firestore";

const KNOWN_ROOM_TYPE_IDS = new Set([
  "studio",
  "1b1b",
  "2b2b",
  "ensuite",
  "shared",
  "room",
  "other",
]);

export default function SubletEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const { showToast } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [spaceType, setSpaceType] = useState("");
  const [address, setAddress] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [unit, setUnit] = useState("");
  const [hideAddress, setHideAddress] = useState(false);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [customRoomType, setCustomRoomType] = useState("");
  const [leaseTerms, setLeaseTerms] = useState<string[]>([]);
  const [moveInDate, setMoveInDate] = useState("");
  const [images, setImages] = useState<(string | File)[]>([]);
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWechat, setContactWechat] = useState("");
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [furnished, setFurnished] = useState(false);

  useEffect(() => {
    const fetchSublet = async () => {
      try {
        const docRef = doc(db, "sublets", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as SubletDocument;
          if (user && data.sellerId !== user.uid) {
            showToast("您无权编辑此房源", "error");
            router.push("/profile/listings");
            return;
          }
          setTitle(data.title || "");
          setPropertyType(data.propertyType);
          setSpaceType(data.spaceType);
          let loadedLocation = data.locationData;
          if (!loadedLocation && data.address) {
            loadedLocation = {
              lat: 43.4723,
              lng: -80.5449,
              text: data.address,
              showExactLocation: false,
              city: "",
            };
          }
          setLocationData(loadedLocation || null);
          setAddress(data.address || "");
          setUnit(data.unit || "");
          setHideAddress(data.hideAddress || false);
          const savedRoomType = data.roomTypes?.[0];
          if (savedRoomType && !KNOWN_ROOM_TYPE_IDS.has(savedRoomType)) {
            setRoomTypes(["other"]);
            setCustomRoomType(savedRoomType);
          } else {
            setRoomTypes(data.roomTypes || []);
            setCustomRoomType("");
          }
          setLeaseTerms(data.leaseTerms || []);
          setMoveInDate(data.moveInDate || "");
          setImages(data.images || []);
          setPrice(data.price);
          setUtilitiesIncluded(data.utilitiesIncluded || false);
          setFurnished(data.furnished || false);
          setDescription(data.description || "");
          setContactPhone(data.contactPhone || "");
          setContactWechat(data.contactWechat || "");
        } else {
          showToast("房源不存在", "error");
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
      fetchSublet();
    }
  }, [id, user, showToast, router]);

  const handleSubmit = async () => {
    if (
      !title ||
      !propertyType ||
      !spaceType ||
      !address ||
      !locationData?.text
    ) {
      showToast("请填写标题、房源类型、租客空间和地址", "error");
      return;
    }
    if (!roomTypes.length || !leaseTerms.length || !moveInDate) {
      showToast("请填写房型、租期和入住时间", "error");
      return;
    }
    if (roomTypes.includes("other") && !customRoomType.trim()) {
      showToast("请填写自定义房型", "error");
      return;
    }
    if (!price || (!contactPhone && !contactWechat)) {
      showToast("请填写价格并提供至少一种联系方式", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedImageUrls: string[] = [];
      if (images && images.length > 0) {
        const files = images.filter((img): img is File => img instanceof File);
        const existingUrls = images.filter(
          (img): img is string => typeof img === "string",
        );

        let newUrls: string[] = [];
        if (files.length > 0) {
          newUrls = await uploadMultipleImages(files, `sublets/${user?.uid}`);
        }
        uploadedImageUrls = [...existingUrls, ...newUrls];
      }

      await updateDocument("sublets", id, {
        title,
        propertyType,
        spaceType,
        address,
        locationData,
        unit,
        hideAddress,
        roomTypes: roomTypes.includes("other")
          ? [customRoomType.trim()]
          : roomTypes,
        leaseTerms,
        moveInDate,
        images: uploadedImageUrls,
        price: Number(price),
        utilitiesIncluded,
        furnished,
        description,
        contactPhone,
        contactWechat,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3fbf7]">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#f3fbf7]">
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
            <h1 className="text-xl font-bold text-[#1f2933]">编辑房屋转租</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[600px] md:max-w-4xl lg:max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)] h-full">
              <h2 className="font-bold text-[#1f2933] mb-5">基本信息</h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    转租标题 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-3">
                    房源类型 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setPropertyType("house")}
                      className={`p-3 rounded-2xl border text-left transition-all ${propertyType === "house" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                    >
                      <svg
                        className={`w-6 h-6 mb-2 ${propertyType === "house" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
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
                      <h3 className="font-bold text-[#1f2933] mb-0.5 text-[14px]">
                        House
                      </h3>
                      <p className="text-[11px] text-[#5a6b73]">独栋或联排</p>
                    </button>
                    <button
                      onClick={() => setPropertyType("apartment")}
                      className={`p-3 rounded-2xl border text-left transition-all ${propertyType === "apartment" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                    >
                      <svg
                        className={`w-6 h-6 mb-2 ${propertyType === "apartment" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
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
                      <h3 className="font-bold text-[#1f2933] mb-0.5 text-[14px]">
                        Apartment
                      </h3>
                      <p className="text-[11px] text-[#5a6b73]">公寓或共管楼</p>
                    </button>
                  </div>

                  <label className="block text-sm font-bold text-[#1f2933] mb-3">
                    租客空间 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSpaceType("entire")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${spaceType === "entire" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                    >
                      <svg
                        className={`w-5 h-5 shrink-0 ${spaceType === "entire" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
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
                        <h3 className="font-bold text-[#1f2933] text-[14px]">
                          整套出租
                        </h3>
                        <p className="text-[11px] text-[#5a6b73]">
                          租客独享整套住所
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => setSpaceType("private")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${spaceType === "private" ? "border-[#2f9e6d] bg-white ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] bg-white hover:border-[#2f9e6d]"}`}
                    >
                      <svg
                        className={`w-5 h-5 shrink-0 ${spaceType === "private" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
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
                        <h3 className="font-bold text-[#1f2933] text-[14px]">
                          独立房间
                        </h3>
                        <p className="text-[11px] text-[#5a6b73]">
                          有独立房间，共用公共空间
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-3">
                    地址 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <div className="rounded-xl overflow-hidden border border-[rgba(31,41,51,0.12)] relative z-0">
                    <LocationPicker
                      value={locationData || undefined}
                      onChange={(data) => {
                        setLocationData(data);
                        setAddress(data.text);
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="单元号（可选）"
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="font-bold text-[#1f2933] mb-5">房型与租期</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    户型 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "studio", title: "Studio" },
                      { id: "1b1b", title: "一房一卫" },
                      { id: "2b2b", title: "两房两卫" },
                      { id: "ensuite", title: "Ensuite" },
                      { id: "shared", title: "合租" },
                      { id: "room", title: "单间" },
                      { id: "other", title: "其他" },
                    ].map((rt) => (
                      <button
                        key={rt.id}
                        onClick={() => {
                          if (rt.id === "other") {
                            setRoomTypes(["other"]);
                          } else {
                            setRoomTypes([rt.id]);
                            setCustomRoomType("");
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${roomTypes.includes(rt.id) ? "border-[#2f9e6d] bg-[#f3fbf7] text-[#2f9e6d]" : "border-[rgba(31,41,51,0.12)] text-[#5a6b73]"} transition-colors`}
                      >
                        {rt.title}
                      </button>
                    ))}
                  </div>
                  {roomTypes.includes("other") && (
                    <input
                      type="text"
                      value={customRoomType}
                      onChange={(e) => setCustomRoomType(e.target.value)}
                      placeholder="例如：主卧合租、地下室单间、客厅隔间"
                      className="w-full mt-3 px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none transition-all text-[15px]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    可租期限 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "1个月",
                      "4个月",
                      "8个月",
                      "12个月",
                      "1年以上",
                      "可商量",
                      "不限",
                    ].map((lt) => (
                      <button
                        key={lt}
                        onClick={() => setLeaseTerms([lt])}
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${leaseTerms.includes(lt) ? "border-[#2f9e6d] bg-[#f3fbf7] text-[#2f9e6d]" : "border-[rgba(31,41,51,0.12)] text-[#5a6b73]"} transition-colors`}
                      >
                        {lt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    入住时间 <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setMoveInDate("flexible")}
                      className={`p-4 rounded-xl border bg-white text-left transition-colors ${moveInDate === "flexible" ? "border-[#2f9e6d] ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] hover:border-[#2f9e6d]"}`}
                    >
                      <h3
                        className={`font-bold mb-1 ${moveInDate === "flexible" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                      >
                        时间灵活
                      </h3>
                      <p
                        className={`text-xs ${moveInDate === "flexible" ? "text-[#267a56]" : "text-[#5a6b73]"}`}
                      >
                        可与租客商量
                      </p>
                    </button>
                    <div
                      className={`p-4 rounded-xl border bg-white text-left transition-colors flex flex-col gap-3 ${moveInDate && moveInDate !== "flexible" ? "border-[#2f9e6d] ring-1 ring-[#2f9e6d]" : "border-[rgba(31,41,51,0.08)] hover:border-[#2f9e6d]"}`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() =>
                          setMoveInDate(
                            moveInDate && moveInDate !== "flexible"
                              ? moveInDate
                              : new Date().toISOString().split("T")[0],
                          )
                        }
                      >
                        <div>
                          <h3
                            className={`font-bold mb-1 ${moveInDate && moveInDate !== "flexible" ? "text-[#2f9e6d]" : "text-[#1f2933]"}`}
                          >
                            具体日期
                          </h3>
                          <p
                            className={`text-xs ${moveInDate && moveInDate !== "flexible" ? "text-[#267a56]" : "text-[#5a6b73]"}`}
                          >
                            选择具体的入住时间
                          </p>
                        </div>
                      </div>
                      {moveInDate && moveInDate !== "flexible" && (
                        <input
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none text-[15px] mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="font-bold text-[#1f2933] mb-5">价格</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1f2933] mb-2">
                    价格 (CAD/月) <span className="text-[#2f9e6d]">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[15px] font-bold text-[#1f2933]">
                    是否包水电网？
                  </span>
                  <div
                    className={`w-11 h-6 rounded-full relative cursor-pointer flex items-center px-0.5 transition-colors ${utilitiesIncluded ? "bg-[#2f9e6d]" : "bg-[rgba(31,41,51,0.12)]"}`}
                    onClick={() => setUtilitiesIncluded(!utilitiesIncluded)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${utilitiesIncluded ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 mb-2">
                  <span className="text-[15px] font-bold text-[#1f2933]">
                    是否带家具？
                  </span>
                  <div
                    className={`w-11 h-6 rounded-full relative cursor-pointer flex items-center px-0.5 transition-colors ${furnished ? "bg-[#2f9e6d]" : "bg-[rgba(31,41,51,0.12)]"}`}
                    onClick={() => setFurnished(!furnished)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${furnished ? "translate-x-5" : ""}`}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="font-bold text-[#1f2933] mb-2">联系方式</h2>
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
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="手机号码"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px]"
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
                    value={contactWechat}
                    onChange={(e) => setContactWechat(e.target.value)}
                    placeholder="微信号"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] focus:ring-1 focus:ring-[#2f9e6d] outline-none transition-all text-[15px]"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="font-bold text-[#1f2933] mb-2">补充说明</h2>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="周边环境、室友情况等..."
                className="w-full px-4 py-3 rounded-xl border border-[rgba(31,41,51,0.12)] focus:border-[#2f9e6d] outline-none transition-all text-[15px] resize-none"
              ></textarea>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-[rgba(31,41,51,0.04)]">
              <h2 className="font-bold text-[#1f2933] mb-4">房源图片</h2>
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
                propertyType &&
                spaceType &&
                address &&
                locationData?.text &&
                roomTypes.length &&
                (!roomTypes.includes("other") || customRoomType.trim()) &&
                leaseTerms.length &&
                moveInDate &&
                price &&
                (contactPhone || contactWechat),
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
    </div>
  );
}
