"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LayoutGrid, Users, Shield } from "lucide-react";

const NAV = [
  { href: "/admin/listings", label: "商品管理", icon: LayoutGrid },
  { href: "/admin/users", label: "用户管理", icon: Users },
] as const;

export default function AdminShell({
  children,
  adminEmail,
}: {
  children: ReactNode;
  adminEmail?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#f4f7f5] text-[#1f2933] flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-[rgba(31,41,51,0.08)] bg-white">
        <div className="px-5 py-5 border-b border-[rgba(31,41,51,0.06)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2f9e6d] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold tracking-tight">枫转 Admin</p>
              <p className="text-[11px] text-[#5a6b73] truncate max-w-35">
                {adminEmail || "管理员"}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-[#f3fbf7] text-[#2f9e6d]"
                    : "text-[#5a6b73] hover:bg-[#f7f9fc] hover:text-[#1f2933]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[rgba(31,41,51,0.06)]">
          <Link
            href="/"
            className="text-[12px] text-[#5a6b73] hover:text-[#2f9e6d] transition-colors"
          >
            ← 返回前台
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-[rgba(31,41,51,0.08)] px-4 py-3 flex items-center justify-between">
          <p className="font-bold text-[15px]">枫转 Admin</p>
          <div className="flex gap-2">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-[12px] font-medium px-2.5 py-1.5 rounded-lg ${
                  pathname.startsWith(href)
                    ? "bg-[#f3fbf7] text-[#2f9e6d]"
                    : "text-[#5a6b73] bg-[#f7f9fc]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
