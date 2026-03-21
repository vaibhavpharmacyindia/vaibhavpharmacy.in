const express = require("express");
const router = express.Router();
const messageHandler = require("../services/messageHandler");

// ─── Webhook Verification (GET) ───────────────────────────────
// Meta sends a GET request to verify your webhook URL
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);
});

// ─── Incoming Messages (POST) ─────────────────────────────────
// Meta sends incoming WhatsApp messages here
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Check this is a WhatsApp status update
    if (body.object !== "whatsapp_business_account") {
      return res.sendStatus(404);
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Handle incoming messages
    if (value?.messages?.[0]) {
      const message = value.messages[0];
      const senderPhone = message.from;
      const senderName = value.contacts?.[0]?.profile?.name || "Customer";

      console.log(`📩 Message from ${senderName} (${senderPhone}): ${message.type}`);

      // Process message — fire and forget but catch errors
      messageHandler.handleIncoming(message, senderPhone, senderName).catch((err) => {
        console.error(`Message processing error [${senderPhone}]:`, err);
      });
    }

    // Always respond 200 quickly to acknowledge receipt
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(200); // Still respond 200 to prevent retries
  }
});

module.exports = router;
