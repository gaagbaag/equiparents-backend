import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import apiRoutes from "./api/index.js";
import emailTestRoutes from "./api/tests/emailTestRoutes.js";

dotenv.config();

// Validación mínima de entorno
if (!process.env.PORT) {
  console.warn("⚠️ PORT no definido, usando 5000 por defecto.");
}

const app = express();
app.disable("etag");

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CORS_ORIGIN
        : "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api", apiRoutes);
app.use("/test", emailTestRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Backend Equi·Parents activo");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV}`);
});
