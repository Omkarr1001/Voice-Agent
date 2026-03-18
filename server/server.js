/**
 * Zepmed Assistant — Chat proxy for Vapi
 * Keeps your Vapi private API key on the server; same agent powers voice (client) and chat (here).
 *
 * Loads .env from this directory if present. Env: VAPI_API_KEY, VAPI_ASSISTANT_ID (optional)
 * POST /chat { "message": "user text", "assistantId": "optional-override" }
 * Returns { "reply": "assistant text" }
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const http = require("http");

const PORT = process.env.PORT || 3780;
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || "";
const VAPI_CHAT_URL = "https://api.vapi.ai/chat";

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function extractReply(vapiResponse) {
  const out = vapiResponse && vapiResponse.output;
  if (!Array.isArray(out) || out.length === 0) return "";
  const last = out.find((m) => m.role === "assistant") || out[out.length - 1];
  if (!last) return "";
  const c = last.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    const text = c.find((x) => x.type === "text" && x.text);
    return text ? text.text : c.map((x) => x.text || x.content || "").join("");
  }
  return "";
}

async function callVapiChat(assistantId, message) {
  const res = await fetch(VAPI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId,
      input: message,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || json.error || "Vapi request failed");
    err.status = res.status;
    throw err;
  }
  return json;
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method !== "POST" || (req.url !== "/chat" && req.url !== "/")) {
    send(res, 404, { error: "Not found. Use POST /chat with { message, assistantId? }." });
    return;
  }

  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);

  if (!VAPI_API_KEY) {
    send(res, 500, { error: "VAPI_API_KEY not set" });
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (e) {
    send(res, 400, { error: "Invalid JSON" });
    return;
  }

  const message = body.message || body.input || "";
  const assistantId = (body.assistantId || VAPI_ASSISTANT_ID || "").trim();
  if (!message.trim()) {
    send(res, 400, { error: "Missing message" });
    return;
  }
  if (!assistantId) {
    send(res, 400, { error: "Missing assistantId (set in body or VAPI_ASSISTANT_ID)" });
    return;
  }

  try {
    const vapiResponse = await callVapiChat(assistantId, message.trim());
    const reply = extractReply(vapiResponse);
    send(res, 200, { reply: reply || "I didn't get a response. Please try again." });
  } catch (e) {
    const status = e.status || 502;
    send(res, status, { error: e.message || "Chat failed", reply: "" });
  }
});

server.listen(PORT, () => {
  console.log("Zepmed chat proxy running at http://localhost:" + PORT);
  if (!VAPI_API_KEY) console.warn("WARN: VAPI_API_KEY not set");
  if (!VAPI_ASSISTANT_ID) console.log("Send assistantId in POST body.");
});
