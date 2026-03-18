/**
 * Vercel serverless: return public config for the frontend (voice keys).
 * Route: /api/voice-config (use this if /api/config returns 404).
 * Set VAPI_PUBLIC_KEY and VAPI_ASSISTANT_ID in Vercel Environment Variables.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  const publicKey = String(process.env.VAPI_PUBLIC_KEY || "");
  const assistantId = String(process.env.VAPI_ASSISTANT_ID || "");

  return res.status(200).json({
    vapi: { publicKey, assistantId },
  });
};
