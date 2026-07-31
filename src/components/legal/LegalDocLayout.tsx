import Link from "next/link";
import Footer from "@/components/layout/Footer";
import LegalRichText from "@/components/legal/LegalRichText";
import type { LegalDoc, LegalNavItem } from "@/content/legal/types";

type LegalDocLayoutProps = {
  doc: LegalDoc;
  navItems?: LegalNavItem[];
  isIndex?: boolean;
};

export default function LegalDocLayout({
  doc,
  navItems,
  isIndex = false,
}: LegalDocLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#f3fbf7]">
      <header className="sticky top-0 z-40 bg-[rgba(243,251,247,0.8)] backdrop-blur-md border-b border-[rgba(31,41,51,0.05)]">
        <div className="flex items-center justify-between px-6 h-16 max-w-[996px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo/logo-hori.svg"
              alt="枫转 MapleZhuan"
              className="h-16"
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {!isIndex ? (
              <Link
                href="/legal"
                className="text-[#5a6b73] hover:text-[#2f9e6d] transition-colors"
              >
                法律信息
              </Link>
            ) : null}
            <Link
              href="/about"
              className="text-[#5a6b73] hover:text-[#2f9e6d] transition-colors"
            >
              枫转故事
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[996px] mx-auto px-6 py-10 md:py-14">
        {!isIndex ? (
          <p className="text-[13px] text-[#5a6b73] mb-3">
            <Link
              href="/legal"
              className="hover:text-[#2f9e6d] transition-colors"
            >
              法律信息
            </Link>
            <span className="mx-2 text-[rgba(31,41,51,0.25)]">/</span>
            <span className="text-[#1f2933]">{doc.title}</span>
          </p>
        ) : null}

        <h1 className="text-3xl md:text-4xl font-bold text-[#1f2933] tracking-tight mb-3">
          {doc.title}
        </h1>
        <p className="text-sm text-[#5a6b73] mb-8">
          最近更新日期：{doc.lastUpdated}
        </p>

        {doc.intro ? (
          <p className="text-[15px] text-[#5a6b73] leading-relaxed mb-10">
            <LegalRichText text={doc.intro} />
          </p>
        ) : null}

        {navItems && navItems.length > 0 ? (
          <ul className="space-y-3 mb-12">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-2xl border border-[rgba(31,41,51,0.06)] bg-white px-5 py-4 hover:border-[#2f9e6d]/40 hover:bg-[#f3fbf7] transition-colors"
                >
                  <span className="block font-medium text-[15px] text-[#1f2933] mb-0.5">
                    {item.title}
                  </span>
                  <span className="block text-[13px] text-[#5a6b73] leading-relaxed">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {doc.sections.length > 0 ? (
          <div className="space-y-10">
            {doc.sections.map((section, index) => (
              <section key={section.title} id={`section-${index + 1}`}>
                <h2 className="text-lg font-bold text-[#1f2933] mb-3">
                  {index + 1}. {section.title}
                </h2>
                <div className="space-y-3 text-[15px] text-[#5a6b73] leading-relaxed">
                  {section.paragraphs
                    .filter((p) => p.trim().length > 0)
                    .map((p, i) => (
                      <p key={`${section.title}-p-${i}`}>
                        <LegalRichText text={p} />
                      </p>
                    ))}
                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {section.bullets.map((b, i) => (
                        <li key={`${section.title}-b-${i}`}>
                          <LegalRichText text={b} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
