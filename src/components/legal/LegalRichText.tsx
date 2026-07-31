import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, SITE_URL } from "@/lib/constants";

const DOC_LINKS: { label: string; href: string }[] = [
  { label: "《服务条款》", href: "/legal/terms" },
  { label: "《隐私政策》", href: "/legal/privacy" },
  { label: "《社区与发布规范》", href: "/legal/community" },
  { label: "《Cookie 与本地存储》", href: "/legal/cookies" },
];

const linkClassName =
  "text-[#2f9e6d] underline underline-offset-2 hover:text-[#1f7a55] transition-colors";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TOKEN_PATTERN = new RegExp(
  `(${[
    ...DOC_LINKS.map((d) => escapeRegExp(d.label)),
    escapeRegExp(LEGAL_CONTACT_EMAIL),
    escapeRegExp(SITE_URL),
  ].join("|")})`,
  "g",
);

const HREF_BY_LABEL = new Map([
  ...DOC_LINKS.map((d) => [d.label, d.href] as const),
  [LEGAL_CONTACT_EMAIL, `mailto:${LEGAL_CONTACT_EMAIL}`] as const,
  [SITE_URL, SITE_URL] as const,
]);

export default function LegalRichText({ text }: { text: string }) {
  const parts = text.split(TOKEN_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        const href = HREF_BY_LABEL.get(part);
        if (!href)
          return <span key={`${index}-${part.slice(0, 12)}`}>{part}</span>;

        if (href.startsWith("mailto:") || href.startsWith("http")) {
          return (
            <a
              key={`${index}-${part}`}
              href={href}
              className={linkClassName}
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {part}
            </a>
          );
        }

        return (
          <Link key={`${index}-${part}`} href={href} className={linkClassName}>
            {part}
          </Link>
        );
      })}
    </>
  );
}
