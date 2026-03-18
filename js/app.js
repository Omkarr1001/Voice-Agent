/**
 * Zepmed Assistant — Main app: chat UI, voice (Vapi), and response handling.
 * Requires config.js (from config.example.js) and ZepmedAssistant (assistant.js).
 */
(function () {
  "use strict";

  const config = window.ZEPMED_CONFIG || {};
  var vapiConfig = config.vapi || {};
  var backendUrl = (config.backendUrl || "").trim();
  const company = config.company || { name: "Zepmed", website: "https://zepmed.org" };
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(typeof location !== "undefined" && location.hostname);
  if (!backendUrl && !isLocal) backendUrl = "/api/chat";

  const chatBox = document.getElementById("chatBox");
  const input = document.getElementById("input");
  const micBtn = document.getElementById("micBtn");
  const statusEl = document.getElementById("status");
  const headerTitle = document.getElementById("headerTitle");
  const headerTagline = document.getElementById("headerTagline");

  let isListening = false;
  let vapi = null;
  let typingId = null;

  if (headerTitle) headerTitle.textContent = (company.name || "Zepmed") + " Assistant";
  if (headerTagline) headerTagline.textContent = company.tagline || "India's Hyperlocal Medicine Network";
  var footerLink = document.getElementById("footerLink");
  if (footerLink && company.website) {
    footerLink.href = company.website;
    try { footerLink.textContent = "Submit enquiry · " + company.website.replace(/^https?:\/\//, ""); } catch (e) {}
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function addMessage(text, sender) {
    if (!chatBox) return;
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.setAttribute("role", sender === "user" ? "status" : "article");
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function addErrorMessage(text) {
    if (!chatBox) return;
    const msg = document.createElement("div");
    msg.classList.add("message", "error");
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function showTyping() {
    if (typingId) return typingId;
    const el = document.createElement("div");
    el.className = "message bot";
    el.setAttribute("aria-live", "polite");
    el.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
    typingId = el;
    return el;
  }

  function hideTyping() {
    if (typingId && typingId.parentNode) {
      typingId.parentNode.removeChild(typingId);
      typingId = null;
    }
  }

  function getBotResponse(userText) {
    var chatUrl = backendUrl || (isLocal ? "" : "/api/chat");
    if (chatUrl) {
      var payload = { message: userText };
      if (vapiConfig.assistantId) payload.assistantId = vapiConfig.assistantId;
      return fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (!res.ok) throw new Error(data.error || "Server error (" + res.status + ")");
            return data;
          });
        })
        .then(function (data) {
          if (data.error && !data.reply) throw new Error(data.error);
          return data.reply || data.message || data.text || "I couldn't process that. Please try again or visit " + (company.website || "zepmed.org") + " for support.";
        });
    }
    return ZepmedAssistant.respond(userText);
  }

  function sendMessage() {
    const text = (input && input.value) ? input.value.trim() : "";
    if (!text) return;

    addMessage(text, "user");
    if (input) input.value = "";

    showTyping();
    setStatus("Thinking…");

    getBotResponse(text)
      .then(function (reply) {
        hideTyping();
        addMessage(reply, "bot");
        setStatus("Ready");
      })
      .catch(function (err) {
        hideTyping();
        var msg = (err && err.message) ? err.message : "Something went wrong.";
        if (isLocal && backendUrl && (msg === "Failed to fetch" || (err && err.name === "TypeError"))) {
          msg = "Chat server not running. In a terminal: cd server, set VAPI_API_KEY=your_private_key, node server.js";
        }
        addErrorMessage(msg);
        setStatus("Ready");
      });
  }

  function initVoice() {
    const key = (vapiConfig.publicKey || "").trim();
    const assistantId = (vapiConfig.assistantId || "").trim();
    var sdkMissing = (typeof Vapi === "undefined");
    var envMissing = (!key || !assistantId);
    if (sdkMissing || envMissing) {
      if (micBtn) {
        micBtn.style.display = "";
        micBtn.style.opacity = "0.5";
        micBtn.disabled = true;
        if (sdkMissing) {
          micBtn.title = "Voice SDK did not load. Check browser console for Vapi script errors.";
        } else {
          micBtn.title = "Voice: add VAPI_PUBLIC_KEY and VAPI_ASSISTANT_ID in Vercel (Settings → Environment Variables), then Redeploy. Hard-refresh (Ctrl+Shift+R) after.";
        }
      }
      return;
    }
    try {
      if (micBtn) {
        micBtn.style.opacity = "1";
        micBtn.disabled = false;
        micBtn.title = "Start voice";
      }
      vapi = new Vapi(key);
      // Vapi sends transcript with .transcript (not .text); role is "assistant" or "user"
      vapi.on("message", function (msg) {
        if (!msg || msg.type !== "transcript") return;
        var text = msg.transcript || msg.text || "";
        if (!text.trim()) return;
        // Only show final transcripts to avoid duplicate/partial flicker
        if (msg.transcriptType === "partial") return;
        var sender = msg.role === "user" ? "user" : "bot";
        addMessage(text, sender);
      });
      vapi.on("error", function (err) {
        console.warn("Vapi error:", err);
        setStatus("Error — try again");
      });
      vapi.on("call-end", function () {
        isListening = false;
        if (micBtn) micBtn.classList.remove("active");
        setStatus("Ready");
      });
      micBtn.addEventListener("click", function () {
        if (isListening) {
          vapi.stop();
          micBtn.classList.remove("active");
          setStatus("Stopped");
          isListening = false;
        } else {
          setStatus("Connecting…");
          vapi.start(assistantId).then(function () {
            setStatus("Listening…");
            isListening = true;
          }).catch(function (err) {
            console.warn("Vapi start failed:", err);
            setStatus("Voice failed — check key & assistant");
            micBtn.classList.remove("active");
          });
          micBtn.classList.add("active");
        }
      });
    } catch (e) {
      if (micBtn) {
        micBtn.style.opacity = "0.5";
        micBtn.disabled = true;
        micBtn.title = "Voice SDK failed to load. Check browser console.";
      }
      console.warn("Vapi init failed:", e);
    }
  }

  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  var sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.addEventListener("click", sendMessage);

  if (chatBox && !document.querySelector(".welcome")) {
    const welcome = document.createElement("div");
    welcome.className = "welcome";
    var chatTip = backendUrl
      ? "Chat and voice use your ZepMed Agent."
      : "Voice: click 🎤. Chat: run <code>server</code> and set <code>backendUrl</code> for ZepMed Agent replies.";
    welcome.innerHTML = "Hello — same ZepMed Agent as the dashboard.<br><br>" + chatTip;
    chatBox.appendChild(welcome);
  }

  // UMD script may run after us; retry so voice init runs once Vapi is available
  function tryInitVoice() {
    if (typeof Vapi !== "undefined") {
      initVoice();
      return true;
    }
    return false;
  }
  function runVoiceInit() {
    if (!tryInitVoice()) {
      setTimeout(function () {
        if (!tryInitVoice() && micBtn) {
          micBtn.style.opacity = "0.5";
          micBtn.disabled = true;
          micBtn.title = "Voice SDK did not load. Refresh or check if scripts are blocked.";
        }
      }, 500);
    }
  }
  // On Vercel: load voice keys from /api/config so we don't ship them in the repo
  if (!isLocal && (!vapiConfig.publicKey || !vapiConfig.assistantId)) {
    fetch("/api/config")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.vapi) {
          window.ZEPMED_CONFIG.vapi = d.vapi;
          vapiConfig = d.vapi;
        }
        runVoiceInit();
      })
      .catch(function () { runVoiceInit(); });
  } else {
    runVoiceInit();
  }

  window.ZepmedSendMessage = sendMessage;
})();
