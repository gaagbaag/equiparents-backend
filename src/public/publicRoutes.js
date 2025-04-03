import express from "express";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = express.Router();

// 🔧 Cargar metadata de package.json
let pkg = { name: "Equi-Parents API", version: "desconocida" };

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const pkgPath = join(__dirname, "../../package.json");
  const pkgContent = await readFile(pkgPath, "utf-8");
  pkg = JSON.parse(pkgContent);
} catch (err) {
  console.error("❌ No se pudo leer package.json:", err.message);
}

// 📌 Ruta pública para verificar estado del backend
router.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Equi·Parents API pública activa 🟢" });
});

// 📦 Ruta para obtener la versión actual de la API
router.get("/version", (req, res) => {
  res.json({ name: pkg.name, version: pkg.version });
});

// 📄 Ruta para términos y condiciones
router.get("/terms", (req, res) => {
  res.json({
    title: "Términos y condiciones",
    content:
      "Al usar esta aplicación, aceptas los términos de uso y políticas de privacidad de Equi·Parents.",
  });
});

// ℹ️ Ruta pública de ayuda
router.get("/help", (req, res) => {
  res.json({
    faq: [
      {
        question: "¿Qué es Equi·Parents?",
        answer:
          "Es una app para compartir la carga parental de forma equitativa entre progenitores.",
      },
      {
        question: "¿Cómo creo una cuenta?",
        answer:
          "Solo necesitas iniciar sesión con tu cuenta mediante Auth0. Luego completarás tu perfil.",
      },
      {
        question: "¿Mi información está protegida?",
        answer:
          "Sí. Usamos autenticación OAuth segura y protegemos tus datos personales y financieros.",
      },
    ],
  });
});

export default router;
