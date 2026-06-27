"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { EASE, SHEET_TRANSITION, SPRING } from "@/lib/motion/tokens";

const tabs = [
  {
    href: "/",
    label: "浏览",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      >
        <circle cx="11" cy="11" r="8" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35"
        />
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "消息",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    href: "/publish",
    label: "发布",
    isPublish: true,
    icon: (_active: boolean) => (
      <svg
        className="w-6 h-6 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "收藏",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "我的",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const unreadCount = useUnreadMessages();

  if (pathname === "/about") {
    return null;
  }

  const handlePublishClick = () => {
    router.push("/publish");
  };

  return (
    <motion.nav
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ ...SHEET_TRANSITION, ease: EASE.out }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[rgba(31,41,51,0.08)] md:hidden"
    >
      {/* Safe area padding for iPhone home indicator */}
      <div className="flex items-stretch pb-safe">
        {tabs.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          if (tab.isPublish) {
            return (
              <button
                key={tab.href}
                onClick={handlePublishClick}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              >
                {/* Elevated green circle */}
                <div className="w-12 h-12 -mt-5 rounded-full bg-[#2f9e6d] flex items-center justify-center shadow-[0_4px_16px_rgba(47,158,109,0.45)]">
                  {tab.icon(active)}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
            >
              <div className="relative">
                {tab.icon(active)}
                {tab.href === "/messages" && unreadCount > 0 && (
                  <motion.span
                    key={unreadCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={SPRING.snappy}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
