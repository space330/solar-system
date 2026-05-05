import express from "express";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AIService, AIServiceError } from "./server/AIService.mjs";
import { ApiKeyStore } from "./server/ApiKeyStore.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const app = express();
const csrfToken = randomBytes(32).toString("hex");
const apiKeyStore = new ApiKeyStore();
const aiService = new AIService({ apiKeyStore });

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use(securityHeaders);

// Serve only the public frontend files. Do not expose server/ or .data/.
app.use("/src", express.static(join(__dirname, "src"), { dotfiles: "ignore" }));
app.get("/", (_req, res) => res.sendFile(join(__dirname, "index.html")));
app.get("/index.html", (_req, res) => res.sendFile(join(__dirname, "index.html")));

app.get("/api/csrf-token", (_req, res) => {
  res.json({ csrfToken });
});

app.get("/api/key-status", async (_req, res) => {
  const config = await apiKeyStore.getConfig();
  res.json({
    configured: await apiKeyStore.hasKey(),
    maskedKey: await apiKeyStore.getMaskedKey(),
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    persistentStorage: Boolean(process.env.API_KEY_ENCRYPTION_SECRET)
  });
});

app.post("/api/set-api-key", sameOriginOnly, requireCsrf, async (req, res) => {
  try {
    const result = await apiKeyStore.saveConfig({
      apiKey: req.body?.apiKey,
      provider: req.body?.provider,
      baseUrl: req.body?.baseUrl,
      model: req.body?.model
    });
    res.json({
      ok: true,
      configured: true,
      maskedKey: await apiKeyStore.getMaskedKey(),
      provider: result.config.provider,
      baseUrl: result.config.baseUrl,
      model: result.config.model,
      persisted: result.persisted,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "API Key 保存失败。"
    });
  }
});

app.post("/api/verify-api-key", sameOriginOnly, requireCsrf, async (_req, res) => {
  try {
    const result = await aiService.ask({
      apiKey: _req.body?.apiKey,
      provider: _req.body?.provider,
      baseUrl: _req.body?.baseUrl,
      model: _req.body?.model,
      maxTokens: 8,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: "Reply with OK only."
        },
        {
          role: "user",
          content: "Connection test."
        }
      ]
    });
    res.json({
      ok: true,
      valid: true,
      model: result.model,
      message: "API Key 验证成功。"
    });
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    res.status(status).json({
      ok: false,
      valid: false,
      code: error instanceof AIServiceError ? error.code : "VERIFY_FAILED",
      error: error instanceof Error ? error.message : "API Key 验证失败。",
      details: error instanceof AIServiceError ? error.details : ""
    });
  }
});

app.post("/api/ai", sameOriginOnly, requireCsrf, async (req, res) => {
  try {
    const result = await aiService.answerPlanetQuestion({
      planet: req.body?.planet,
      question: req.body?.question,
      instruction: req.body?.instruction,
      model: req.body?.model
    });
    res.json({
      answer: result.text,
      model: result.model
    });
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    res.status(status).json({
      answer: "",
      error: error instanceof Error ? error.message : "AI request failed.",
      code: error instanceof AIServiceError ? error.code : "AI_ROUTE_ERROR",
      details: error instanceof AIServiceError ? error.details : ""
    });
  }
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }
  res.sendFile(join(__dirname, "index.html"));
});

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not found");
});

app.listen(port, () => {
  console.log(`Solar System AI app: http://localhost:${port}`);
});

function requireCsrf(req, res, next) {
  if (req.get("x-csrf-token") !== csrfToken) {
    res.status(403).json({ ok: false, error: "Invalid CSRF token." });
    return;
  }
  next();
}

function sameOriginOnly(req, res, next) {
  const origin = req.get("origin");
  if (!origin) {
    next();
    return;
  }

  const host = req.get("host");
  if (!host) {
    res.status(400).json({ ok: false, error: "Missing Host header." });
    return;
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      res.status(403).json({ ok: false, error: "Cross-origin API request blocked." });
      return;
    }
  } catch {
    res.status(400).json({ ok: false, error: "Invalid Origin header." });
    return;
  }

  next();
}

function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(self)");
  next();
}
