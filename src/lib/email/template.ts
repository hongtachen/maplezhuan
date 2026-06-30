import {
  EMAIL_IG_ICON_URL,
  EMAIL_LOGO_URL,
  EMAIL_SETTINGS_URL,
  EMAIL_XHS_ICON_URL,
  SITE_URL,
  SOCIAL_IG_URL,
  SOCIAL_XHS_URL,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import { escapeHtml } from "./escape";
import { EMAIL_GLOBAL_CONTENT } from "./scenario-content";
import type { EmailGlobalContent } from "./types";

export type EmailCta = {
  label: string;
  href: string;
};

export type BuildEmailHtmlOptions = {
  greeting: string;
  paragraphs: string[];
  cta?: EmailCta;
  /** Defaults to EMAIL_GLOBAL_CONTENT.footer; pass from getEmailContentConfig() for CMS overrides */
  footer?: EmailGlobalContent["footer"];
};

const BRAND_PRIMARY = "#2f9e6d";
const TEXT_COLOR = "#1f2933";

function socialIconLink(href: string, iconUrl: string, alt: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-left:8px;text-decoration:none;">
    <table cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;">
      <tr>
        <td align="center" style="padding:6px;line-height:0;">
          <img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(alt)}" width="20" height="20" style="display:block;border:0;outline:none;" />
        </td>
      </tr>
    </table>
  </a>`;
}

function buildSocialIcons(): string {
  const icons: string[] = [];

  if (SOCIAL_XHS_URL) {
    icons.push(socialIconLink(SOCIAL_XHS_URL, EMAIL_XHS_ICON_URL, "小红书"));
  }

  if (SOCIAL_IG_URL) {
    icons.push(socialIconLink(SOCIAL_IG_URL, EMAIL_IG_ICON_URL, "Instagram"));
  }

  if (icons.length === 0) return "";

  return `<td align="right" valign="bottom" style="padding:0;white-space:nowrap;">${icons.join("")}</td>`;
}

export function buildEmailHtml(options: BuildEmailHtmlOptions): string {
  const { greeting, paragraphs, cta } = options;
  const year = new Date().getFullYear();
  const socialCell = buildSocialIcons();
  const settingsUrl = escapeHtml(EMAIL_SETTINGS_URL);
  const supportEmail = escapeHtml(SUPPORT_EMAIL);
  const siteUrl = escapeHtml(SITE_URL);
  const footer = options.footer ?? EMAIL_GLOBAL_CONTENT.footer;

  const bodyParagraphs = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${TEXT_COLOR};">${p}</p>`,
    )
    .join("");

  const ctaBlock = cta
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 8px;">
        <tr>
          <td align="center" style="border-radius:10px;background:${BRAND_PRIMARY};">
            <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(cta.label)}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>枫转 MapleZhuan</title>
</head>
<body style="margin:0;padding:0;background:#f3fbf7;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3fbf7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(31,41,51,0.08);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:28px 32px 24px;border-bottom:1px solid rgba(31,41,51,0.06);">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img src="${escapeHtml(EMAIL_LOGO_URL)}" alt="枫转 MapleZhuan" width="160" style="display:block;margin:0 auto;border:0;outline:none;" />
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${TEXT_COLOR};">${greeting}</p>
              ${bodyParagraphs}
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:${BRAND_PRIMARY};color:#ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" style="padding:0;color:#ffffff;font-size:13px;line-height:1.6;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#ffffff;">${escapeHtml(footer.contactTitle)}</p>
                    <p style="margin:0 0 12px;">
                      <a href="mailto:${supportEmail}" style="color:#ffffff;text-decoration:underline;">${supportEmail}</a>
                    </p>
                    <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.85);">
                      ${escapeHtml(footer.unsubscribePrompt)}
                      <a href="${settingsUrl}" style="color:#ffffff;text-decoration:underline;">${escapeHtml(footer.unsubscribeLink)}</a>
                    </p>
                    <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.85);">
                      ${escapeHtml(footer.suspiciousEmail)}
                      <a href="mailto:${supportEmail}" style="color:#ffffff;text-decoration:underline;">${escapeHtml(footer.contactUs)}</a>。
                    </p>
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);">
                      ${escapeHtml(footer.autoSendNotice)}
                    </p>
                    <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.7);">
                      &copy; ${year} ${escapeHtml(footer.brandName)}
                    </p>
                  </td>
                  ${socialCell}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailGreeting(nickname: string): string {
  return `您好，${escapeHtml(nickname)}：`;
}

export function bold(text: string): string {
  return `<b>${escapeHtml(text)}</b>`;
}

export function messagesUrl(chatId?: string): string {
  if (chatId) return `${SITE_URL}/messages/${chatId}`;
  return `${SITE_URL}/messages`;
}
