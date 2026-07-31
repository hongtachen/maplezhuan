import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_ENTITY_NAME,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants";
import type { LegalDoc } from "./types";

export const communityDoc: LegalDoc = {
  title: "社区与发布规范",
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `使用枫转的发布、聊天与交易功能，即表示同意遵守本规范及《服务条款》、《隐私政策》。运营方：${LEGAL_ENTITY_NAME}`,
  sections: [
    {
      title: "信息真实",
      paragraphs: [
        "如实描述闲置成色、瑕疵，以及转租的租金、费用、入住条件与可租状态。有误请及时修改或下架。",
      ],
    },
    {
      title: "禁止发布",
      paragraphs: [],
      bullets: [
        "用户不得发布或传播违法、违规或不适当的内容，包括但不限于违禁品、毒品、管制武器、未经授权的处方药、盗窃物品、假冒或侵犯知识产权的商品，以及其他违反适用法律法规的内容。",
        "用户不得发布虚假、误导性信息，或利用平台进行诈骗、骚扰、歧视、仇恨攻击、威胁或其他损害他人权益的行为。",
      ],
    },
    {
      title: "转租",
      paragraphs: [
        "用户仅可发布其有权转租、出租或推广的房源信息，并应遵守适用的租赁协议及当地法律法规；不得发布虚假、误导性或未经授权的房源信息。",
      ],
    },
    {
      title: "守约与安全",
      paragraphs: [
        "达成意向后勿无故毁约、临时乱涨价或放鸽子。付款与交割请谨慎；优先站内沟通，见面选公共场所。",
        "勿在标题、详情等公开处泄露他人隐私。联系方式是否公开由设置控制。",
      ],
    },
    {
      title: "聊天与评价",
      paragraphs: [
        "禁止辱骂、骚扰、诈骗链接与无关垃圾营销。评价须基于真实互动，不得恶意刷评。",
      ],
    },
    {
      title: "违规处理",
      paragraphs: [
        `我们可对违规内容下架，并限制或停用账号。举报请发邮件至 ${LEGAL_CONTACT_EMAIL}，并附链接或截图。`,
      ],
    },
  ],
};
