import express from "express";
import { auth } from "express-oauth2-jwt-bearer"; // Middleware de express-oauth2-jwt-bearer

const router = express.Router();

// Middleware para verificar JWT (configuración de OAuth2)
const checkJwt = auth({
  audience: "https://equiparents.api", // El API que se va a autorizar
  issuerBaseURL: "https://dev-ufadmrew7lj7gth4.us.auth0.com/", // Issuer de Auth0
});

// Ruta protegida de prueba
router.get("/protected", checkJwt, (req, res) => {
  // Si el JWT es válido, 'req.user' debe contener los datos del usuario
  if (req.user) {
    res.json({
      message: "🔐 Acceso autorizado",
      user: req.user, // Accedemos a los datos del usuario, validados con JWT
    });
  } else {
    res.status(401).json({ message: "Usuario no autenticado" });
  }
});

export default router;
