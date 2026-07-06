const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const tabs = [
  { id: "business", title: "门店", note: "电话、微信、地址、营业时间和地图链接。" },
  { id: "seo", title: "搜索", note: "浏览器标题、搜索摘要、分享图片和站点地址。" },
  { id: "hero", title: "首屏", note: "客户打开页面后第一眼看到的内容。" },
  { id: "proof", title: "背书", note: "首屏下方的三个信任点。" },
  { id: "services", title: "服务", note: "窗帘定制、轨道安装、软装搭配等服务项。" },
  { id: "cases", title: "案例", note: "真实安装案例，建议后续换成真实图片链接。" },
  { id: "prices", title: "价格", note: "参考套餐和价格范围。" },
  { id: "steps", title: "流程", note: "客户从咨询到安装的步骤。" },
  { id: "content", title: "文案", note: "各栏目标题、说明和底部转化文案。" },
];

let siteData = null;
let activeTab = "business";
let isDirty = false;

function setStatus(message, type = "normal") {
  const node = $("#saveStatus");
  if (!node) return;
  node.textContent = message || "";
  node.classList.toggle("error", type === "error");
}

function setLoginStatus(message, type = "normal") {
  const node = $("#loginStatus");
  if (!node) return;
  node.textContent = message || "";
  node.classList.toggle("error", type === "error");
}

function setBusy(busy) {
  $$("#appView button, #loginView button").forEach((button) => {
    button.disabled = busy;
  });
}

