export const defaultSiteData = {
  version: 1,
  seo: {
    title: "云帘软装｜窗帘定制与免费上门量尺",
    description: "云帘软装提供本地窗帘定制、轨道安装、全屋软装搭配，支持免费上门量尺、看样布、预约报价。",
    siteUrl: "https://yunlian-curtain.pages.dev/",
    image: "https://yunlian-curtain.pages.dev/assets/curtain-hero.png",
  },
  business: {
    brandName: "云帘软装",
    logoText: "帘",
    phoneNumber: "13800000000",
    phoneLabel: "138-0000-0000",
    wechat: "yunlian-curtain",
    address: "请替换为真实门店地址",
    city: "请替换城市",
    hours: "09:00 - 20:00",
    serviceRange: "同城上门",
    mapUrl: "https://uri.amap.com/marker?position=116.397428,39.90923&name=云帘软装",
  },
  hero: {
    eyebrow: "本地窗帘定制与上门安装",
    titleLines: ["免费量尺，", "给你家配一套", "耐看的窗帘。"],
    subtitle: "卧室遮光、客厅纱帘、阳台轨道、全屋软装搭配，一次上门看样布、量尺寸、出报价。",
    image: "assets/curtain-hero.png",
  },
  proof: [
    { value: "2小时", label: "同城快速响应" },
    { value: "300+", label: "本地安装案例" },
    { value: "1年", label: "轨道安装售后" },
  ],
  services: [
    { icon: "布", title: "窗帘定制", description: "卧室、客厅、儿童房、阳台，按尺寸和遮光需求推荐布料。" },
    { icon: "轨", title: "轨道安装", description: "直轨、弯轨、罗马杆、智能电动轨道，上门测量后安装。" },
    { icon: "搭", title: "软装搭配", description: "根据墙面、地板、家具颜色，搭配布帘、纱帘和挂法。" },
    { icon: "售", title: "售后调整", description: "安装后如需小范围调整，按约定提供本地售后服务。" },
  ],
  cases: [
    { title: "客厅｜布帘+纱帘｜温柔奶咖色", image: "", video: "" },
    { title: "卧室｜高遮光｜安静灰绿", image: "", video: "" },
    { title: "阳台｜弯轨安装｜清爽白纱", image: "", video: "" },
    { title: "儿童房｜柔和色系｜易打理", image: "", video: "" },
    { title: "全屋｜统一配色｜上门报价", image: "", video: "" },
  ],
  prices: [
    {
      tag: "卧室常用",
      title: "遮光窗帘",
      description: "适合主卧、次卧、儿童房，兼顾遮光和隐私。",
      amount: "399元起",
      unit: "/ 窗",
      items: ["可选遮光率", "支持布帘+纱帘", "上门看样布"],
      featured: false,
    },
    {
      tag: "咨询最多",
      title: "客厅窗帘",
      description: "适合大窗、落地窗、阳台连客厅，重视整体效果。",
      amount: "699元起",
      unit: "/ 套",
      items: ["客厅配色建议", "轨道/罗马杆可选", "预约上门量尺"],
      featured: true,
    },
    {
      tag: "新房推荐",
      title: "全屋定制",
      description: "适合新房装修、旧房翻新，一次完成全屋搭配。",
      amount: "到店报价",
      unit: "/ 量尺后",
      items: ["全屋统一方案", "多空间一起核价", "安装后售后调整"],
      featured: false,
    },
  ],
  steps: [
    { title: "加微信发户型", description: "客户拍窗户和装修风格，先判断大概方案。" },
    { title: "预约上门量尺", description: "确认小区、时间、窗口数量，上门带样布。" },
    { title: "现场选布报价", description: "根据尺寸、遮光、轨道和安装方式核价。" },
    { title: "制作安装售后", description: "确认订单后制作，预约安装，后续可调整。" },
  ],
  content: {
    serviceSectionTitle: "客户进来后，先让他知道你能解决什么。",
    serviceSectionText: "这页是给窗帘店获客用的，不是普通官网。重点是让客户看到案例、价格范围和联系方式，尽快预约上门量尺。",
    caseSectionTitle: "真实案例比长篇介绍更容易成交。",
    caseSectionText: "正式上线时，把这里换成老板真实安装图。每张图都写清楚房间、面料和大概预算。",
    priceSectionTitle: "价格给范围，不把客户吓跑。",
    priceSectionText: "窗帘按尺寸、面料、轨道和安装方式计价。页面先给参考价，具体报价通过量尺后确认。",
    stepSectionTitle: "把咨询变成预约量尺。",
    stepSectionText: "客户不需要复杂流程，只要知道下一步怎么做。这个流程适合放在页面中段和销售话术里。",
    ctaTitle: "今天预约，先给你看样布和预算。",
    ctaText: "替换成真实店铺后，这里放老板微信、门店地址和联系电话。客户从抖音、朋友圈、业主群点进来后，能直接联系。",
    footerNote: "本页面为窗帘店获客样板，可替换真实店铺资料。",
  },
};

