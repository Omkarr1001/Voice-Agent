/**
 * Zepmed Assistant — Configuration
 * Copy this file to config.js and fill in your keys. Never commit config.js.
 */
window.ZEPMED_CONFIG = {
  // Vapi.ai: public key for voice (client); get from dashboard.vapi.ai → API Keys
  // Use the same assistant for chat by running server/ and setting backendUrl below.
  vapi: {
    publicKey: "YOUR_VAPI_PUBLIC_KEY",
    assistantId: "f62ff55b-d7b6-4468-9a7d-30e2bf8338e4"  // ZepMed Agent (voice + chat)
  },
  // For chat with your Vapi agent: run server (see README), then set e.g. "http://localhost:3780/chat"
  backendUrl: "",
  // Company branding (customize for white-label)
  company: {
    name: "Zepmed",
    tagline: "India's Hyperlocal Medicine Network",
    website: "https://zepmed.org",
    supportEmail: "support@zepmed.org"
  }
};
