"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

/* Desktop nav links — also used in mobile drawer */
const NAV_LINKS = [
  { label: "支持区域", href: "#cities" },
  { label: "特色功能", href: "#features" },
  { label: "使用流程", href: "#how-it-works" },
  { label: "信任机制", href: "#trust" },
];

interface HeaderProps {
  onOpenFounder: () => void;
}

export default function Header({ onOpenFounder }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Sticky header bar */}
      <header className="sticky top-0 z-40 bg-[rgba(243,251,247,0.8)] backdrop-blur-md border-b border-[rgba(31,41,51,0.05)]">
        <div className="flex items-center justify-between px-6 h-16 max-w-[996px] mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo/logo-hori.svg" alt="Logo" className="h-16" />
          </Link>

          {/* Desktop: center nav + right CTA */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#1f2933] text-sm hover:text-[#2f9e6d] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* CTA button — visible on all sizes */}
            <button
              onClick={onOpenFounder}
              className="bg-[#2f9e6d] text-white text-sm font-medium px-4 py-2 rounded-lg
                         transition-all duration-200
                         hover:bg-[#1f7a55] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(47,158,109,0.4)]
                         active:translate-y-0 active:shadow-none active:scale-[0.97]
                         cursor-pointer"
            >
              成为卖家
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-1.5 rounded-lg text-[#1f2933] hover:bg-[#e3f1ea] transition-colors cursor-pointer"
              onClick={() => setDrawerOpen(true)}
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile slide-in drawer from right */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[75vw] max-w-[320px] bg-[#f3fbf7] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(31,41,51,0.05)]">
          <span className="text-[#1f2933] font-medium">菜单</span>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-[#5a6b73] hover:bg-[#e3f1ea] transition-colors cursor-pointer"
            aria-label="关闭菜单"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col px-6 py-6 gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeDrawer}
              className="text-[#1f2933] text-base py-3 border-b border-[rgba(31,41,51,0.05)] hover:text-[#2f9e6d] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Drawer CTA button */}
        <div className="px-6 pb-10">
          <button
            onClick={() => {
              closeDrawer();
              onOpenFounder();
            }}
            className="w-full bg-[#2f9e6d] text-white text-sm font-medium py-3 rounded-lg
                       transition-all duration-200
                       hover:bg-[#1f7a55] hover:shadow-[0_4px_14px_rgba(47,158,109,0.4)]
                       active:scale-[0.97] active:shadow-none
                       cursor-pointer"
          >
            申请成为创始卖家
          </button>
        </div>
      </div>
    </>
  );
}
