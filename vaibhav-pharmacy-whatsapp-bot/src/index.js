require("dotenv").config();
const express = require("express");
const webhookRoutes = require("./routes/webhook");
const reminderService = require("./services/reminderService");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    bot: `${process.env.PHARMACY_NAME || "Vaibhav Pharmacy"} WhatsApp Bot`,
    version: "1.0.0",
  });
});

// WhatsApp webhook routes
app.use("/webhook", webhookRoutes);

// Start reminder scheduler
reminderService.startScheduler();

app.listen(PORT, () => {
  console.log(`✅ ${process.env.PHARMACY_NAME || "Vaibhav Pharmacy"} Bot running on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
});