function markDirty() {
  isDirty = true;
  setStatus("有未保存的修改。");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({ ok: false, error: "接口返回格式不正确。" }));
  if (!response.ok || !payload.ok) {
    const error = new Error(payload.error || "请求失败。");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function showLogin() {
  $("#loginView").classList.remove("hidden");
  $("#appView").classList.add("hidden");
}

function showApp() {
  $("#loginView").classList.add("hidden");
  $("#appView").classList.remove("hidden");
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function field(parent, label, value, onInput, options = {}) {
  const wrap = element("div", `field${options.full ? " full" : ""}`);
  const id = `field_${Math.random().toString(36).slice(2)}`;
  const labelNode = element("label", "", label);
  labelNode.htmlFor = id;
  const input = document.createElement(options.textarea ? "textarea" : "input");
  input.id = id;
  input.value = value || "";
  if (options.type) input.type = options.type;
  if (options.placeholder) input.placeholder = options.placeholder;
  input.addEventListener("input", () => {
    onInput(input.value);
    markDirty();
  });
  wrap.append(labelNode, input);
  parent.appendChild(wrap);
  return input;
}

function checkbox(parent, label, checked, onChange) {
  const wrap = element("label", "check-row");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(checked);
  input.addEventListener("change", () => {
    onChange(input.checked);
    markDirty();
  });
  wrap.append(input, document.createTextNode(label));
  parent.appendChild(wrap);
}

function itemShell(parent, title, onRemove) {
  const item = element("div", "item");
  const head = element("div", "item-head");
  head.appendChild(element("span", "", title));
  const remove = element("button", "button danger", "删除");
  remove.type = "button";
  remove.addEventListener("click", () => {
    onRemove();
    markDirty();
    renderEditor();
  });
  head.appendChild(remove);
  item.appendChild(head);
  parent.appendChild(item);
  return item;
}

function arrayBlock(parent, title, list, createItem, renderItem) {
  const block = element("div", "array");
  const head = element("div", "item-head");
  head.appendChild(element("span", "", title));
  const add = element("button", "button", "新增");
  add.type = "button";
  add.addEventListener("click", () => {
    list.push(createItem());
    markDirty();
    renderEditor();
  });
  head.appendChild(add);
  block.appendChild(head);

  list.forEach((item, index) => {
    const shell = itemShell(block, `${title} ${index + 1}`, () => list.splice(index, 1));
    const grid = element("div", "mini-grid");
    shell.appendChild(grid);
    renderItem(grid, item, index);
  });

  parent.appendChild(block);
}

function lineArray(parent, title, list) {
  arrayBlock(
    parent,
    title,
    list,
    () => "",
    (grid, _item, index) => {
      field(grid, "文字", list[index], (value) => {
        list[index] = value;
      }, { full: true });
    },
  );
}

function panel(title, note) {
  const section = element("section", "panel");
  section.dataset.panel = title;
  const head = element("div", "panel-head");
  head.append(element("h2", "", title), element("p", "", note));
  const fields = element("div", "fields");
  section.append(head, fields);
  return { section, fields };
}

function renderBusiness(fields) {
  const b = siteData.business;
  field(fields, "门店名称", b.brandName, (value) => (b.brandName = value));
  field(fields, "标志文字", b.logoText, (value) => (b.logoText = value), { placeholder: "帘" });
  field(fields, "拨打电话", b.phoneNumber, (value) => (b.phoneNumber = value), { placeholder: "13800000000" });
  field(fields, "电话显示", b.phoneLabel, (value) => (b.phoneLabel = value), { placeholder: "138-0000-0000" });
  field(fields, "微信号", b.wechat, (value) => (b.wechat = value));
  field(fields, "城市", b.city, (value) => (b.city = value));
  field(fields, "营业时间", b.hours, (value) => (b.hours = value));
  field(fields, "服务范围", b.serviceRange, (value) => (b.serviceRange = value));
  field(fields, "门店地址", b.address, (value) => (b.address = value), { full: true });
  field(fields, "地图导航链接", b.mapUrl, (value) => (b.mapUrl = value), { full: true });
}

function renderSeo(fields) {
  const seo = siteData.seo;
  field(fields, "页面标题", seo.title, (value) => (seo.title = value), { full: true });
  field(fields, "搜索摘要", seo.description, (value) => (seo.description = value), { full: true, textarea: true });
  field(fields, "站点地址", seo.siteUrl, (value) => (seo.siteUrl = value), { full: true });
  field(fields, "分享图片地址", seo.image, (value) => (seo.image = value), { full: true });
}

function renderHero(fields) {
  const hero = siteData.hero;
  field(fields, "小标题", hero.eyebrow, (value) => (hero.eyebrow = value), { full: true });
  lineArray(fields, "大标题分行", hero.titleLines);
  field(fields, "首屏说明", hero.subtitle, (value) => (hero.subtitle = value), { full: true, textarea: true });
  field(fields, "首屏图片地址", hero.image, (value) => (hero.image = value), { full: true });
}

function renderProof(fields) {
  arrayBlock(
    fields,
    "信任点",
    siteData.proof,
    () => ({ value: "1项", label: "服务优势" }),
    (grid, item) => {
      field(grid, "数字", item.value, (value) => (item.value = value));
      field(grid, "说明", item.label, (value) => (item.label = value));
    },
  );
}

function renderServices(fields) {
  arrayBlock(
    fields,
    "服务项",
    siteData.services,
    () => ({ icon: "帘", title: "新服务", description: "填写服务说明。" }),
    (grid, item) => {
      field(grid, "图标字", item.icon, (value) => (item.icon = value));
      field(grid, "标题", item.title, (value) => (item.title = value));
      field(grid, "说明", item.description, (value) => (item.description = value), { full: true, textarea: true });
    },
  );
}

function renderCases(fields) {
  arrayBlock(
    fields,
    "案例",
    siteData.cases,
    () => ({ title: "新案例", image: "" }),
    (grid, item) => {
      field(grid, "案例标题", item.title, (value) => (item.title = value), { full: true });
      field(grid, "案例图片地址", item.image, (value) => (item.image = value), {
        full: true,
        placeholder: "https://... 或 data:image/...",
      });
    },
  );
}

function renderPrices(fields) {
  arrayBlock(
    fields,
    "价格套餐",
    siteData.prices,
    () => ({
      tag: "推荐",
      title: "新套餐",
      description: "填写套餐说明。",
      amount: "到店报价",
      unit: "/ 套",
      items: ["卖点一", "卖点二"],
      featured: false,
    }),
    (grid, item) => {
      field(grid, "标签", item.tag, (value) => (item.tag = value));
      field(grid, "标题", item.title, (value) => (item.title = value));
      field(grid, "价格", item.amount, (value) => (item.amount = value));
      field(grid, "单位", item.unit, (value) => (item.unit = value));
      checkbox(grid, "重点推荐", item.featured, (value) => (item.featured = value));
      field(grid, "说明", item.description, (value) => (item.description = value), { full: true, textarea: true });
      field(grid, "卖点列表（一行一个）", item.items.join("\n"), (value) => {
        item.items = value.split("\n").map((line) => line.trim()).filter(Boolean);
      }, { full: true, textarea: true });
    },
  );
}

function renderSteps(fields) {
  arrayBlock(
    fields,
    "流程步骤",
    siteData.steps,
    () => ({ title: "新步骤", description: "填写步骤说明。" }),
    (grid, item) => {
      field(grid, "标题", item.title, (value) => (item.title = value));
      field(grid, "说明", item.description, (value) => (item.description = value), { full: true, textarea: true });
    },
  );
}

function renderContent(fields) {
  const c = siteData.content;
  field(fields, "服务区标题", c.serviceSectionTitle, (value) => (c.serviceSectionTitle = value), { full: true });
  field(fields, "服务区说明", c.serviceSectionText, (value) => (c.serviceSectionText = value), { full: true, textarea: true });
  field(fields, "案例区标题", c.caseSectionTitle, (value) => (c.caseSectionTitle = value), { full: true });
  field(fields, "案例区说明", c.caseSectionText, (value) => (c.caseSectionText = value), { full: true, textarea: true });
  field(fields, "价格区标题", c.priceSectionTitle, (value) => (c.priceSectionTitle = value), { full: true });
  field(fields, "价格区说明", c.priceSectionText, (value) => (c.priceSectionText = value), { full: true, textarea: true });
  field(fields, "流程区标题", c.stepSectionTitle, (value) => (c.stepSectionTitle = value), { full: true });
  field(fields, "流程区说明", c.stepSectionText, (value) => (c.stepSectionText = value), { full: true, textarea: true });
  field(fields, "底部转化标题", c.ctaTitle, (value) => (c.ctaTitle = value), { full: true });
  field(fields, "底部转化说明", c.ctaText, (value) => (c.ctaText = value), { full: true, textarea: true });
  field(fields, "页脚说明", c.footerNote, (value) => (c.footerNote = value), { full: true, textarea: true });
}

function renderTabs() {
  const nav = $("#tabs");
  nav.textContent = "";
  tabs.forEach((tab) => {
    const button = element("button", `tab${tab.id === activeTab ? " active" : ""}`, tab.title);
    button.type = "button";
    button.addEventListener("click", () => {
      activeTab = tab.id;
      renderEditor();
    });
    nav.appendChild(button);
  });
}

function renderEditor() {
  renderTabs();
  const root = $("#panels");
  root.textContent = "";
  tabs.forEach((tab) => {
    const built = panel(tab.title, tab.note);
    if (tab.id === activeTab) built.section.classList.add("active");
    if (tab.id === "business") renderBusiness(built.fields);
    if (tab.id === "seo") renderSeo(built.fields);
    if (tab.id === "hero") renderHero(built.fields);
    if (tab.id === "proof") renderProof(built.fields);
    if (tab.id === "services") renderServices(built.fields);
    if (tab.id === "cases") renderCases(built.fields);
    if (tab.id === "prices") renderPrices(built.fields);
    if (tab.id === "steps") renderSteps(built.fields);
    if (tab.id === "content") renderContent(built.fields);
    root.appendChild(built.section);
  });
  const updated = siteData.updatedAt ? new Date(siteData.updatedAt).toLocaleString("zh-CN") : "未保存";
  $("#updatedAt").textContent = `最后保存：${updated}`;
}

async function loadAdminData() {
  setBusy(true);
  setStatus("正在读取后台内容...");
  try {
    const payload = await api("/api/admin/site");
    siteData = payload.data;
    isDirty = false;
    renderEditor();
    showApp();
    setStatus("内容已读取。");
  } catch (error) {
    if (error.status === 401) {
      showLogin();
      setLoginStatus("请输入后台密码。");
    } else {
      showLogin();
      setLoginStatus(error.message, "error");
    }
  } finally {
    setBusy(false);
  }
}

async function login(event) {
  event.preventDefault();
  const password = $("#password").value;
  setBusy(true);
  setLoginStatus("正在登录...");
  try {
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    $("#password").value = "";
    setLoginStatus("");
    await loadAdminData();
  } catch (error) {
    setLoginStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function save(event) {
  event.preventDefault();
  if (!siteData) return;
  setBusy(true);
  setStatus("正在保存...");
  try {
    const payload = await api("/api/admin/site", {
      method: "PUT",
      body: JSON.stringify({ data: siteData }),
    });
    siteData = payload.data;
    isDirty = false;
    renderEditor();
    setStatus("已保存发布。前台最多 1 分钟内更新。");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function logout() {
  setBusy(true);
  try {
    await api("/api/logout", { method: "POST", body: "{}" });
  } catch {
    // Ignore logout API errors and clear the local view.
  } finally {
    siteData = null;
    setBusy(false);
    showLogin();
    setLoginStatus("已退出。");
  }
}

window.addEventListener("beforeunload", (event) => {
  if (!isDirty) return;
  event.preventDefault();
  event.returnValue = "";
});

$("#loginForm").addEventListener("submit", login);
$("#editorForm").addEventListener("submit", save);
$("#logoutButton").addEventListener("click", logout);
$("#reloadButton").addEventListener("click", loadAdminData);

loadAdminData();
