(() => {
  "use strict";

  const canvas = document.querySelector("#solar-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const sceneWrap = document.querySelector(".scene-wrap");
  const controlPanel = document.querySelector("#control-panel");
  const openControlMenu = document.querySelector("#open-control-menu");
  const closeControlMenu = document.querySelector("#close-control-menu");
  const drawerBackdrop = document.querySelector("#drawer-backdrop");
  const planetList = document.querySelector("#planet-list");
  const focusSummary = document.querySelector("#focus-summary");
  const controlStatus = document.querySelector("#control-status");
  const sceneAiAnnotation = document.querySelector("#scene-ai-annotation");
  const annotationLine = document.querySelector("#annotation-line");
  const annotationTitle = document.querySelector("#annotation-title");
  const annotationSummary = document.querySelector("#annotation-summary");
  const annotationPoints = document.querySelector("#annotation-points");
  const toggleMotion = document.querySelector("#toggle-motion");
  const resetView = document.querySelector("#reset-view");
  const toggleLabels = document.querySelector("#toggle-labels");
  const toggleSolo = document.querySelector("#toggle-solo");
  const toggleGesture = document.querySelector("#toggle-gesture");
  const speedRange = document.querySelector("#speed-range");
  const glowRange = document.querySelector("#glow-range");
  const orbitToggle = document.querySelector("#orbit-toggle");
  const planetChip = document.querySelector("#planet-chip");
  const planetName = document.querySelector("#planet-name");
  const planetFact = document.querySelector("#planet-fact");
  const planetDistance = document.querySelector("#planet-distance");
  const planetPeriod = document.querySelector("#planet-period");
  const gestureCard = document.querySelector("#gesture-card");
  const gestureVideo = document.querySelector("#gesture-video");
  const gestureCanvas = document.querySelector("#gesture-canvas");
  const gestureName = document.querySelector("#gesture-name");
  const gestureHint = document.querySelector("#gesture-hint");
  const aiAnswer = document.querySelector("#ai-answer");
  const aiModelLine = document.querySelector("#ai-model-line");
  const aiQuestion = document.querySelector("#ai-question");
  const aiAsk = document.querySelector("#ai-ask");
  const aiProvider = document.querySelector("#ai-provider");
  const aiBaseUrl = document.querySelector("#ai-base-url");
  const aiModelName = document.querySelector("#ai-model-name");
  const aiApiKey = document.querySelector("#ai-api-key");
  const aiSaveKey = document.querySelector("#ai-save-key");
  const aiVerifyKey = document.querySelector("#ai-verify-key");
  const apiKeyStatus = document.querySelector("#api-key-status");
  const openApiKeyPanel = document.querySelector("#open-api-key-panel");
  const closeApiKeyPanel = document.querySelector("#close-api-key-panel");
  const apiKeyModal = document.querySelector("#api-key-modal");
  const apiKeyBackdrop = document.querySelector("#api-key-backdrop");
  const aiCompanion = document.querySelector("#ai-companion");
  const aiChatToggle = document.querySelector("#ai-chat-toggle");
  const aiChatWindow = document.querySelector("#ai-chat-window");
  const closeAiChat = document.querySelector("#close-ai-chat");

  const TAU = Math.PI * 2;
  const DEG = Math.PI / 180;
  const DPR_LIMIT = 1.75;

  const planets = [
    ["mercury", "水星", "岩质行星", 0.42, 6.5, "0.39 AU", "88 天", 4.15, ["#9c9387", "#d9c9af", "#5d5854"], "水星最靠近太阳，昼夜温差极端，表面布满撞击坑。"],
    ["venus", "金星", "温室世界", 0.72, 9.3, "0.72 AU", "225 天", 1.62, ["#d9a85c", "#fff0bd", "#8c5f31"], "金星拥有浓厚二氧化碳大气，表面温度比水星更高。"],
    ["earth", "地球", "蓝色家园", 0.76, 12.4, "1.00 AU", "365 天", 1, ["#2f8cff", "#71d49f", "#f6f4df"], "地球拥有稳定液态水、活跃气候系统和已知唯一的复杂生命圈。"],
    ["mars", "火星", "红色荒原", 0.55, 15.7, "1.52 AU", "687 天", 0.53, ["#cf5f3f", "#f2a46f", "#6d3329"], "火星有太阳系最高的火山奥林帕斯山，也保留了古老河谷痕迹。"],
    ["jupiter", "木星", "气态巨行星", 1.75, 21.4, "5.20 AU", "11.9 年", 0.084, ["#d6b48d", "#f3ddbd", "#9d6f4e"], "木星质量巨大，强引力影响小行星带，并拥有醒目的大红斑风暴。"],
    ["saturn", "土星", "环系行星", 1.48, 28.1, "9.58 AU", "29.5 年", 0.034, ["#dfc68b", "#fff1be", "#9f8051"], "土星以广阔明亮的冰尘环闻名，主要由冰粒与岩尘构成。", true],
    ["uranus", "天王星", "横躺自转", 1.08, 34.5, "19.2 AU", "84 年", 0.012, ["#7fe5e5", "#c7ffff", "#4a9eb3"], "天王星自转轴几乎横躺，季节变化极其漫长。"],
    ["neptune", "海王星", "深蓝远方", 1.04, 40.6, "30.1 AU", "165 年", 0.006, ["#356dff", "#87a5ff", "#1c2f89"], "海王星风速惊人，是太阳系已知最遥远的行星。"]
  ].map(([id, name, subtitle, radius, distance, au, period, speed, colors, fact, rings], index) => ({
    id,
    name,
    subtitle,
    radius,
    distance,
    au,
    period,
    speed,
    colors,
    fact,
    rings: Boolean(rings),
    angle: (index / 8) * TAU,
    spin: Math.random() * TAU,
    points: []
  }));

  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    running: true,
    labels: true,
    orbits: true,
    solo: false,
    speed: Number(speedRange.value),
    glow: Number(glowRange.value),
    yaw: -38 * DEG,
    pitch: 24 * DEG,
    yawVelocity: 0,
    pitchVelocity: 0,
    distance: 58,
    desiredDistance: 58,
    target: { x: 0, y: 0, z: 0 },
    desiredTarget: { x: 0, y: 0, z: 0 },
    soloYaw: 0,
    soloPitch: -12 * DEG,
    soloYawVelocity: 0,
    soloPitchVelocity: 0,
    soloZoom: 1,
    desiredSoloZoom: 1,
    focused: "sun",
    lastTapId: "",
    lastTapTime: 0,
    pointer: null,
    pinch: null,
    lastFrame: performance.now(),
    fpsTime: performance.now(),
    fpsFrames: 0,
    gesture: false,
    gestureCenter: null,
    gestureSize: null,
    gestureConfidence: 0,
    annotation: null
  };

  const stars = makeStars(900);
  const cometDust = makeStars(260, 45, 120);
  const projectedPlanets = new Map();
  const aiCache = new Map();
  let aiRequestId = 0;
  let csrfToken = "";
  let connectedAiModel = "";
  let hasStoredApiKey = false;
  let aiTypingTimer = 0;

  const AI_CONFIG = {
    endpoint: window.SOLAR_AI_ENDPOINT || "/api/ai",
    timeoutMs: 38000,
    model: window.SOLAR_AI_MODEL || "default"
  };

  const AI_PROVIDER_PRESETS = {
    deepseek: {
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-v4-pro"
    },
    qwen: {
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: "qwen-plus"
    },
    custom: {
      baseUrl: "",
      model: ""
    }
  };

  const AI_RESPONSE_INSTRUCTION = [
    "你是太阳系 3D 科普应用内的中文讲解助手。",
    "回答要像正式 App 信息面板内容：简洁、准确、克制，不要闲聊。",
    "请根据用户问题自动选择最合适的输出结构，不要固定套用同一个模板：",
    "",
    "- 事实类问题：先给 1-2 句直接结论，再补充必要背景。",
    "- 对比类问题：使用“结论 + 对比要点”，可用短列表。",
    "- 原因/机制类问题：使用“现象 -> 原因 -> 影响”的解释结构。",
    "- 操作/探索类问题：使用简短步骤。",
    "- 开放科普类问题：使用小标题和自然段，但不要堆砌。",
    "",
    "格式要求：可以使用 Markdown 小标题和项目符号；不要使用表格；优先结合当前选中星球；不确定时说明限制；整体控制在 80-220 字。"
  ].join("\n");

  function makeStars(count, min = 65, max = 280) {
    const out = [];
    for (let i = 0; i < count; i += 1) {
      const r = random(min, max);
      const theta = Math.random() * TAU;
      const phi = Math.acos(random(-1, 1));
      out.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
        size: random(0.55, 1.65),
        alpha: random(0.25, 0.95),
        warm: Math.random() > 0.72
      });
    }
    return out;
  }

  function makeSpherePoints(planet) {
    const count = Math.round(150 + planet.radius * 150);
    planet.points = [];
    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      planet.points.push({
        x: Math.cos(theta) * ring,
        y,
        z: Math.sin(theta) * ring,
        color: planet.colors[i % planet.colors.length],
        size: random(0.65, 1.3)
      });
    }
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function resize() {
    const rect = sceneWrap.getBoundingClientRect();
    state.width = Math.max(320, rect.width);
    state.height = Math.max(320, rect.height);
    state.dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function project(point) {
    const dx = point.x - state.target.x;
    const dy = point.y - state.target.y;
    const dz = point.z - state.target.z;
    const cy = Math.cos(state.yaw);
    const sy = Math.sin(state.yaw);
    const cp = Math.cos(state.pitch);
    const sp = Math.sin(state.pitch);
    const x1 = cy * dx - sy * dz;
    const z1 = sy * dx + cy * dz;
    const y1 = cp * dy - sp * z1;
    const z2 = sp * dy + cp * z1 + state.distance;
    if (z2 < 0.6) return null;
    const focal = Math.min(state.width, state.height) * 0.82;
    const scale = focal / z2;
    return {
      x: state.width * 0.5 + x1 * scale,
      y: state.height * 0.5 - y1 * scale,
      z: z2,
      scale
    };
  }

  function worldForPlanet(planet) {
    return {
      x: Math.cos(planet.angle) * planet.distance,
      y: 0,
      z: Math.sin(planet.angle) * planet.distance * 0.985
    };
  }

  function focusedPlanet() {
    return planets.find((planet) => planet.id === state.focused) || planets[2];
  }

  function planetPayload(id = state.focused) {
    if (id === "sun") {
      return {
        id: "sun",
        name: "太阳",
        subtitle: "恒星核心",
        au: "0 AU",
        period: "-",
        fact: "太阳占据太阳系绝大部分质量，它的引力让八大行星沿各自轨道运行。"
      };
    }
    const planet = planets.find((item) => item.id === id) || focusedPlanet();
    return {
      id: planet.id,
      name: planet.name,
      subtitle: planet.subtitle,
      au: planet.au,
      period: planet.period,
      fact: planet.fact
    };
  }

  function aiCanUseRemote() {
    return location.protocol === "http:" || location.protocol === "https:";
  }

  async function getCsrfToken(forceRefresh = false) {
    if (forceRefresh) csrfToken = "";
    if (csrfToken) return csrfToken;
    if (!aiCanUseRemote()) return "";
    const response = await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error("无法获取 CSRF token。");
    const data = await response.json();
    csrfToken = String(data.csrfToken || "");
    return csrfToken;
  }

  async function secureJsonFetch(url, payload = {}, retryOnCsrf = true) {
    const token = await getCsrfToken();
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 403 && retryOnCsrf && /csrf/i.test(String(data.error || ""))) {
      await getCsrfToken(true);
      return secureJsonFetch(url, payload, false);
    }
    if (!response.ok) {
      if (response.status === 401 || data.code === "AI_API_ERROR") {
        throw new Error(data.details || data.error || "认证失败：请确认 API Key 与模型服务、Endpoint、模型名称匹配。");
      }
      throw new Error(data.error || `请求失败：${response.status}`);
    }
    return data;
  }

  function readAiServiceConfig() {
    return {
      provider: aiProvider.value,
      baseUrl: aiBaseUrl.value.trim(),
      model: aiModelName.value.trim()
    };
  }

  function applyAiServiceConfig(config = {}) {
    const provider = config.provider || "deepseek";
    const preset = AI_PROVIDER_PRESETS[provider] || AI_PROVIDER_PRESETS.custom;
    aiProvider.value = provider in AI_PROVIDER_PRESETS ? provider : "custom";
    aiBaseUrl.value = config.baseUrl || preset.baseUrl;
    aiModelName.value = config.model || preset.model;
  }

  function providerLabel(provider) {
    if (provider === "qwen") return "通义千问";
    if (provider === "deepseek") return "DeepSeek";
    return "自定义模型服务";
  }

  function applyProviderPreset() {
    const preset = AI_PROVIDER_PRESETS[aiProvider.value] || AI_PROVIDER_PRESETS.custom;
    if (preset.baseUrl) aiBaseUrl.value = preset.baseUrl;
    if (preset.model) aiModelName.value = preset.model;
  }

  async function refreshApiKeyStatus() {
    if (!aiCanUseRemote()) {
      apiKeyStatus.textContent = "当前为 file:// 离线模式。需要通过本地后端打开页面才能保存 API Key。";
      return;
    }
    try {
      await getCsrfToken();
      const response = await fetch("/api/key-status", {
        method: "GET",
        credentials: "same-origin"
      });
      const data = await response.json();
      hasStoredApiKey = Boolean(data.configured);
      applyAiServiceConfig(data);
      if (data.configured) {
        apiKeyStatus.textContent = `已配置 ${providerLabel(data.provider)}：${data.maskedKey}；模型：${data.model}${data.persistentStorage ? "，已加密保存。" : "，当前为进程内存保存。"}`;
      } else {
        apiKeyStatus.textContent = data.persistentStorage
          ? "后端已启用加密存储，请输入 API Key。"
          : "未配置 API Key。设置 API_KEY_ENCRYPTION_SECRET 后可加密持久化。";
      }
    } catch {
      apiKeyStatus.textContent = "后端未连接，AI 将使用离线知识库。";
    }
  }

  async function saveApiKey() {
    const apiKey = aiApiKey.value.trim();
    if (!apiKey && !hasStoredApiKey) {
      apiKeyStatus.textContent = "请输入 API Key。";
      return;
    }
    aiSaveKey.disabled = true;
    apiKeyStatus.textContent = "正在保存 API 配置...";
    try {
      const data = await secureJsonFetch("/api/set-api-key", {
        apiKey,
        ...readAiServiceConfig()
      });
      hasStoredApiKey = true;
      aiApiKey.value = "";
      applyAiServiceConfig(data);
      connectedAiModel = data.model || connectedAiModel;
      updateAiModelLine();
      apiKeyStatus.textContent = `${data.message} 当前服务：${providerLabel(data.provider)}；模型：${data.model}；Key：${data.maskedKey}`;
      aiCache.clear();
    } catch (error) {
      apiKeyStatus.textContent = error instanceof Error ? error.message : "API Key 保存失败。";
    } finally {
      aiSaveKey.disabled = false;
    }
  }

  async function verifyApiKey() {
    aiVerifyKey.disabled = true;
    apiKeyStatus.textContent = "正在验证 API Key...";
    try {
      const data = await secureJsonFetch("/api/verify-api-key", {
        apiKey: aiApiKey.value.trim(),
        ...readAiServiceConfig()
      });
      connectedAiModel = data.model || connectedAiModel;
      updateAiModelLine();
      apiKeyStatus.textContent = `${data.message} 模型：${data.model || AI_CONFIG.model}`;
    } catch (error) {
      apiKeyStatus.textContent = error instanceof Error ? error.message : "API Key 验证失败。";
    } finally {
      aiVerifyKey.disabled = false;
    }
  }

  function openApiKeyModal() {
    apiKeyModal.hidden = false;
    refreshApiKeyStatus();
    window.setTimeout(() => aiApiKey.focus(), 0);
  }

  function closeApiKeyModal() {
    apiKeyModal.hidden = true;
  }

  function openAiChat(focusQuestion = false) {
    aiChatWindow.hidden = false;
    aiCompanion.classList.add("open");
    aiChatToggle.setAttribute("aria-expanded", "true");
    if (focusQuestion) {
      window.setTimeout(() => aiQuestion.focus(), 0);
    }
  }

  function closeAiChatWindow() {
    aiChatWindow.hidden = true;
    aiCompanion.classList.remove("open");
    aiChatToggle.setAttribute("aria-expanded", "false");
  }

  function toggleAiChat() {
    if (aiChatWindow.hidden) openAiChat(true);
    else closeAiChatWindow();
  }

  function updateAiModelLine(model = connectedAiModel) {
    const current = String(model || "").trim();
    if (current) {
      aiModelLine.textContent = `当前模型：${current}`;
      aiModelLine.classList.add("connected");
      return;
    }
    aiModelLine.textContent = AI_CONFIG.model && AI_CONFIG.model !== "default"
      ? `当前模型：${AI_CONFIG.model}`
      : "当前模型：等待连接";
    aiModelLine.classList.remove("connected");
  }

  function openDrawerMenu() {
    controlPanel.classList.add("open");
    controlPanel.setAttribute("aria-hidden", "false");
    controlPanel.removeAttribute("inert");
    openControlMenu.setAttribute("aria-expanded", "true");
    drawerBackdrop.hidden = false;
  }

  function closeDrawerMenu() {
    controlPanel.classList.remove("open");
    controlPanel.setAttribute("aria-hidden", "true");
    controlPanel.setAttribute("inert", "");
    openControlMenu.setAttribute("aria-expanded", "false");
    drawerBackdrop.hidden = true;
  }

  function setAiLoading(message, reveal = true) {
    if (reveal) openAiChat(false);
    stopAiTyping();
    aiAnswer.classList.add("loading");
    aiAnswer.textContent = message;
    aiAsk.disabled = true;
  }

  function setAiResult(text, source, model = "") {
    if (model && model !== "default") connectedAiModel = model;
    if (source === "fallback") {
      aiModelLine.textContent = "当前模型：本地知识库（远程 AI 未连接）";
      aiModelLine.classList.remove("connected");
    } else {
      updateAiModelLine();
    }
    aiAnswer.classList.remove("loading");
    aiAsk.disabled = false;
    const normalized = normalizeAiAnswer(text);
    updateSceneAnnotation(normalized);
    typeAiAnswer(normalized);
  }

  function setAiError(text) {
    stopAiTyping();
    aiAnswer.classList.remove("loading");
    aiAnswer.textContent = text;
    aiAsk.disabled = false;
  }

  function stopAiTyping() {
    if (aiTypingTimer) {
      window.clearTimeout(aiTypingTimer);
      aiTypingTimer = 0;
    }
  }

  function typeAiAnswer(text) {
    stopAiTyping();
    const content = String(text || "");
    aiAnswer.replaceChildren();
    if (!content) return;

    let index = 0;
    const step = () => {
      const chunkSize = content.charCodeAt(index) < 128 ? 2 : 1;
      renderStructuredAiAnswer(content.slice(0, index + chunkSize));
      index += chunkSize;
      if (index < content.length) {
        const char = content[index - 1];
        const delay = /[。！？.!?]/.test(char) ? 95 : /[，、,;]/.test(char) ? 55 : 22;
        aiTypingTimer = window.setTimeout(step, delay);
      } else {
        aiTypingTimer = 0;
      }
    };

    step();
  }

  function renderStructuredAiAnswer(text) {
    const fragment = document.createDocumentFragment();
    const lines = String(text || "").split(/\r?\n/);
    let list = null;
    let paragraphBuffer = [];

    const flushParagraph = () => {
      const paragraph = paragraphBuffer.join(" ").trim();
      paragraphBuffer = [];
      if (!paragraph) return;
      const node = document.createElement("p");
      node.className = "ai-paragraph";
      node.textContent = paragraph;
      fragment.appendChild(node);
    };

    const closeList = () => {
      if (list) {
        fragment.appendChild(list);
        list = null;
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph();
        closeList();
        continue;
      }

      if (line.startsWith("## ")) {
        flushParagraph();
        closeList();
        const title = document.createElement("h3");
        title.className = "ai-section-heading";
        title.textContent = line.replace(/^##\s+/, "");
        fragment.appendChild(title);
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        flushParagraph();
        if (!list) {
          list = document.createElement("ul");
          list.className = "ai-list";
        }
        const item = document.createElement("li");
        item.textContent = line.replace(/^[-*]\s+/, "");
        list.appendChild(item);
        continue;
      }

      closeList();
      paragraphBuffer.push(line);
    }

    flushParagraph();
    closeList();
    aiAnswer.replaceChildren(fragment);
  }

  function extractAiAnnotation(text) {
    const sections = {};
    let active = "";
    const bulletLines = [];
    const plainLines = [];
    for (const rawLine of String(text || "").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const heading = line.match(/^##\s+(.+)$/);
      if (heading) {
        active = heading[1].trim();
        sections[active] = [];
        continue;
      }
      if (active) sections[active].push(line);
      if (/^[-*]\s+/.test(line)) {
        bulletLines.push(line.replace(/^[-*]\s+/, "").trim());
      } else if (!line.startsWith("#")) {
        plainLines.push(line.replace(/^[-*]\s+/, "").trim());
      }
    }

    const preferredSummary =
      sections["简要结论"] ||
      sections["结论"] ||
      sections["回答"] ||
      sections["直接结论"] ||
      [];
    const preferredPoints =
      sections["关键信息"] ||
      sections["要点"] ||
      sections["对比要点"] ||
      sections["步骤"] ||
      [];
    const summaryText = preferredSummary.join(" ").trim() || plainLines.join(" ").trim();
    const sentences = summaryText
      .split(/(?<=[。！？.!?])\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
    const summary = (sentences[0] || summaryText).slice(0, 96);
    const points = (preferredPoints.length ? preferredPoints : bulletLines)
      .map((item) => item.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return {
      summary,
      points
    };
  }

  function updateSceneAnnotation(text) {
    const planet = planetPayload();
    const annotation = extractAiAnnotation(text);
    const summary = annotation.summary || planet.fact;
    const points = annotation.points.length
      ? annotation.points
      : [`轨道半径约 ${planet.au}`, `公转周期约 ${planet.period}`].filter((item) => !item.includes("-"));

    if (!summary) {
      state.annotation = null;
      sceneAiAnnotation.hidden = true;
      return;
    }

    state.annotation = {
      planetId: planet.id,
      title: planet.name,
      summary,
      points
    };

    annotationTitle.textContent = planet.name;
    annotationSummary.textContent = summary;
    annotationPoints.replaceChildren(
      ...points.map((point) => {
        const item = document.createElement("li");
        item.textContent = point;
        return item;
      })
    );
    sceneAiAnnotation.hidden = false;
  }

  function clearSceneAnnotation() {
    state.annotation = null;
    sceneAiAnnotation.hidden = true;
  }

  function updateSceneAnnotationPosition() {
    if (!state.annotation) {
      sceneAiAnnotation.hidden = true;
      return;
    }

    const marker = projectedPlanets.get(state.annotation.planetId);
    if (!marker) {
      sceneAiAnnotation.hidden = true;
      return;
    }

    sceneAiAnnotation.hidden = false;
    const cardWidth = Math.min(320, Math.max(260, state.width * 0.28));
    const preferRight = marker.x < state.width * 0.58;
    const gap = Math.max(34, marker.r + 24);
    let x = preferRight ? marker.x + gap : marker.x - gap - cardWidth;
    let y = marker.y - 88;
    x = clamp(x, 18, state.width - cardWidth - 18);
    y = clamp(y, 128, state.height - 230);
    const anchorX = marker.x;
    const anchorY = marker.y;
    const lineX = anchorX < x ? 0 : anchorX > x + cardWidth ? cardWidth : clamp(anchorX - x, 18, cardWidth - 18);
    const lineY = anchorY < y ? 0 : anchorY > y + 150 ? 150 : clamp(anchorY - y, 18, 150);
    const dx = anchorX - x - lineX;
    const dy = anchorY - y - lineY;
    const length = Math.max(16, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    sceneAiAnnotation.style.setProperty("--annotation-x", `${x}px`);
    sceneAiAnnotation.style.setProperty("--annotation-y", `${y}px`);
    sceneAiAnnotation.style.setProperty("--annotation-width", `${cardWidth}px`);
    sceneAiAnnotation.style.setProperty("--line-x", `${lineX}px`);
    sceneAiAnnotation.style.setProperty("--line-y", `${lineY}px`);
    sceneAiAnnotation.style.setProperty("--line-length", `${length}px`);
    sceneAiAnnotation.style.setProperty("--line-angle", `${angle}rad`);
  }

  function formatAiAnswer({ summary, bullets = [], detail = "" }) {
    const cleanBullets = bullets
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 4);
    const list = cleanBullets.length ? cleanBullets : ["可继续选择星球或输入问题深入了解。"];
    return [
      "## 简要结论",
      String(summary || "当前内容可以作为科普信息继续浏览。").trim(),
      "",
      "## 关键信息",
      ...list.map((item) => `- ${item}`),
      "",
      "## 补充说明",
      String(detail || "这些信息会结合当前选中的星球和 3D 模型状态展示。").trim()
    ].join("\n");
  }

  function normalizeAiAnswer(text) {
    const raw = String(text || "").replace(/\|.*\|/g, "").trim();
    if (!raw) return "";
    if (raw.length >= 20) {
      return raw;
    }

    const lines = raw
      .split(/\r?\n/)
      .map((line) =>
        line
          .replace(/^#{1,6}\s*/, "")
          .replace(/^(简要结论|关键信息|补充说明)[:：]?/, "")
          .replace(/^[-*]\s*/, "")
          .trim()
      )
      .filter(Boolean);
    const joined = lines.join(" ");
    const sentences = joined
      .split(/(?<=[。！？!?])\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

    const summary = sentences.slice(0, 2).join("");
    const bulletSource = lines.length > 1 ? lines : sentences.slice(1);
    const bullets = bulletSource
      .filter((item) => item !== summary)
      .map((item) => item.replace(/[。！？!?]$/, ""))
      .filter(Boolean)
      .slice(0, 4);
    const detail = sentences.slice(2).join("") || sentences[1] || "该回答已整理为适合应用面板阅读的结构。";

    return formatAiAnswer({ summary, bullets, detail });
  }

  function buildAiPrompt(question, planet, eventType) {
    return {
      model: AI_CONFIG.model,
      eventType,
      question,
      planet,
      instruction: AI_RESPONSE_INSTRUCTION
    };
  }

  async function callAiProvider(question, planet, eventType) {
    if (!aiCanUseRemote()) {
      return {
        source: "fallback",
        text: localAiAnswer(question, planet, eventType)
      };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);
    try {
      let token = await getCsrfToken();
      let response = await fetch(AI_CONFIG.endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token
        },
        body: JSON.stringify(buildAiPrompt(question, planet, eventType)),
        signal: controller.signal
      });
      if (response.status === 403) {
        token = await getCsrfToken(true);
        response = await fetch(AI_CONFIG.endpoint, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token
          },
          body: JSON.stringify(buildAiPrompt(question, planet, eventType)),
          signal: controller.signal
        });
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.code || `AI endpoint returned ${response.status}`);
      }
      return {
        source: "remote",
        model: String(data.model || "").trim(),
        text: String(data.answer || data.text || data.message || "").trim() || localAiAnswer(question, planet, eventType)
      };
    } catch (error) {
      const reason = error?.name === "AbortError" ? "远程 AI 响应超时" : error instanceof Error ? error.message : "远程 AI 请求失败";
      console.warn("AI remote request failed; using local fallback:", reason);
      return {
        source: "fallback",
        error: reason,
        text: localAiAnswer(question, planet, eventType)
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function localAiAnswer(question, planet, eventType) {
    const q = question.toLowerCase();
    const intro = eventType === "selection"
      ? `你选中了${planet.name}。${planet.fact}`
      : `${planet.name}：${planet.fact}`;
    if (q.includes("orbit") || q.includes("公转") || q.includes("多久") || q.includes("周期")) {
      return formatAiAnswer({
        summary: `${planet.name}绕太阳运行的周期约为 ${planet.period}。`,
        bullets: [
          `轨道半径约 ${planet.au}`,
          `公转周期约 ${planet.period}`,
          "模型速度已压缩显示"
        ],
        detail: "3D 模型中的轨道速度不是按真实时间等比播放，而是为了让不同星球的运行差异更容易观察。"
      });
    }
    if (q.includes("surface") || q.includes("表面") || q.includes("地表")) {
      if (planet.id === "mars") {
        return formatAiAnswer({
          summary: "火星表面以铁氧化物尘土为主，因此呈红色。",
          bullets: ["有沙丘和撞击坑", "保留古老河道痕迹", "极区存在冰冠"],
          detail: "这些地貌让火星成为研究早期行星环境和未来探测任务的重要目标。"
        });
      }
      if (planet.id === "earth") {
        return formatAiAnswer({
          summary: "地球表面由海洋、陆地、冰盖和大气共同塑造。",
          bullets: ["液态水覆盖广泛", "板块运动持续改变地貌", "生命活动影响大气"],
          detail: "水循环、地质活动和生物圈共同作用，使地球与其他行星明显不同。"
        });
      }
      if (planet.id === "venus") {
        return formatAiAnswer({
          summary: "金星表面处在高温高压环境中，探测难度很高。",
          bullets: ["浓厚大气遮挡地表", "遍布火山平原和山地", "地表温度极高"],
          detail: "由于环境极端，着陆探测器通常只能在金星地表工作较短时间。"
        });
      }
      if (planet.id === "mercury") {
        return formatAiAnswer({
          summary: "水星表面类似月球，布满撞击坑和平原。",
          bullets: ["几乎没有大气", "昼夜温差极端", "地表保留大量撞击记录"],
          detail: "缺少浓厚大气保护，使水星表面长期直接暴露在太阳辐射和撞击环境中。"
        });
      }
      return formatAiAnswer({
        summary: `${planet.name}的“表面”不一定像岩质行星那样坚硬。`,
        bullets: ["可能是厚重大气", "可能包含云层结构", "深层多为流体形态"],
        detail: "气态或冰巨行星在模型中以可观察的外层云带呈现，真实内部结构更复杂。"
      });
    }
    if (q.includes("life") || q.includes("生命") || q.includes("适合居住")) {
      return formatAiAnswer({
        summary: `${planet.name}是否适合生命，需要综合判断环境条件。`,
        bullets: ["液态水是关键条件", "稳定能量来源很重要", "大气和辐射环境会限制生命"],
        detail: "太阳系中地球最适合复杂生命，火星和部分外行星卫星更常被作为潜在宜居环境研究对象。"
      });
    }
    return formatAiAnswer({
      summary: intro,
      bullets: [
        `轨道半径约 ${planet.au}`,
        `公转周期约 ${planet.period}`,
        "可继续询问表面或探测难点"
      ],
      detail: "当前回答来自本地知识兜底，用于在外部 AI 不可用时保持界面仍可提供基础科普信息。"
    });
  }

  async function requestAiInsight(question, eventType = "manual") {
    const planet = planetPayload();
    const normalized = question.trim() || `介绍${planet.name}最值得注意的科学特征。`;
    const key = `${eventType}:${planet.id}:${normalized}`;
    const requestId = ++aiRequestId;
    if (aiCache.has(key)) {
      setAiResult(aiCache.get(key).text, aiCache.get(key).source, aiCache.get(key).model);
      return;
    }
    setAiLoading(
      eventType === "selection" ? `正在生成${planet.name}的 AI 科普补充...` : "正在生成回答...",
      eventType !== "selection"
    );
    const result = await callAiProvider(normalized, planet, eventType);
    if (requestId !== aiRequestId) return;
    aiCache.set(key, result);
    setAiResult(result.text, result.source, result.model);
  }

  function schedulePlanetInsight() {
    window.clearTimeout(schedulePlanetInsight.timer);
    schedulePlanetInsight.timer = window.setTimeout(() => {
      requestAiInsight("", "selection");
    }, 260);
  }

  function drawBackground(now) {
    const gradient = ctx.createRadialGradient(
      state.width * 0.48,
      state.height * 0.45,
      20,
      state.width * 0.48,
      state.height * 0.45,
      Math.max(state.width, state.height)
    );
    gradient.addColorStop(0, "#10151f");
    gradient.addColorStop(0.34, "#06080d");
    gradient.addColorStop(1, "#020307");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);
    drawStars(stars, 1, now);
    drawStars(cometDust, 0.45, now * 0.65);
  }

  function drawStars(items, alphaMul, now) {
    for (const star of items) {
      const rotated = {
        x: star.x * Math.cos(now * 0.00001) - star.z * Math.sin(now * 0.00001),
        y: star.y,
        z: star.x * Math.sin(now * 0.00001) + star.z * Math.cos(now * 0.00001)
      };
      const p = project(rotated);
      if (!p || p.x < -10 || p.y < -10 || p.x > state.width + 10 || p.y > state.height + 10) continue;
      ctx.globalAlpha = star.alpha * alphaMul;
      ctx.fillStyle = star.warm ? "#ffe1a6" : "#cfe7ff";
      const size = Math.max(1, star.size * p.scale * 0.06);
      ctx.fillRect(p.x, p.y, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function drawSun(now) {
    const center = project({ x: 0, y: 0, z: 0 });
    if (!center) return;
    const radius = Math.max(8, 2.55 * center.scale);
    drawSunBody(center.x, center.y, radius, now);
    projectedPlanets.set("sun", { x: center.x, y: center.y, r: radius, z: center.z });
    if (state.labels) drawLabel("太阳", center.x, center.y - radius - 14, "#ffdc8b");
  }

  function drawSunBody(x, y, radius, now) {
    const pulse = 1 + Math.sin(now * 0.002) * 0.035;
    const glow = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius * 5.3);
    glow.addColorStop(0, "rgba(255, 241, 173, .95)");
    glow.addColorStop(0.2, "rgba(255, 184, 76, .45)");
    glow.addColorStop(0.55, "rgba(255, 107, 42, .13)");
    glow.addColorStop(1, "rgba(255, 107, 42, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 5.3 * pulse, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 220; i += 1) {
      const theta = i * 2.399 + now * 0.00025;
      const rr = Math.sqrt(i / 220) * radius * (0.72 + (i % 17) * 0.018);
      ctx.globalAlpha = 0.48 + (i % 8) * 0.04;
      ctx.fillStyle = i % 3 === 0 ? "#fff7be" : i % 3 === 1 ? "#ffcf66" : "#ff813f";
      ctx.beginPath();
      ctx.arc(x + Math.cos(theta) * rr, y + Math.sin(theta) * rr, Math.max(1.2, radius * 0.028 * state.glow), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawOrbits() {
    if (!state.orbits) return;
    ctx.lineWidth = 1;
    for (const planet of planets) {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 180; i += 1) {
        const t = (i / 180) * TAU;
        const p = project({
          x: Math.cos(t) * planet.distance,
          y: 0,
          z: Math.sin(t) * planet.distance * 0.985
        });
        if (!p) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = planet.id === state.focused ? "rgba(255, 203, 107, .58)" : "rgba(137, 166, 190, .25)";
      ctx.stroke();
    }
  }

  function drawPlanetSystem(planet, now) {
    const centerWorld = worldForPlanet(planet);
    const center = project(centerWorld);
    if (!center) return;
    const radius = Math.max(2.8, planet.radius * center.scale);
    drawPlanetBody(planet, center.x, center.y, radius, planet.spin + now * 0.00035, 0, planet.id === state.focused);
    if (state.labels && radius > 2.5) drawLabel(planet.name, center.x, center.y - radius - 12, planet.colors[1]);
    projectedPlanets.set(planet.id, { x: center.x, y: center.y, r: Math.max(radius, 9), z: center.z });
  }

  function drawPlanetBody(planet, x, y, radius, yaw, pitch, focused) {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const dots = [];

    for (const point of planet.points) {
      const x1 = point.x * cy - point.z * sy;
      const z1 = point.x * sy + point.z * cy;
      const y1 = point.y * cp - z1 * sp;
      const z2 = point.y * sp + z1 * cp;
      if (z2 < -0.86 && radius > 4) continue;
      dots.push({
        x: x + x1 * radius,
        y: y - y1 * radius,
        z: z2,
        color: point.color,
        size: Math.max(0.85, point.size * state.glow * Math.sqrt(radius) * 0.31)
      });
    }

    dots.sort((a, b) => a.z - b.z);
    ctx.globalCompositeOperation = "lighter";
    for (const dot of dots) {
      ctx.globalAlpha = 0.38 + Math.max(0, dot.z) * 0.5;
      ctx.fillStyle = dot.color;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const shade = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.12, x, y, radius * 1.15);
    shade.addColorStop(0, "rgba(255,255,255,.30)");
    shade.addColorStop(0.48, "rgba(255,255,255,.05)");
    shade.addColorStop(1, "rgba(0,0,0,.30)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();

    if (planet.rings) drawRings(x, y, radius, yaw);
    if (focused) drawFocusRing(x, y, radius);
  }

  function drawRings(x, y, radius, spin) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.32 + Math.sin(spin) * 0.08);
    ctx.scale(1, 0.34);
    ctx.strokeStyle = "rgba(255, 226, 169, .5)";
    ctx.lineWidth = Math.max(1, radius * 0.13);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 2.1, radius * 1.02, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, .22)";
    ctx.lineWidth = Math.max(1, radius * 0.045);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.58, radius * 0.77, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawFocusRing(x, y, radius) {
    ctx.strokeStyle = "rgba(94, 234, 212, .78)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 8, 0, TAU);
    ctx.stroke();
  }

  function drawSolo(now) {
    const planet = focusedPlanet();
    const x = state.width * 0.5;
    const y = state.height * 0.52;
    const radius = Math.min(state.width, state.height) * 0.21 * state.soloZoom;

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = "rgba(94, 234, 212, .28)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.arc(x, y, radius * (1 + i * 0.18), 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    if (state.focused === "sun") {
      drawSunBody(x, y, radius * 0.72, now);
    } else {
      drawPlanetBody(planet, x, y, radius, state.soloYaw + planet.spin, state.soloPitch, true);
    }

    drawSoloCaption(planet);
    projectedPlanets.set(planet.id, { x, y, r: radius, z: 1 });
  }

  function drawSoloCaption(planet) {
    const title = state.focused === "sun" ? "太阳单体展示" : `${planet.name}单体展示`;
    const body = state.focused === "sun" ? "滚轮缩放，拖拽旋转光球，点击“单”返回太阳系全景。" : "滚轮缩放，拖拽旋转星球，切换右侧列表可查看其他星球。";
    const maxW = Math.min(520, state.width - 48);
    const x = state.width * 0.5;
    const y = state.height - 82;
    ctx.font = "800 18px Microsoft YaHei, Segoe UI, sans-serif";
    const titleW = ctx.measureText(title).width;
    ctx.font = "500 13px Microsoft YaHei, Segoe UI, sans-serif";
    const bodyW = ctx.measureText(body).width;
    const w = Math.min(maxW, Math.max(titleW, bodyW) + 34);
    roundRect(x - w / 2, y - 33, w, 66, 8);
    ctx.fillStyle = "rgba(5, 7, 11, .58)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.14)";
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = planet.colors?.[1] || "#ffdc8b";
    ctx.font = "800 18px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText(title, x, y - 10);
    ctx.fillStyle = "rgba(218, 226, 238, .86)";
    ctx.font = "500 13px Microsoft YaHei, Segoe UI, sans-serif";
    ctx.fillText(body, x, y + 15);
  }

  function drawLabel(text, x, y, color) {
    ctx.font = "700 12px Microsoft YaHei, Segoe UI, sans-serif";
    const w = ctx.measureText(text).width + 16;
    const h = 23;
    const bx = x - w / 2;
    const by = y - h / 2;
    ctx.fillStyle = "rgba(5, 7, 11, .68)";
    roundRect(bx, by, w, h, 11);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 0.5);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function updateMotion(delta) {
    if (state.running) {
      for (const planet of planets) {
        planet.angle += delta * planet.speed * state.speed * 0.42;
        planet.spin += delta * (0.5 + planet.speed * 0.05);
      }
    }

    if (!state.pointer) {
      state.yaw += state.yawVelocity;
      state.pitch += state.pitchVelocity;
      state.soloYaw += state.soloYawVelocity;
      state.soloPitch += state.soloPitchVelocity;
      const dragDamping = Math.pow(0.035, delta);
      state.yawVelocity *= dragDamping;
      state.pitchVelocity *= dragDamping;
      state.soloYawVelocity *= dragDamping;
      state.soloPitchVelocity *= dragDamping;
    }

    const ease = 1 - Math.pow(0.001, delta);
    state.target.x = lerp(state.target.x, state.desiredTarget.x, ease);
    state.target.y = lerp(state.target.y, state.desiredTarget.y, ease);
    state.target.z = lerp(state.target.z, state.desiredTarget.z, ease);
    state.distance = lerp(state.distance, state.desiredDistance, ease);
    state.soloZoom = lerp(state.soloZoom, state.desiredSoloZoom, ease);
    state.pitch = clamp(state.pitch, -72 * DEG, 72 * DEG);
    state.soloPitch = clamp(state.soloPitch, -70 * DEG, 70 * DEG);
  }

  function render(now) {
    const delta = Math.min(0.05, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    updateMotion(delta);
    projectedPlanets.clear();
    drawBackground(now);

    if (state.solo) {
      drawSolo(now);
    } else {
      drawOrbits();
      drawSun(now);
      const renderList = planets
        .map((planet) => ({ planet, point: project(worldForPlanet(planet)) }))
        .filter((item) => item.point)
        .sort((a, b) => b.point.z - a.point.z);
      for (const item of renderList) drawPlanetSystem(item.planet, now);
    }

    updateSceneAnnotationPosition();

    state.fpsFrames += 1;
    if (now - state.fpsTime > 900) {
      const mode = state.solo ? "单体展示" : "轨道巡航";
      controlStatus.textContent = state.running ? `${mode} · ${state.fpsFrames} fps` : `${mode} · 已暂停`;
      state.fpsFrames = 0;
      state.fpsTime = now;
    }

    requestAnimationFrame(render);
  }

  function focusPlanet(id) {
    const previousFocus = state.focused;
    state.focused = id;
    if (previousFocus !== id) clearSceneAnnotation();
    document.querySelectorAll(".planet-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.planet === id);
    });

    if (id === "sun") {
      state.desiredTarget = { x: 0, y: 0, z: 0 };
      state.desiredDistance = 58;
      planetChip.textContent = "太阳";
      planetName.textContent = "恒星核心";
      planetFact.textContent = "太阳占据太阳系绝大部分质量，它的引力让八大行星沿各自轨道运行。";
      planetDistance.textContent = "0 AU";
      planetPeriod.textContent = "-";
      focusSummary.textContent = state.solo ? "当前为太阳单体展示。拖拽旋转，滚轮缩放。" : "当前聚焦太阳。拖拽旋转视角，滚轮或双指捏合可连续缩放。";
      schedulePlanetInsight();
      return;
    }

    const planet = planets.find((item) => item.id === id);
    const world = worldForPlanet(planet);
    state.desiredTarget = { ...world };
    state.desiredDistance = Math.max(5.5, planet.radius * 8);
    planetChip.textContent = planet.subtitle;
    planetName.textContent = planet.name;
    planetFact.textContent = planet.fact;
    planetDistance.textContent = planet.au;
    planetPeriod.textContent = planet.period;
    focusSummary.textContent = state.solo
      ? `当前为${planet.name}单体展示。拖拽旋转星球，滚轮缩放细节。`
      : `当前聚焦${planet.name}。可继续拖拽、滑动、捏合，或点选其他星球切换科普视角。`;
    schedulePlanetInsight();
  }

  function buildButtons() {
    planetList.textContent = "";
    for (const planet of planets) {
      const button = document.createElement("button");
      button.className = "planet-button";
      button.type = "button";
      button.dataset.planet = planet.id;
      button.innerHTML = `${planet.name}<span>${planet.subtitle}</span>`;
      button.addEventListener("click", () => focusPlanet(planet.id));
      planetList.appendChild(button);
    }
  }

  function toggleSoloMode(force) {
    state.solo = typeof force === "boolean" ? force : !state.solo;
    toggleSolo.classList.toggle("active", state.solo);
    state.desiredSoloZoom = 1;
    state.soloYawVelocity = 0;
    state.soloPitchVelocity = 0;
    if (state.solo && state.focused === "sun") focusPlanet("earth");
    else focusPlanet(state.focused);
  }

  function screenToSelection(x, y) {
    let selected = null;
    let best = Infinity;
    for (const [id, p] of projectedPlanets) {
      const d = Math.hypot(x - p.x, y - p.y) - p.r;
      if (d < best && d < 12) {
        best = d;
        selected = id;
      }
    }
    if (!selected) return "";
    focusPlanet(selected);
    if (state.solo) state.desiredSoloZoom = 1;
    return selected;
  }

  function onPointerDown(event) {
    canvas.setPointerCapture(event.pointerId);
    state.yawVelocity = 0;
    state.pitchVelocity = 0;
    state.soloYawVelocity = 0;
    state.soloPitchVelocity = 0;
    state.pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      lastTime: performance.now(),
      time: performance.now()
    };
  }

  function onPointerMove(event) {
    if (!state.pointer || state.pointer.id !== event.pointerId || state.pinch) return;
    const now = performance.now();
    const dt = Math.max(16, now - state.pointer.lastTime);
    const dx = event.clientX - state.pointer.x;
    const dy = event.clientY - state.pointer.y;
    if (state.solo) {
      state.soloYaw += dx * 0.008;
      state.soloPitch += dy * 0.006;
      state.soloYawVelocity = (dx * 0.008) * (16 / dt);
      state.soloPitchVelocity = (dy * 0.006) * (16 / dt);
    } else {
      state.yaw += dx * 0.006;
      state.pitch += dy * 0.0048;
      state.yawVelocity = (dx * 0.006) * (16 / dt);
      state.pitchVelocity = (dy * 0.0048) * (16 / dt);
    }
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    state.pointer.lastTime = now;
  }

  function onPointerUp(event) {
    if (!state.pointer || state.pointer.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - state.pointer.startX, event.clientY - state.pointer.startY);
    const elapsed = performance.now() - state.pointer.time;
    if (moved < 8 && elapsed < 330) {
      const rect = canvas.getBoundingClientRect();
      const selected = screenToSelection(event.clientX - rect.left, event.clientY - rect.top);
      const now = performance.now();
      if (selected && selected === state.lastTapId && now - state.lastTapTime < 430) {
        toggleSoloMode(true);
      }
      state.lastTapId = selected;
      state.lastTapTime = now;
    }
    state.pointer = null;
  }

  function onWheel(event) {
    event.preventDefault();
    const factor = Math.exp(event.deltaY * 0.0012);
    if (state.solo) {
      state.desiredSoloZoom = clamp(state.desiredSoloZoom / factor, 0.55, 2.45);
    } else {
      state.desiredDistance = clamp(state.desiredDistance * factor, 1.4, 560);
    }
  }

  function touchDistance(touches) {
    const [a, b] = touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function onTouchStart(event) {
    if (event.touches.length === 2) {
      state.pinch = {
        distance: touchDistance(event.touches),
        zoom: state.solo ? state.desiredSoloZoom : state.desiredDistance
      };
    }
  }

  function onTouchMove(event) {
    if (event.touches.length === 2 && state.pinch) {
      event.preventDefault();
      const next = touchDistance(event.touches);
      const ratio = state.pinch.distance / Math.max(1, next);
      if (state.solo) {
        state.desiredSoloZoom = clamp(state.pinch.zoom / ratio, 0.55, 2.45);
      } else {
        state.desiredDistance = clamp(state.pinch.zoom * ratio, 1.4, 560);
      }
    }
  }

  function onTouchEnd(event) {
    if (event.touches?.length < 2) state.pinch = null;
  }

  function setRunning(next) {
    state.running = next;
    toggleMotion.classList.toggle("active", next);
    toggleMotion.querySelector("span").textContent = next ? "▶" : "Ⅱ";
    controlStatus.textContent = next ? "轨道巡航中" : "已暂停观察";
  }

  function resetCamera() {
    state.yaw = -38 * DEG;
    state.pitch = 24 * DEG;
    state.yawVelocity = 0;
    state.pitchVelocity = 0;
    state.soloYaw = 0;
    state.soloPitch = -12 * DEG;
    state.soloYawVelocity = 0;
    state.soloPitchVelocity = 0;
    state.desiredSoloZoom = 1;
    state.desiredTarget = { x: 0, y: 0, z: 0 };
    toggleSoloMode(false);
    focusPlanet("sun");
  }

  async function toggleGestureCamera() {
    if (state.gesture) {
      stopGestureCamera();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
        audio: false
      });
      gestureVideo.srcObject = stream;
      gestureCard.hidden = false;
      state.gesture = true;
      state.gestureCenter = null;
      state.gestureSize = null;
      state.gestureConfidence = 0;
      applyGesture.lastCenter = null;
      applyGesture.lastSize = null;
      toggleGesture.classList.add("active");
      gestureName.textContent = "识别中";
      gestureHint.textContent = "手掌离开脸部区域，移动会更稳定";
      requestAnimationFrame(detectGestureFrame);
    } catch {
      controlStatus.textContent = "摄像头权限不可用";
    }
  }

  function stopGestureCamera() {
    const stream = gestureVideo.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    gestureVideo.srcObject = null;
    gestureCard.hidden = true;
    state.gesture = false;
    state.gestureCenter = null;
    state.gestureSize = null;
    state.gestureConfidence = 0;
    applyGesture.lastCenter = null;
    applyGesture.lastSize = null;
    toggleGesture.classList.remove("active");
  }

  function skinPixel(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    const rgbRule = r > 86 && g > 34 && b > 18 && r > g * 1.04 && r > b * 1.12 && max - min > 16;
    const ycbcrRule = y > 55 && cb > 76 && cb < 134 && cr > 132 && cr < 178;
    return rgbRule && ycbcrRule;
  }

  function detectLargestSkinComponent(frame, width, height) {
    const step = 2;
    const gridW = Math.floor(width / step);
    const gridH = Math.floor(height / step);
    const mask = new Uint8Array(gridW * gridH);

    for (let gy = 0; gy < gridH; gy += 1) {
      for (let gx = 0; gx < gridW; gx += 1) {
        const x = gx * step;
        const y = gy * step;
        const idx = (y * width + x) * 4;
        if (skinPixel(frame[idx], frame[idx + 1], frame[idx + 2])) {
          mask[gy * gridW + gx] = 1;
        }
      }
    }

    const visited = new Uint8Array(mask.length);
    const queue = new Int32Array(mask.length);
    let best = null;

    for (let i = 0; i < mask.length; i += 1) {
      if (!mask[i] || visited[i]) continue;
      let head = 0;
      let tail = 0;
      queue[tail] = i;
      tail += 1;
      visited[i] = 1;
      let count = 0;
      let minX = gridW;
      let minY = gridH;
      let maxX = 0;
      let maxY = 0;

      while (head < tail) {
        const current = queue[head];
        head += 1;
        const x = current % gridW;
        const y = Math.floor(current / gridW);
        count += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        const neighbors = [current - 1, current + 1, current - gridW, current + gridW];
        for (const next of neighbors) {
          if (next < 0 || next >= mask.length || visited[next] || !mask[next]) continue;
          const nx = next % gridW;
          if (Math.abs(nx - x) > 1) continue;
          visited[next] = 1;
          queue[tail] = next;
          tail += 1;
        }
      }

      const boxW = maxX - minX + 1;
      const boxH = maxY - minY + 1;
      const fill = count / Math.max(1, boxW * boxH);
      const validShape = count > 90 && boxW > 10 && boxH > 10 && fill > 0.18;
      if (!validShape) continue;
      const score = count * fill * (boxH > boxW * 0.45 ? 1.25 : 1);
      if (!best || score > best.score) {
        best = {
          x: minX * step,
          y: minY * step,
          w: boxW * step,
          h: boxH * step,
          count,
          fill,
          score
        };
      }
    }

    return best;
  }

  function detectGestureFrame() {
    if (!state.gesture) return;
    const gctx = gestureCanvas.getContext("2d", { willReadFrequently: true });
    const width = 192;
    const height = 144;
    gestureCanvas.width = width;
    gestureCanvas.height = height;
    gctx.save();
    gctx.scale(-1, 1);
    gctx.drawImage(gestureVideo, -width, 0, width, height);
    gctx.restore();

    const image = gctx.getImageData(0, 0, width, height);
    const component = detectLargestSkinComponent(image.data, width, height);
    gctx.clearRect(0, 0, width, height);

    if (component) {
      const rawCenter = { x: component.x + component.w / 2, y: component.y + component.h / 2 };
      const rawSize = Math.hypot(component.w, component.h);
      const confidence = clamp((component.count / 420) * component.fill, 0, 1);
      if (!state.gestureCenter) {
        state.gestureCenter = rawCenter;
        state.gestureSize = rawSize;
      } else {
        state.gestureCenter = {
          x: lerp(state.gestureCenter.x, rawCenter.x, 0.32),
          y: lerp(state.gestureCenter.y, rawCenter.y, 0.32)
        };
        state.gestureSize = lerp(state.gestureSize, rawSize, 0.28);
      }
      state.gestureConfidence = lerp(state.gestureConfidence, confidence, 0.25);

      gctx.strokeStyle = state.gestureConfidence > 0.42 ? "#5eead4" : "#ffcb6b";
      gctx.lineWidth = 3;
      gctx.strokeRect(component.x, component.y, component.w, component.h);
      gctx.fillStyle = "rgba(94, 234, 212, .18)";
      gctx.fillRect(component.x, component.y, component.w, component.h);

      applyGesture(state.gestureCenter, state.gestureSize, state.gestureConfidence);
      gestureName.textContent = state.gestureConfidence > 0.42 ? "手势稳定" : "继续靠近手掌";
      gestureHint.textContent = `置信度 ${Math.round(state.gestureConfidence * 100)}%`;
    } else {
      state.gestureCenter = null;
      state.gestureSize = null;
      applyGesture.lastCenter = null;
      applyGesture.lastSize = null;
      state.gestureConfidence = lerp(state.gestureConfidence, 0, 0.2);
      gestureName.textContent = "举起手掌";
      gestureHint.textContent = "让手掌占画面更多面积";
    }

    requestAnimationFrame(detectGestureFrame);
  }

  function applyGesture(center, size, confidence) {
    if (confidence < 0.28) return;
    if (!applyGesture.lastCenter || !applyGesture.lastSize) {
      applyGesture.lastCenter = center;
      applyGesture.lastSize = size;
      return;
    }
    const dx = center.x - applyGesture.lastCenter.x;
    const dy = center.y - applyGesture.lastCenter.y;
    const ds = size - applyGesture.lastSize;
    const deadX = Math.abs(dx) > 1.6 ? dx : 0;
    const deadY = Math.abs(dy) > 1.6 ? dy : 0;
    const deadS = Math.abs(ds) > 2.2 ? ds : 0;

    if (state.solo) {
      state.soloYaw += deadX * 0.0065;
      state.soloPitch += deadY * 0.0048;
      state.desiredSoloZoom = clamp(state.desiredSoloZoom * Math.exp(deadS * 0.005), 0.55, 2.45);
    } else {
      state.yaw += deadX * 0.0026;
      state.pitch += deadY * 0.0018;
      state.desiredDistance = clamp(state.desiredDistance * Math.exp(-deadS * 0.006), 1.4, 560);
    }

    applyGesture.lastCenter = center;
    applyGesture.lastSize = size;
  }

  function wireControls() {
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("beforeunload", stopGestureCamera);

    openControlMenu.addEventListener("click", openDrawerMenu);
    closeControlMenu.addEventListener("click", closeDrawerMenu);
    drawerBackdrop.addEventListener("click", closeDrawerMenu);
    toggleMotion.addEventListener("click", () => setRunning(!state.running));
    resetView.addEventListener("click", resetCamera);
    toggleLabels.addEventListener("click", () => {
      state.labels = !state.labels;
      toggleLabels.classList.toggle("active", state.labels);
    });
    toggleSolo.addEventListener("click", () => toggleSoloMode());
    toggleGesture.addEventListener("click", toggleGestureCamera);
    aiChatToggle.addEventListener("click", toggleAiChat);
    closeAiChat.addEventListener("click", closeAiChatWindow);
    aiAsk.addEventListener("click", () => requestAiInsight(aiQuestion.value, "manual"));
    aiQuestion.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        requestAiInsight(aiQuestion.value, "manual");
      }
    });
    aiSaveKey.addEventListener("click", saveApiKey);
    aiVerifyKey.addEventListener("click", verifyApiKey);
    aiProvider.addEventListener("change", applyProviderPreset);
    openApiKeyPanel.addEventListener("click", openApiKeyModal);
    closeApiKeyPanel.addEventListener("click", closeApiKeyModal);
    apiKeyBackdrop.addEventListener("click", closeApiKeyModal);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !apiKeyModal.hidden) {
        closeApiKeyModal();
      } else if (event.key === "Escape" && controlPanel.classList.contains("open")) {
        closeDrawerMenu();
      } else if (event.key === "Escape" && !aiChatWindow.hidden) {
        closeAiChatWindow();
      }
    });
    speedRange.addEventListener("input", (event) => {
      state.speed = Number(event.target.value);
    });
    glowRange.addEventListener("input", (event) => {
      state.glow = Number(event.target.value);
    });
    orbitToggle.addEventListener("change", (event) => {
      state.orbits = event.target.checked;
    });
  }

  function init() {
    planets.forEach(makeSpherePoints);
    buildButtons();
    resize();
    wireControls();
    applyAiServiceConfig({ provider: "deepseek" });
    refreshApiKeyStatus();
    updateAiModelLine();
    focusPlanet("sun");
    requestAnimationFrame(render);
  }

  init();
})();
