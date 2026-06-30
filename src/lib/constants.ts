/** Platform support contact — override via NEXT_PUBLIC_SUPPORT_EMAIL */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@maplezhuan.ca";

/** Public site URL — used in emails for logo, CTA, and settings links */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maplezhuan.ca";

/** Optional social links — hidden in emails when empty */
/** Xiaohongshu: set NEXT_PUBLIC_SOCIAL_XHS_USER_ID (profile ID) or full NEXT_PUBLIC_SOCIAL_XHS_URL */
const XHS_USER_ID = process.env.NEXT_PUBLIC_SOCIAL_XHS_USER_ID || "";
export const SOCIAL_XHS_URL =
  process.env.NEXT_PUBLIC_SOCIAL_XHS_URL ||
  (XHS_USER_ID ? `https://www.rednote.com/user/profile/${XHS_USER_ID}` : "");
export const SOCIAL_IG_URL = process.env.NEXT_PUBLIC_SOCIAL_IG_URL || "";

export const EMAIL_LOGO_URL = `${SITE_URL}/logo/logo-hori.png`;
export const EMAIL_XHS_ICON_URL = `${SITE_URL}/xiaohongshu.png`;
export const EMAIL_IG_ICON_URL = `${SITE_URL}/instagram.png`;
export const EMAIL_SETTINGS_URL = `${SITE_URL}/profile/settings`;
export const EMAIL_MESSAGES_URL = `${SITE_URL}/messages`;
