import express from "express";
import cors from "cors";
import routes from "./api/routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`CzyToMaSens API działa na porcie ${PORT}`);
});