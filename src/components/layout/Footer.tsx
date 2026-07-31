import Link from "next/link";

/* Footer — copyright line matching Figma design */
export default function Footer() {
  return (
    <footer className="border-t border-[rgba(31,41,51,0.05)]">
      <div className="max-w-[996px] mx-auto px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[#5a6b73] text-sm">
          © 2026 枫转 MapleZhuan ·<br className="md:hidden" />{" "}
          加拿大华人本地闲置和房子转租市场
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5a6b73]">
          <Link
            href="/legal"
            className="hover:text-[#2f9e6d] transition-colors"
          >
            法律信息
          </Link>
          <Link
            href="/legal/privacy"
            className="hover:text-[#2f9e6d] transition-colors"
          >
            隐私政策
          </Link>
          <Link
            href="/legal/terms"
            className="hover:text-[#2f9e6d] transition-colors"
          >
            服务条款
          </Link>
        </nav>
      </div>
    </footer>
  );
}
