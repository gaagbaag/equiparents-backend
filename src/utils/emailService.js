// src/utils/emailService.js (Gmail OAuth2)
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 📡 Configurar el transporte Nodemailer con OAuth2 para Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SMTP_USER,
    clientId: process.env.SMTP_CLIENT_ID,
    clientSecret: process.env.SMTP_CLIENT_SECRET,
    refreshToken: process.env.SMTP_REFRESH_TOKEN,
  },
});

/**
 * 📩 Enviar un correo usando Gmail OAuth2
 * @param {Object} options
 * @param {string|string[]} options.to - Destinatario(s)
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 * @param {string} [options.text] - Contenido plano (opcional)
 * @param {Array} [options.attachments] - Archivos adjuntos (opcional)
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
  attachments = [],
}) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Faltan datos requeridos para enviar el correo.");
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado:", info.messageId);
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    throw new Error("No se pudo enviar el correo.");
  }
};
