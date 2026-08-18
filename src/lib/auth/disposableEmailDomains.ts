/**
 * Client-side rejection only — bypassable; pair with email verification + rules.
 * Blocklist: disposable-email-domains (sync via `npm run sync:disposable-emails`).
 */
import disposableDomains from "./data/disposable_email_blocklist.json";

const DISPOSABLE_DOMAINS = new Set(
  (disposableDomains as string[]).map((d) => d.toLowerCase()),
);

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export type EmailRejectReason = "disposable" | "plus_alias" | null;

export function getEmailLocalAndDomain(
  email: string,
): { local: string; domain: string } | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return {
    local: trimmed.slice(0, at),
    domain: trimmed.slice(at + 1),
  };
}

function domainOrParentIsDisposable(domain: string): boolean {
  const parts = domain.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(i).join("."))) return true;
  }
  return false;
}

export function isDisposableEmail(email: string): boolean {
  const parts = getEmailLocalAndDomain(email);
  if (!parts) return false;
  return domainOrParentIsDisposable(parts.domain);
}

/** Gmail/Googlemail plus-addressing (user+tag@gmail.com) used for multi-account abuse. */
export function hasGmailPlusAlias(email: string): boolean {
  const parts = getEmailLocalAndDomain(email);
  if (!parts) return false;
  if (!GMAIL_DOMAINS.has(parts.domain)) return false;
  return parts.local.includes("+");
}

export function getEmailRejectReason(email: string): EmailRejectReason {
  if (isDisposableEmail(email)) return "disposable";
  if (hasGmailPlusAlias(email)) return "plus_alias";
  return null;
}

export function getEmailRejectMessage(reason: EmailRejectReason): string {
  if (reason === "disposable") {
    return "不支持临时邮箱，请使用常用邮箱注册";
  }
  if (reason === "plus_alias") {
    return "请使用不含 + 号的 Gmail 地址注册";
  }
  return "该邮箱不可用，请更换后重试";
}

export class EmailRejectedError extends Error {
  code: "auth/disposable-email" | "auth/plus-alias-email";

  constructor(reason: Exclude<EmailRejectReason, null>) {
    super(getEmailRejectMessage(reason));
    this.name = "EmailRejectedError";
    this.code =
      reason === "disposable"
        ? "auth/disposable-email"
        : "auth/plus-alias-email";
  }
}

export function assertEmailAllowed(email: string): void {
  const reason = getEmailRejectReason(email);
  if (reason) throw new EmailRejectedError(reason);
}