function asString(value, fallback = "", max = 500) {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, max);
}

function asUrl(value, fallback = "") {
  const text = asString(value, fallback, 2000);
  if (!text) return "";
  try {
    const parsed = new URL(text, "https://example.com");
    if (["http:", "https:", "tel:", "mailto:"].includes(parsed.protocol)) return text;
  } catch {
    return fallback;
  }
  if (text.startsWith("assets/")) return text;
  if (text.startsWith("data:image/")) return text.slice(0, 2_500_000);
  return fallback;
}

function list(value, fallback, limit, normalizer) {
  if (!Array.isArray(value)) return fallback;
  return value.slice(0, limit).map((item, index) => normalizer(item || {}, fallback[index] || {}));
}

export function normalizeSiteData(input = {}) {
  const data = input && typeof input === "object" ? input : {};
  const base = defaultSiteData;
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    seo: {
      title: asString(data.seo?.title, base.seo.title, 120),
      description: asString(data.seo?.description, base.seo.description, 240),
      siteUrl: asUrl(data.seo?.siteUrl, base.seo.siteUrl),
      image: asUrl(data.seo?.image, base.seo.image),
    },
    business: {
      brandName: asString(data.business?.brandName, base.business.brandName, 40),
      logoText: asString(data.business?.logoText, base.business.logoText, 2),
      phoneNumber: asString(data.business?.phoneNumber, base.business.phoneNumber, 32).replace(/[^\d+]/g, ""),
      phoneLabel: asString(data.business?.phoneLabel, base.business.phoneLabel, 32),
      wechat: asString(data.business?.wechat, base.business.wechat, 80),
      address: asString(data.business?.address, base.business.address, 160),
      city: asString(data.business?.city, base.business.city, 60),
      hours: asString(data.business?.hours, base.business.hours, 80),
      serviceRange: asString(data.business?.serviceRange, base.business.serviceRange, 80),
      mapUrl: asUrl(data.business?.mapUrl, base.business.mapUrl),
    },
    hero: {
      eyebrow: asString(data.hero?.eyebrow, base.hero.eyebrow, 80),
      titleLines: list(data.hero?.titleLines, base.hero.titleLines, 4, (item, fallback) => asString(item, fallback, 30)),
      subtitle: asString(data.hero?.subtitle, base.hero.subtitle, 180),
      image: asUrl(data.hero?.image, base.hero.image),
    },
    proof: list(data.proof, base.proof, 3, (item, fallback) => ({
      value: asString(item.value, fallback.value, 20),
      label: asString(item.label, fallback.label, 40),
    })),
    services: list(data.services, base.services, 6, (item, fallback) => ({
      icon: asString(item.icon, fallback.icon, 2),
      title: asString(item.title, fallback.title, 40),
      description: asString(item.description, fallback.description, 160),
    })),
    cases: list(data.cases, base.cases, 60, (item, fallback) => ({
      title: asString(item.title, fallback.title, 80),
      image: asUrl(item.image, fallback.image),
      video: asUrl(item.video, fallback.video),
    })),
    prices: list(data.prices, base.prices, 6, (item, fallback) => ({
      tag: asString(item.tag, fallback.tag, 30),
      title: asString(item.title, fallback.title, 40),
      description: asString(item.description, fallback.description, 160),
      amount: asString(item.amount, fallback.amount, 30),
      unit: asString(item.unit, fallback.unit, 30),
      items: list(item.items, fallback.items, 8, (line, fallbackLine) => asString(line, fallbackLine, 60)),
      featured: Boolean(item.featured),
    })),
    steps: list(data.steps, base.steps, 6, (item, fallback) => ({
      title: asString(item.title, fallback.title, 40),
      description: asString(item.description, fallback.description, 120),
    })),
    content: {
      serviceSectionTitle: asString(data.content?.serviceSectionTitle, base.content.serviceSectionTitle, 80),
      serviceSectionText: asString(data.content?.serviceSectionText, base.content.serviceSectionText, 200),
      caseSectionTitle: asString(data.content?.caseSectionTitle, base.content.caseSectionTitle, 80),
      caseSectionText: asString(data.content?.caseSectionText, base.content.caseSectionText, 200),
      priceSectionTitle: asString(data.content?.priceSectionTitle, base.content.priceSectionTitle, 80),
      priceSectionText: asString(data.content?.priceSectionText, base.content.priceSectionText, 200),
      stepSectionTitle: asString(data.content?.stepSectionTitle, base.content.stepSectionTitle, 80),
      stepSectionText: asString(data.content?.stepSectionText, base.content.stepSectionText, 200),
      ctaTitle: asString(data.content?.ctaTitle, base.content.ctaTitle, 80),
      ctaText: asString(data.content?.ctaText, base.content.ctaText, 220),
      footerNote: asString(data.content?.footerNote, base.content.footerNote, 120),
    },
  };
}
