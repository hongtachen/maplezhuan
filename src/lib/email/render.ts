import { SITE_URL } from "@/lib/constants";
import { escapeHtml } from "./escape";
import { getDefaultEmailContentConfig } from "./scenario-content";
import { bold, buildEmailHtml, emailGreeting, messagesUrl } from "./template";
import type {
  EmailContent,
  EmailContentConfig,
  EmailCtaTarget,
  EmailRenderVars,
  EmailScenarioId,
} from "./types";

let contentOverride: Partial<EmailContentConfig> | null = null;

/**
 * Override email copy at runtime (e.g. from admin CMS / Firestore).
 * Pass `null` to reset to file-based defaults.
 */
export function setEmailContentOverride(
  config: Partial<EmailContentConfig> | null,
): void {
  contentOverride = config;
}

export function getEmailContentConfig(): EmailContentConfig {
  const defaults = getDefaultEmailContentConfig();
  if (!contentOverride) return defaults;
  return {
    global: { ...defaults.global, ...contentOverride.global },
    scenarios: { ...defaults.scenarios, ...contentOverride.scenarios },
  };
}

function resolvePlainTemplate(template: string, vars: EmailRenderVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = vars[key];
    if (val === undefined || val === false) return "";
    return String(val);
  });
}

function resolveRichTemplate(
  template: string,
  vars: EmailRenderVars,
  boldVars: string[] = [],
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = vars[key];
    if (val === undefined || val === false) return "";
    const str = String(val);
    return boldVars.includes(key) ? bold(str) : escapeHtml(str);
  });
}

function resolveCtaHref(target: EmailCtaTarget, chatId?: string): string {
  switch (target) {
    case "home":
      return SITE_URL;
    case "messages_chat":
      return messagesUrl(chatId);
    case "messages":
    default:
      return messagesUrl();
  }
}

function resolveNickname(
  vars: EmailRenderVars,
  defaultNicknameKey: string | undefined,
  global: EmailContentConfig["global"],
): string {
  if (vars.nickname && String(vars.nickname).trim()) {
    return String(vars.nickname);
  }
  if (defaultNicknameKey && global.defaultNicknames[defaultNicknameKey]) {
    return global.defaultNicknames[defaultNicknameKey];
  }
  return global.defaultNicknames.user;
}

/** Core renderer — maps scenario id + variables to subject + HTML */
export function renderEmailScenario(
  scenarioId: EmailScenarioId,
  vars: EmailRenderVars,
  options?: { chatId?: string },
): EmailContent {
  const config = getEmailContentConfig();
  const scenario = config.scenarios[scenarioId];
  if (!scenario) {
    throw new Error(`Unknown email scenario: ${scenarioId}`);
  }

  const nickname = resolveNickname(
    vars,
    scenario.defaultNicknameKey,
    config.global,
  );

  const subject =
    config.global.subjectPrefix + resolvePlainTemplate(scenario.subject, vars);

  const paragraphs = scenario.paragraphs
    .filter((p) => {
      if (typeof p === "string") return true;
      return Boolean(vars[p.optional]);
    })
    .map((p) => (typeof p === "string" ? p : p.template))
    .map((p) =>
      resolveRichTemplate(
        p,
        vars,
        scenario.boldVars ? [...scenario.boldVars] : [],
      ),
    );

  const ctaLabel = config.global.cta[scenario.cta.labelKey];
  if (!ctaLabel) {
    throw new Error(
      `Missing CTA label "${scenario.cta.labelKey}" for scenario ${scenarioId}`,
    );
  }

  return {
    subject,
    html: buildEmailHtml({
      greeting: emailGreeting(nickname),
      paragraphs,
      footer: config.global.footer,
      cta: {
        label: ctaLabel,
        href: resolveCtaHref(scenario.cta.target, options?.chatId),
      },
    }),
  };
}
