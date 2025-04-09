import { google } from "googleapis";
import { prisma } from "../config/database.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Paso 1: redirige a Google
export const initGoogleOAuth = (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  res.redirect(url);
};

// Paso 2: recibe el code y redirige al frontend con refresh_token
export const handleGoogleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);

    console.log("🔑 TOKENS:", tokens);

    if (!tokens.refresh_token) {
      return res.status(400).send("No se recibió refresh_token de Google");
    }

    const refreshToken = encodeURIComponent(tokens.refresh_token);
    res.redirect(
      `${process.env.FRONTEND_BASE_URL}/calendar?token=${refreshToken}`
    );
  } catch (err) {
    console.error("❌ Error en callback:", err);
    res.status(500).send("Error en callback de Google");
  }
};

// Paso 3: guardar el refresh_token desde frontend con JWT activo
export const saveGoogleRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id;

    if (!refreshToken) {
      console.warn("⚠️ refreshToken faltante en la solicitud");
      return res.status(400).json({ message: "Falta refreshToken" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { googleRefreshToken: refreshToken },
    });

    console.log(
      "✅ Refresh token guardado correctamente:",
      updatedUser.googleRefreshToken
    );
    res.status(200).json({ message: "Token guardado" });
  } catch (err) {
    console.error("❌ Error al guardar token:", err.message, err.stack);
    res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
};

// Paso 4: listar calendarios
export const listUserCalendars = async (req, res) => {
  try {
    const auth0Id = req.user.sub;
    const user = await prisma.user.findUnique({ where: { auth0Id } });

    if (!user?.googleRefreshToken) {
      return res.status(400).json({ message: "No hay refresh_token guardado" });
    }

    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const { data } = await calendar.calendarList.list();
    const calendars = data.items.map((cal) => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary || false,
    }));

    res.json({ calendars });
  } catch (err) {
    console.error("❌ Error al obtener calendarios:", err);
    res.status(500).json({ message: "Error al obtener calendarios" });
  }
};

// Paso 5: guardar calendarId seleccionado
export const selectUserCalendar = async (req, res) => {
  try {
    const { calendarId } = req.body;
    const auth0Id = req.user.sub;

    if (!calendarId) {
      return res.status(400).json({ message: "calendarId requerido" });
    }

    const user = await prisma.user.findUnique({ where: { auth0Id } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { googleCalendarId: calendarId },
    });

    res.status(200).json({ message: "Calendario vinculado correctamente" });
  } catch (err) {
    console.error("❌ Error al guardar calendarId:", err);
    res.status(500).json({ message: "Error al guardar calendarId" });
  }
};
