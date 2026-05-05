export class AIServiceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "AIServiceError";
    this.code = options.code || "AI_SERVICE_ERROR";
    this.status = options.status || 500;
    this.details = options.details || "";
  }
}

const APP_AI_SYSTEM_PROMPT = [
  "你是太阳系 3D 科普应用内的中文讲解助手。",
  "回答要像正式 App 信息面板里的内容：清晰、克制、准确，避免闲聊式表达。",
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

export class AIService {
  constructor(options = {}) {
    this.apiKey = options.apiKey ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
    this.apiKeyStore = options.apiKeyStore || null;
    this.baseUrl = stripTrailingSlash(options.baseUrl ?? process.env.AI_BASE_URL ?? "https://api.openai.com/v1");
    this.endpoint = options.endpoint ?? process.env.AI_ENDPOINT ?? `${this.baseUrl}/chat/completions`;
    this.model = options.model ?? process.env.AI_MODEL ?? "gpt-4o-mini";
    this.timeoutMs = Number(options.timeoutMs ?? process.env.AI_TIMEOUT_MS ?? 35000);
    this.authHeader = options.authHeader ?? process.env.AI_AUTH_HEADER ?? "Authorization";
    this.authPrefix = options.authPrefix ?? process.env.AI_AUTH_PREFIX ?? "Bearer";
  }

  async isConfigured() {
    const config = await this.getRuntimeConfig();
    return Boolean(config.apiKey && config.endpoint);
  }

  async ask(input = {}) {
    const config = await this.getRuntimeConfig(input);
    if (!config.apiKey || !config.endpoint) {
      throw new AIServiceError("AI API key or endpoint is not configured.", {
        code: "AI_NOT_CONFIGURED",
        status: 503
      });
    }

    const messages = normalizeMessages(input);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: this.buildHeaders(config.apiKey),
        body: JSON.stringify({
          model: config.model,
          temperature: input.temperature ?? 0.55,
          max_tokens: input.maxTokens ?? input.max_tokens ?? 360,
          messages
        }),
        signal: controller.signal
      });

      const rawText = await response.text();
      const data = parseJson(rawText);

      if (!response.ok) {
        throw new AIServiceError(`AI API returned HTTP ${response.status}.`, {
          code: "AI_API_ERROR",
          status: response.status,
          details: rawText.slice(0, 800)
        });
      }

      return {
        text: extractText(data),
        raw: data,
        model: data.model || config.model
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new AIServiceError("AI API request timed out.", {
          code: "AI_TIMEOUT",
          status: 504
        });
      }
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError("AI API network request failed.", {
        code: "AI_NETWORK_ERROR",
        status: 502,
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async answerPlanetQuestion({ planet, question, instruction, model }) {
    const safePlanet = planet || {};
    const prompt = [
      `当前星球：${safePlanet.name || "未知"}`,
      `分类：${safePlanet.subtitle || "-"}`,
      `轨道半径：${safePlanet.au || "-"}`,
      `公转周期：${safePlanet.period || "-"}`,
      `内置事实：${safePlanet.fact || "-"}`,
      `用户问题：${String(question || "").slice(0, 800)}`
    ].join("\n");

    const result = await this.ask({
      model,
      messages: [
        {
          role: "system",
          content: instruction || APP_AI_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    return {
      ...result,
      text: normalizeAppAnswer(result.text)
    };
  }

  buildHeaders(apiKey) {
    const headers = {
      "content-type": "application/json"
    };
    headers[this.authHeader] = this.authPrefix ? `${this.authPrefix} ${apiKey}` : apiKey;
    return headers;
  }

  async getApiKey() {
    return (await this.getRuntimeConfig()).apiKey;
  }

  async getRuntimeConfig(input = {}) {
    const stored = this.apiKeyStore?.getConfig ? await this.apiKeyStore.getConfig() : {};
    const baseUrl = stripTrailingSlash(input.baseUrl || stored.baseUrl || this.baseUrl);
    const endpoint = input.endpoint || stored.endpoint || process.env.AI_ENDPOINT || `${baseUrl}/chat/completions`;
    const requestedModel = input.model && input.model !== "default" ? input.model : "";
    return {
      apiKey: input.apiKey || stored.apiKey || (await this.getStoredApiKeyFallback()),
      provider: input.provider || stored.provider || "custom",
      baseUrl,
      endpoint,
      model: requestedModel || stored.model || this.model
    };
  }

  async getStoredApiKeyFallback() {
    if (this.apiKeyStore) {
      const storedKey = await this.apiKeyStore.getKey?.();
      if (storedKey) return storedKey;
    }
    return this.apiKey;
  }
}

function normalizeMessages(input) {
  if (Array.isArray(input.messages) && input.messages.length) {
    return input.messages.map((message) => ({
      role: message.role || "user",
      content: String(message.content || "")
    }));
  }
  return [
    {
      role: "user",
      content: String(input.prompt || input.question || "")
    }
  ];
}

function extractText(data) {
  return String(
    data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      data?.output_text ??
      data?.answer ??
      data?.text ??
      data?.message ??
      ""
  ).trim();
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new AIServiceError("AI API returned invalid JSON.", {
      code: "AI_INVALID_JSON",
      status: 502,
      details: text.slice(0, 800)
    });
  }
}

function normalizeAppAnswer(text) {
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
        .replace(/\*\*/g, "")
        .trim()
    )
    .filter(Boolean);
  const joined = lines.join(" ");
  const sentences = joined
    .split(/(?<=[。！？!?])\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
  const summary = sentences.slice(0, 2).join("") || joined.slice(0, 90);
  const bulletSource = lines.length > 1 ? lines : sentences.slice(1);
  const bullets = bulletSource
    .filter((item) => item && item !== summary)
    .map((item) => item.replace(/[。！？!?]$/, ""))
    .slice(0, 4);
  const list = bullets.length ? bullets : ["已整理为应用内结构化回答。"];
  const detail = sentences.slice(2).join("") || sentences[1] || "该内容由 AI 返回后自动整理，便于在科普信息面板中阅读。";

  return [
    "## 回答",
    summary,
    "",
    "## 要点",
    ...list.map((item) => `- ${item}`),
    "",
    "## 说明",
    detail
  ].join("\n");
}

function stripTrailingSlash(value) {
  return String(value).replace(/\/$/, "");
}
