"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Link2, Share2 } from "lucide-react";
import BottomSheet from "@/components/motion/BottomSheet";
import { useApp } from "@/components/app/AppContext";
import {
  buildShareCaption,
  buildShareText,
  canNativeShare,
  copyText,
  nativeShare,
} from "@/lib/share/listingShare";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  price: number;
  url: string;
};

function useClientFlag() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function ActionRow({
  label,
  sublabel,
  icon,
  onClick,
}: {
  label: string;
  sublabel: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-1 py-3 rounded-xl hover:bg-[#f3fbf7] transition-colors text-left"
    >
      <span className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 text-[#1f2933]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-[#1f2933]">
          {label}
        </span>
        <span className="block text-[12px] text-[#5a6b73] mt-0.5">
          {sublabel}
        </span>
      </span>
    </button>
  );
}

function BrandIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={20} height={20} className="w-5 h-5" />;
}

export default function ListingShareSheet({
  open,
  onClose,
  title,
  price,
  url,
}: Props) {
  const { showToast } = useApp();
  const mounted = useClientFlag();
  const showSystemShare = mounted && canNativeShare();
  const caption = buildShareCaption({ title, price });
  const xhsText = buildShareText({ title, price, url });

  const copy = async (text: string, ok: string, fail: string) => {
    try {
      await copyText(text);
      showToast(ok, "success");
      onClose();
    } catch {
      showToast(fail, "error");
    }
  };

  const handleSystemShare = async () => {
    try {
      const result = await nativeShare({ text: caption, url });
      if (result === "shared") onClose();
      if (result === "unsupported") {
        await copy(url, "链接已复制", "复制失败，请手动复制链接");
      }
    } catch {
      showToast("分享失败", "error");
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      titleId="listing-share-title"
      panelClassName="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <h2
        id="listing-share-title"
        className="text-[17px] font-bold text-[#1f2933] mb-1"
      >
        分享
      </h2>
      <p className="text-[13px] text-[#5a6b73] mb-3 line-clamp-1">{title}</p>
      <div className="divide-y divide-[rgba(31,41,51,0.06)]">
        {showSystemShare && (
          <ActionRow
            label="系统分享"
            sublabel="微信、信息等"
            icon={<Share2 className="w-5 h-5" strokeWidth={2} />}
            onClick={handleSystemShare}
          />
        )}
        <ActionRow
          label="小红书"
          sublabel="复制文案后打开小红书粘贴"
          icon={<BrandIcon src="/xiaohongshu.svg" />}
          onClick={() =>
            copy(
              xhsText,
              "文案已复制，打开小红书粘贴",
              "复制失败，请手动复制文案",
            )
          }
        />
        <ActionRow
          label="复制链接"
          sublabel="复制后可粘贴到任意地方"
          icon={<Link2 className="w-5 h-5" strokeWidth={2} />}
          onClick={() => copy(url, "链接已复制", "复制失败，请手动复制链接")}
        />
        {!showSystemShare && (
          <ActionRow
            label="微信"
            sublabel="复制链接，到微信粘贴发送"
            icon={<BrandIcon src="/wechat.svg" />}
            onClick={() =>
              copy(
                url,
                "链接已复制，打开微信粘贴发送",
                "复制失败，请手动复制链接",
              )
            }
          />
        )}
      </div>
    </BottomSheet>
  );
}
