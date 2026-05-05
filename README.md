# Solar System Particle Model

Open `index.html` directly for the offline version.

## AI model access layer

The backend AI integration is implemented in:

```text
server/AIService.mjs
server/ApiKeyStore.mjs
```

The frontend never stores or sends an API key directly to an external provider. It posts user questions to the local backend route:

```text
POST /api/ai
```

`server.mjs` receives that request and calls `AIService`, which then sends the request to the configured external AI HTTP API.

## Install

```powershell
cd D:\code\solar-system-particle-model
npm install
```

## Configuration

You can configure the API Key either through environment variables or through the in-app API Key form.

Recommended persistent mode:

```powershell
$env:API_KEY_ENCRYPTION_SECRET="use_a_long_random_secret"
$env:AI_MODEL="deepseek-v4-pro"
npm start
```

Then open `http://localhost:4173`, enter the API Key in the **AI 科普助手 -> API Key 管理** form, and click **保存 Key**.

The key is encrypted on the server and stored at:

```text
.data/ai-key.enc.json
```

`.data/` is ignored by Git.

Environment-only mode:

```powershell
$env:AI_API_KEY="your_api_key"
$env:AI_MODEL="deepseek-v4-pro"
npm start
```

Then open:

```text
http://localhost:4173
```

For OpenAI-compatible providers, set:

```powershell
$env:AI_BASE_URL="https://your-provider.example/v1"
$env:AI_ENDPOINT="https://your-provider.example/v1/chat/completions"
$env:AI_API_KEY="your_api_key"
$env:AI_MODEL="deepseek-v4-pro"
```

`AI_ENDPOINT` is optional. If omitted, the server uses:

```text
AI_BASE_URL + /chat/completions
```

Optional variables:

```text
PORT=4173
AI_TIMEOUT_MS=12000
AI_AUTH_HEADER=Authorization
AI_AUTH_PREFIX=Bearer
AI_KEY_STORE_FILE=.data/ai-key.enc.json
API_KEY_ENCRYPTION_SECRET=long_random_secret_for_local_encryption
```

The frontend posts to `/api/ai`. If the server or key is unavailable, it automatically uses the built-in offline knowledge fallback.

## API Key management endpoints

All mutating API routes require same-origin requests and the `X-CSRF-Token` header.

Get CSRF token:

```http
GET /api/csrf-token
```

Check whether a key is configured:

```http
GET /api/key-status
```

Save a key:

```http
POST /api/set-api-key
Content-Type: application/json
X-CSRF-Token: <token>

{
  "apiKey": "your_api_key"
}
```

Verify the stored key:

```http
POST /api/verify-api-key
X-CSRF-Token: <token>
```

Security notes:

- API Key values are never returned to the browser.
- The UI only displays a masked key such as `sk-xxxx...1234`.
- If `API_KEY_ENCRYPTION_SECRET` is set, the key is stored encrypted with AES-256-GCM.
- If no encryption secret is set, keys saved from the UI are kept in server process memory only.
- Do not serve this local tool on a public network without adding authentication.

## Backend usage example

```js
import { AIService } from "./server/AIService.mjs";

const ai = new AIService();

const result = await ai.ask({
  prompt: "What is the surface of Mars like?",
  model: "gpt-4o-mini"
});

console.log(result.text);
```

## Frontend usage example

The existing UI already calls the backend from the AI panel in `src/app.js`.

Minimal button-handler example:

```js
async function askAi(question, planet) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, planet })
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.answer;
}
```
