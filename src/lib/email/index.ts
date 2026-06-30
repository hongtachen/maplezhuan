export { escapeHtml } from "./escape";
export { sendEmail } from "./send";
export {
  buildEmailHtml,
  emailGreeting,
  bold,
  messagesUrl,
  type BuildEmailHtmlOptions,
  type EmailCta,
} from "./template";
export {
  EMAIL_GLOBAL_CONTENT,
  EMAIL_SCENARIOS,
  getDefaultEmailContentConfig,
} from "./scenario-content";
export {
  renderEmailScenario,
  getEmailContentConfig,
  setEmailContentOverride,
} from "./render";
export {
  buildNewItemRequestEmail,
  buildNewSubletRequestEmail,
  buildNewBargainEmail,
  buildReserveAcceptedEmail,
  buildTransactionCompletedEmail,
  buildRequestDeclinedEmail,
  buildBargainDeclinedEmail,
  buildTransactionCancelledEmail,
  EMAIL_PREVIEW_SCENARIOS,
  type EmailContent,
} from "./scenarios";
export type {
  EmailScenarioId,
  EmailScenarioDefinition,
  EmailContentConfig,
  EmailRenderVars,
} from "./types";
