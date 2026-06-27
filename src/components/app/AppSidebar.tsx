"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { SPRING } from "@/lib/motion/tokens";

const navItems = [
  {
    href: "/",
    label: "浏览",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
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
        className={`w-5 h-5 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
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
        className="w-5 h-5 text-white"
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
        className={`w-5 h-5 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
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
        className={`w-5 h-5 ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
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

export default function AppSidebar() {
  const pathname = usePathname();
  const unreadCount = useUnreadMessages();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-16 flex-col items-center bg-white border-r border-[rgba(31,41,51,0.08)] py-4 gap-1">
      {/* Logo */}
      <Link
        href="/"
        className="w-14 h-14 flex items-center justify-center mt-2 mb-6 shrink-0 rounded-2xl transition-all duration-200 hover:bg-[#f3fbf7] hover:scale-[1.05] active:scale-95"
      >
        <img
          src="/logo/logo.svg"
          alt="logo"
          className="w-full h-full object-contain"
        />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.isPublish) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="w-10 h-10 rounded-full bg-[#2f9e6d] flex items-center justify-center my-1 shadow-[0_4px_12px_rgba(47,158,109,0.4)] hover:bg-[#267a56] transition-colors"
              >
                {item.icon(active)}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-full flex flex-col items-center gap-0.5 py-2.5 rounded-xl mx-1 transition-colors ${
                active
                  ? "bg-[#f3fbf7] text-[#2f9e6d]"
                  : "text-[#5a6b73] hover:bg-[rgba(47,158,109,0.06)]"
              }`}
            >
              <div className="relative">
                {item.icon(active)}
                {item.href === "/messages" && unreadCount > 0 && (
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
                className={`text-[9px] font-medium ${active ? "text-[#2f9e6d]" : "text-[#5a6b73]"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
