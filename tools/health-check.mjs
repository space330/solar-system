import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT_URL = process.env.APP_URL || "http://localhost:4173";
const NODE = process.execPath;
const CHECK_FILES = [
  "server.mjs",
  "server/AIService.mjs",
  "server/ApiKeyStore.mjs",
  "src/app.js",
  "src/compat.js",
  "src/renderer.js",
  "workers/particle-worker.js"
];

const results = [];

await checkSyntax();
await checkHtmlContracts();
await checkServer();

const failed = results.filter((item) => !item.ok);
for (const item of results) {
  const mark = item.ok ? "OK" : "FAIL";
  console.log(`[${mark}] ${item.name}${item.detail ? ` - ${item.detail}` : ""}`);
}

if (failed.length) {
  console.error(`\nHealth check failed: ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("\nHealth check passed.");

async function checkSyntax() {
  for (const file of CHECK_FILES) {
    try {
      await execFileAsync(NODE, ["--check", file], { windowsHide: true });
      pass(`syntax ${file}`);
    } catch (error) {
      fail(`syntax ${file}`, compactError(error));
    }
  }
}

async function checkHtmlContracts() {
  try {
    const html = await readFile("index.html", "utf8");
    const app = await readFile("src/app.js", "utf8");
    const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const selectors = [...app.matchAll(/querySelector\("#([^"]+)"\)/g)].map((match) => match[1]);
    const missing = [...new Set(selectors.filter((id) => !ids.includes(id)))];
    const scripts = [...html.matchAll(/<script[^>]*>/g)].map((match) => match[0]);

    duplicates.length ? fail("html duplicate ids", duplicates.join(", ")) : pass("html duplicate ids");
    missing.length ? fail("html selector ids", missing.join(", ")) : pass("html selector ids");
    scripts.some((script) => script.includes("./src/app.js"))
      ? pass("html app script")
      : fail("html app script", "index.html does not load ./src/app.js");
  } catch (error) {
    fail("html contracts", compactError(error));
  }
}

async function checkServer() {
  try {
    const home = await fetchWithTimeout(`${ROOT_URL}/`);
    home.ok ? pass("server home", `${home.status}`) : fail("server home", `${home.status}`);
  } catch (error) {
    fail("server home", compactError(error));
    return;
  }

  try {
    const appJs = await fetchWithTimeout(`${ROOT_URL}/src/app.js`);
    appJs.ok ? pass("server app.js", `${appJs.status}`) : fail("server app.js", `${appJs.status}`);
  } catch (error) {
    fail("server app.js", compactError(error));
  }

  try {
    const statusResponse = await fetchWithTimeout(`${ROOT_URL}/api/key-status`);
    const data = await statusResponse.json();
    const model = data.model ? `model=${data.model}` : "model=not configured";
    const provider = data.provider ? `provider=${data.provider}` : "provider=not configured";
    statusResponse.ok ? pass("api key status", `${provider}, ${model}`) : fail("api key status", `${statusResponse.status}`);
  } catch (error) {
    fail("api key status", compactError(error));
  }
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function pass(name, detail = "") {
  results.push({ ok: true, name, detail });
}

function fail(name, detail = "") {
  results.push({ ok: false, name, detail });
}

function compactError(error) {
  if (!error) return "unknown error";
  if (error.stderr) return String(error.stderr).trim().split(/\r?\n/)[0];
  if (error.message) return error.message;
  return String(error);
}
