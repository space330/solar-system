import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export class ApiKeyStore {
  constructor(options = {}) {
    this.filePath = options.filePath || process.env.AI_KEY_STORE_FILE || join(process.cwd(), ".data", "ai-key.enc.json");
    this.encryptionSecret = options.encryptionSecret || process.env.API_KEY_ENCRYPTION_SECRET || "";
    this.runtimeKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
    this.runtimeConfig = {
      provider: process.env.AI_PROVIDER || "deepseek",
      baseUrl: process.env.AI_BASE_URL || "https://api.deepseek.com/v1",
      model: process.env.AI_MODEL || "deepseek-v4-pro"
    };
  }

  async getKey() {
    return (await this.getConfig()).apiKey;
  }

  async getConfig() {
    const defaults = {
      apiKey: this.runtimeKey,
      provider: this.runtimeConfig.provider,
      baseUrl: this.runtimeConfig.baseUrl,
      model: this.runtimeConfig.model
    };
    if (!this.encryptionSecret) return defaults;

    try {
      const payload = JSON.parse(await readFile(this.filePath, "utf-8"));
      const decoded = decrypt(payload, this.encryptionSecret);
      const parsed = parseStoredConfig(decoded);
      return {
        ...defaults,
        ...parsed,
        apiKey: parsed.apiKey || defaults.apiKey
      };
    } catch {
      return defaults;
    }
  }

  async saveKey(apiKey) {
    return this.saveConfig({ apiKey });
  }

  async saveConfig(config = {}) {
    const existing = await this.getConfig();
    const normalized = {
      apiKey: normalizeApiKey(config.apiKey || existing.apiKey),
      provider: normalizeProvider(config.provider || existing.provider),
      baseUrl: normalizeBaseUrl(config.baseUrl || existing.baseUrl),
      model: normalizeModel(config.model || existing.model)
    };
    validateApiKeyShape(normalized.apiKey);
    validateServiceConfig(normalized);

    this.runtimeKey = normalized.apiKey;
    this.runtimeConfig = {
      provider: normalized.provider,
      baseUrl: normalized.baseUrl,
      model: normalized.model
    };
    process.env.AI_API_KEY = normalized.apiKey;
    process.env.AI_PROVIDER = normalized.provider;
    process.env.AI_BASE_URL = normalized.baseUrl;
    process.env.AI_MODEL = normalized.model;

    if (!this.encryptionSecret) {
      return {
        persisted: false,
        config: normalized,
        message: "API 配置已保存到当前服务进程内存。设置 API_KEY_ENCRYPTION_SECRET 后可加密持久化到本地文件。"
      };
    }

    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(encrypt(JSON.stringify(normalized), this.encryptionSecret), null, 2), {
      encoding: "utf-8",
      mode: 0o600
    });

    return {
      persisted: true,
      config: normalized,
      message: "API 配置已加密保存到服务端。"
    };
  }

  async hasKey() {
    return Boolean(await this.getKey());
  }

  async getMaskedKey() {
    const key = await this.getKey();
    if (!key) return "";
    if (key.length <= 10) return `${key.slice(0, 2)}...${key.slice(-2)}`;
    return `${key.slice(0, 7)}...${key.slice(-4)}`;
  }
}

export function validateApiKeyShape(apiKey) {
  if (!apiKey || apiKey.length < 12) {
    throw new Error("API Key 格式过短。");
  }
  if (/\s/.test(apiKey)) {
    throw new Error("API Key 不能包含空白字符。");
  }
}

export function validateServiceConfig(config = {}) {
  if (!normalizeBaseUrl(config.baseUrl)) {
    throw new Error("API Endpoint 不能为空。");
  }
  if (!/^https?:\/\//i.test(normalizeBaseUrl(config.baseUrl))) {
    throw new Error("API Endpoint 必须以 http:// 或 https:// 开头。");
  }
  if (!normalizeModel(config.model)) {
    throw new Error("模型名称不能为空。");
  }
}

function parseStoredConfig(decoded) {
  try {
    const parsed = JSON.parse(decoded);
    return {
      apiKey: normalizeApiKey(parsed.apiKey),
      provider: normalizeProvider(parsed.provider),
      baseUrl: normalizeBaseUrl(parsed.baseUrl),
      model: normalizeModel(parsed.model)
    };
  } catch {
    return {
      apiKey: normalizeApiKey(decoded)
    };
  }
}

function normalizeApiKey(apiKey) {
  return String(apiKey || "").trim();
}

function normalizeProvider(provider) {
  return String(provider || "custom").trim().toLowerCase();
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || "").trim().replace(/\/+$/, "");
}

function normalizeModel(model) {
  return String(model || "").trim();
}

function encrypt(text, secret) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(secret, salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    data: encrypted.toString("base64")
  };
}

function decrypt(payload, secret) {
  if (!payload || payload.version !== 1 || payload.algorithm !== "aes-256-gcm") {
    throw new Error("Unsupported API Key store format.");
  }
  const salt = Buffer.from(payload.salt, "base64");
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const data = Buffer.from(payload.data, "base64");
  const key = deriveKey(secret, salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

function deriveKey(secret, salt) {
  return scryptSync(secret, salt, 32);
}

export function constantTimeEquals(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
