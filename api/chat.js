/**
 * Vercel serverless: proxy chat to Vapi (same as server/server.js).
 * Set VAPI_API_KEY and VAPI_ASSISTANT_ID in Vercel Environment Variables.
 */
const VAPI_CHAT_URL = "https://api.vapi.ai/chat";

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

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(404).json({ error: "Use POST with { message, assistantId? }." });
  }

  const VAPI_API_KEY = process.env.VAPI_API_KEY;
  const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || "";

  if (!VAPI_API_KEY) {
    return res.status(500).json({ error: "VAPI_API_KEY not set" });
  }

  const body = req.body || {};
  const message = (body.message || body.input || "").trim();
  const assistantId = (body.assistantId && String(body.assistantId).trim()) || String(VAPI_ASSISTANT_ID || "").trim();

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }
  if (!assistantId) {
    return res.status(400).json({ error: "Missing assistantId" });
  }

  try {
    const vapiRes = await fetch(VAPI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + VAPI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assistantId, input: message }),
    });
    const json = await vapiRes.json();
    if (!vapiRes.ok) {
      return res.status(vapiRes.status).json({
        error: json.message || json.error || "Vapi request failed",
        reply: "",
      });
    }
    const reply = extractReply(json);
    return res.status(200).json({ reply: reply || "I didn't get a response. Please try again." });
  } catch (e) {
    return res.status(502).json({ error: e.message || "Chat failed", reply: "" });
  }
}
