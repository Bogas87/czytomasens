const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const apiRoutes = require("./api/routes");
const stripeController = require("./api/stripe.controller");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").trim();
const FRONTEND_DIST = path.join(__dirname, "../../dist");
/**
 * Railway stoi przed aplikacją jako proxy.
 * Bez tego express-rate-limit wywala:
 * X-Forwarded-For header is set but trust proxy setting is false
 */
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === CLIENT_URL) {
        return callback(null, true);
      }
      return callback(new Error("Brak dostępu CORS"));
    },
    credentials: true,
  })
);

app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);

app.use(express.json({ limit: "80kb" }));
app.use(express.urlencoded({ extended: true, limit: "80kb" }));

app.use("/api", apiRoutes);

app.use(express.static(FRONTEND_DIST));

app.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 API działa na porcie ${PORT}`);
});