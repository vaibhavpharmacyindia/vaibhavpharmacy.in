const axios = require("axios");

const API_URL = "https://graph.facebook.com/v19.0";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

const api = axios.create({
  baseURL: `${API_URL}/${PHONE_ID}`,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

// ─── Send a text message ──────────────────────────────────────
async function sendText(to, text) {
  try {
    await api.post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    });
    console.log(`📤 Sent text to ${to}`);
  } catch (err) {
    console.error("Send text error:", err.response?.data || err.message);
  }
}

// ─── Send an interactive button message ───────────────────────
async function sendButtons(to, bodyText, buttons) {
  try {
    await api.post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((btn, i) => ({
            type: "reply",
            reply: { id: btn.id || `btn_${i}`, title: btn.title },
          })),
        },
      },
    });
    console.log(`📤 Sent buttons to ${to}`);
  } catch (err) {
    console.error("Send buttons error:", err.response?.data || err.message);
  }
}

// ─── Send a list message ──────────────────────────────────────
async function sendList(to, bodyText, buttonTitle, sections) {
  try {
    await api.post("/messages", {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonTitle,
          sections,
        },
      },
    });
    console.log(`📤 Sent list to ${to}`);
  } catch (err) {
    console.error("Send list error:", err.response?.data || err.message);
  }
}

// ─── Download media (for prescription photos) ─────────────────
async function downloadMedia(mediaId) {
  try {
    // Step 1: Get the media URL
    const { data: mediaInfo } = await axios.get(`${API_URL}/${mediaId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    // Step 2: Download the actual file
    const { data: fileBuffer } = await axios.get(mediaInfo.url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      responseType: "arraybuffer",
    });

    return Buffer.from(fileBuffer);
  } catch (err) {
    console.error("Download media error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { sendText, sendButtons, sendList, downloadMedia };
