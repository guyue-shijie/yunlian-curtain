(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setText(node, value) {
    if (node && value !== undefined && value !== null) node.textContent = String(value);
  }

  function setAttr(node, name, value) {
    if (node && value) node.setAttribute(name, value);
  }

  function textEl(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    setText(node, value);
    return node;
  }

  function setMeta(selector, attr, value) {
    const node = $(selector);
    if (node && value) node.setAttribute(attr, value);
  }

  function isDirectVideo(url) {
    return /\.(mp4|webm|ogg)(\?.*)?$/i.test(String(url || ""));
  }

  function normalizedSiteUrl(value) {
    if (!value) return window.location.origin + "/";
    try {
      const url = new URL(value, window.location.origin);
      return url.href.endsWith("/") ? url.href : `${url.href}/`;
    } catch {
      return window.location.origin + "/";
    }
  }

  function setPhoneLinks(data) {
    const number = data.business.phoneNumber || "";
    const label = data.business.phoneLabel || number;
    $$('a[href^="tel:"]').forEach((link, index) => {
      link.href = `tel:${number}`;
      if (index > 0) link.textContent = `拨打 ${label}`;
    });
  }

  function renderSeo(data) {
    const siteUrl = normalizedSiteUrl(data.seo.siteUrl);
    document.title = data.seo.title || document.title;
    setMeta('meta[name="description"]', "content", data.seo.description);
    setMeta('link[rel="canonical"]', "href", siteUrl);
    setMeta('meta[property="og:title"]', "content", data.seo.title);
    setMeta('meta[property="og:description"]', "content", data.seo.description);
    setMeta('meta[property="og:url"]', "content", siteUrl);
    setMeta('meta[property="og:image"]', "content", data.seo.image);
    setMeta('meta[name="twitter:title"]', "content", data.seo.title);
    setMeta('meta[name="twitter:description"]', "content", data.seo.description);
    setMeta('meta[name="twitter:image"]', "content", data.seo.image);

    const schema = $('script[type="application/ld+json"]');
    if (schema) {
      schema.textContent = JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "HomeAndConstructionBusiness",
          name: data.business.brandName,
          image: data.seo.image,
          url: siteUrl,
          telephone: data.business.phoneNumber,
          address: {
            "@type": "PostalAddress",
            streetAddress: data.business.address,
            addressLocality: data.business.city,
            addressCountry: "CN",
          },
          openingHours: data.business.hours,
        },
        null,
        2,
      );
    }
  }

  function renderBrand(data) {
    setText($(".brand-mark"), data.business.logoText);
    setText($(".brand span:last-child"), data.business.brandName);
    $$(".brand").forEach((brand) => brand.setAttribute("aria-label", `${data.business.brandName}首页`));
  }

  function renderHero(data) {
    const image = $(".hero-image");
    if (image && data.hero.image) {
      image.src = data.hero.image;
      image.alt = `${data.business.brandName}窗帘定制案例`;
    }
    setText($(".eyebrow"), data.hero.eyebrow);
    const title = $("h1");
    if (title) {
      title.textContent = "";
      data.hero.titleLines.forEach((line) => title.appendChild(textEl("span", "line", line)));
    }
    setText($(".hero-subtitle"), data.hero.subtitle);

    const proof = $(".hero-proof");
    if (proof) {
      proof.textContent = "";
      data.proof.forEach((item) => {
        const node = textEl("div", "proof-item", "");
        node.appendChild(textEl("strong", "", item.value));
        node.appendChild(textEl("span", "", item.label));
        proof.appendChild(node);
      });
    }
  }

  function renderServices(data) {
    const heads = $$(".section-head");
    setText($("h2", heads[0]), data.content.serviceSectionTitle);
    setText($("p", heads[0]), data.content.serviceSectionText);

    const grid = $(".service-grid");
    if (!grid) return;
    grid.textContent = "";
    data.services.forEach((service) => {
      const card = textEl("article", "service", "");
      card.appendChild(textEl("div", "icon", service.icon));
      card.appendChild(textEl("h3", "", service.title));
      card.appendChild(textEl("p", "", service.description));
      grid.appendChild(card);
    });
  }

  function renderCases(data) {
    const heads = $$(".section-head");
    setText($("h2", heads[1]), data.content.caseSectionTitle);
    setText($("p", heads[1]), data.content.caseSectionText);

    const gallery = $(".gallery");
    if (!gallery) return;
    gallery.textContent = "";
    data.cases.forEach((item, index) => {
      const card = textEl("div", index === 0 ? "case large" : "case", "");
      card.dataset.title = item.title;
      if (item.image) {
        card.classList.add("has-image");
        card.style.setProperty("--case-image", `url("${String(item.image).replaceAll('"', "%22")}")`);
      }
      if (item.video) {
        card.classList.add("has-video");
        if (isDirectVideo(item.video)) {
          const video = document.createElement("video");
          video.src = item.video;
          video.controls = true;
          video.preload = "metadata";
          video.playsInline = true;
          card.appendChild(video);
        } else {
          const link = textEl("a", "case-video-link", "查看视频");
          link.href = item.video;
          link.target = "_blank";
          link.rel = "noreferrer";
          card.appendChild(link);
        }
      }
      gallery.appendChild(card);
    });
  }

  function renderPrices(data) {
    const heads = $$(".section-head");
    setText($("h2", heads[2]), data.content.priceSectionTitle);
    setText($("p", heads[2]), data.content.priceSectionText);

    const grid = $(".price-grid");
    if (!grid) return;
    grid.textContent = "";
    data.prices.forEach((price) => {
      const card = textEl("article", price.featured ? "price featured" : "price", "");
      card.appendChild(textEl("span", "tag", price.tag));
      card.appendChild(textEl("h3", "", price.title));
      card.appendChild(textEl("p", "", price.description));
      const money = textEl("div", "money", price.amount);
      money.appendChild(textEl("small", "", ` ${price.unit}`));
      card.appendChild(money);
      const list = document.createElement("ul");
      price.items.forEach((line) => list.appendChild(textEl("li", "", line)));
      card.appendChild(list);
      grid.appendChild(card);
    });
  }

  function renderSteps(data) {
    const heads = $$(".section-head");
    setText($("h2", heads[3]), data.content.stepSectionTitle);
    setText($("p", heads[3]), data.content.stepSectionText);

    const steps = $(".steps");
    if (!steps) return;
    steps.textContent = "";
    data.steps.forEach((step) => {
      const card = textEl("article", "step", "");
      card.appendChild(textEl("h3", "", step.title));
      card.appendChild(textEl("p", "", step.description));
      steps.appendChild(card);
    });
  }

  function renderContact(data) {
    setPhoneLinks(data);
    setText($(".cta-panel h2"), data.content.ctaTitle);
    setText($(".cta-panel p"), data.content.ctaText);

    const mapLink = $('.cta-panel a[target="_blank"]');
    if (mapLink && data.business.mapUrl) mapLink.href = data.business.mapUrl;

    const boxes = $$(".lead-box .input-like");
    setText(boxes[0], `微信号：${data.business.wechat}`);
    setText(boxes[1], data.business.hours);
    setText(boxes[2], data.business.serviceRange);

    const footerSpans = $$("footer span");
    setText(footerSpans[0], `© 2026 ${data.business.brandName}。${data.content.footerNote}`);
    setText(footerSpans[1], `地址：${data.business.address}`);
  }

  function render(data) {
    renderSeo(data);
    renderBrand(data);
    renderHero(data);
    renderServices(data);
    renderCases(data);
    renderPrices(data);
    renderSteps(data);
    renderContact(data);
  }

  async function loadSiteData() {
    try {
      const response = await fetch("/api/site", { headers: { accept: "application/json" } });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload && payload.ok && payload.data) render(payload.data);
    } catch (error) {
      console.warn("Site data was not loaded.", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSiteData);
  } else {
    loadSiteData();
  }
})();
