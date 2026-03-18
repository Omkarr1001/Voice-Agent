/**
 * Zepmed Assistant — Response logic for enquiries, FAQ, and support.
 * Extend or replace with backend AI when backendUrl is set in config.
 */
const ZepmedAssistant = (function () {
  "use strict";

  const faq = {
    delivery: [
      "We deliver medicines through our hyperlocal pharmacy network. Orders are routed to the nearest licensed pharmacy for fast last-mile delivery.",
      "Delivery times depend on your location and pharmacy availability. Our app shows real-time status once you place an order."
    ],
    order: [
      "Medicine orders are placed through our mobile application. Download the app to order and track your medicines from nearby pharmacies.",
      "This website is for enquiries and pharmacy partnerships. For ordering, please use the Zepmed mobile app."
    ],
    partner: [
      "Pharmacy owners can join as partners to digitize operations and expand reach. Use the 'Join as Pharmacy Partner' or 'Apply for Partnership' option on zepmed.org.",
      "We help retail pharmacies with smart routing, digital enablement, and reliable last-mile delivery—without heavy infrastructure investment."
    ],
    enquiry: [
      "You can submit an enquiry using the 'Customer Enquiry' or 'Submit Enquiry' form on zepmed.org. Our team will get back to you.",
      "For general support, use 'Talk to Support' on the website or reach out via the contact details provided there."
    ],
    medicine: [
      "We connect you with nearby licensed pharmacies so you can get essential medicines quickly. Availability depends on your local pharmacy stock.",
      "Our network focuses on faster, smarter access to medicines in your area. Check the app for specific medicine availability."
    ],
    default: [
      "Zepmed is India's hyperlocal medicine network—connecting patients with nearby pharmacies for faster access to medicines. How can I help you today?",
      "You can ask about medicine delivery, placing orders, becoming a pharmacy partner, or submitting an enquiry. What would you like to know?"
    ]
  };

  const keywords = {
    delivery: ["delivery", "deliver", "shipping", "when will", "how long", "reach", "arrive"],
    order: ["order", "order medicine", "buy", "purchase", "app", "mobile"],
    partner: ["partner", "pharmacy partner", "join", "register", "business", "pharmacy owner"],
    enquiry: ["enquiry", "enquire", "contact", "support", "help", "query", "submit"],
    medicine: ["medicine", "medicines", "drug", "availability", "stock", "pharmacy"]
  };

  function normalize(text) {
    return (text || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function matchIntent(text) {
    const n = normalize(text);
    if (!n) return "default";
    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some((w) => n.includes(w))) return intent;
    }
    return "default";
  }

  function getResponses(intent) {
    const list = faq[intent] || faq.default;
    return Array.isArray(list) ? list : [list];
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    respond: function (userMessage) {
      const intent = matchIntent(userMessage);
      const responses = getResponses(intent);
      return Promise.resolve(pickRandom(responses));
    }
  };
})();
