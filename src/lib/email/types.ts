/** Scenario identifiers — stable keys for code + future admin CMS */
export type EmailScenarioId =
  | "new_item_request"
  | "new_sublet_request"
  | "new_bargain"
  | "reserve_accepted"
  | "transaction_completed"
  | "request_declined"
  | "bargain_declined"
  | "transaction_cancelled";

export type EmailCtaTarget = "messages" | "messages_chat" | "home";

export type EmailParagraphTemplate =
  | string
  | {
      /** Render only when `vars[optional]` is truthy */
      optional: string;
      template: string;
    };

export type EmailScenarioDefinition = {
  id: EmailScenarioId;
  /** Label for admin UI / dev preview */
  label: string;
  /** Subject line template. Variables: `{itemTitle}`, `{listingLabel}`, etc. */
  subject: string;
  paragraphs: EmailParagraphTemplate[];
  /** Variable names rendered in bold inside paragraphs */
  boldVars?: string[];
  cta: {
    /** Key into EMAIL_GLOBAL_CONTENT.cta */
    labelKey: string;
    target: EmailCtaTarget;
  };
  /** Fallback nickname when `vars.nickname` is empty */
  defaultNicknameKey?: string;
};

export type EmailContent = {
  subject: string;
  html: string;
};

export type EmailRenderVars = Record<string, string | boolean | undefined>;

export type EmailGlobalContent = {
  subjectPrefix: string;
  actionLabels: {
    request_buy: string;
    request_reserve: string;
    sublet_reserve: string;
    bargain: string;
  };
  listingLabels: {
    item: string;
    sublet: string;
  };
  cta: Record<string, string>;
  defaultNicknames: Record<string, string>;
  footer: {
    contactTitle: string;
    unsubscribePrompt: string;
    unsubscribeLink: string;
    suspiciousEmail: string;
    contactUs: string;
    autoSendNotice: string;
    brandName: string;
  };
};

export type EmailContentConfig = {
  global: EmailGlobalContent;
  scenarios: Record<EmailScenarioId, EmailScenarioDefinition>;
};
