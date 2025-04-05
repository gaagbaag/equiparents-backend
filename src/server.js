// backend/src/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import emailTestRoutes from "../test/emailTestRoutes.js";

dotenv.config();

const app = express();

app.disable("etag");

// ✅ Seguridad primero
app.use(helmet());

// ✅ Parseo JSON antes de rutas
app.use(express.json());

// ✅ Logging
app.use(morgan("dev"));

// ✅ Configurar CORS (después de helmet, antes de rutas)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Rutas agrupadas de la API
app.use("/api", apiRoutes);

// ✅ Rutas de test
app.use("/test", emailTestRoutes); // 🧪 test no debería ir dentro de /api

// ✅ Ruta raíz
app.get("/", (req, res) => {
  res.send("🚀 Backend Equi·Parents activo");
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
});
