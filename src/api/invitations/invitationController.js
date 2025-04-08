import { prisma } from "../config/database.js";
import asyncHandler from "express-async-handler";
import { createInvitation } from "./invitationService.js";
import { createHistoryEntry } from "../utils/historyUtils.js";

/**
 * 📌 Enviar una invitación a otro progenitor (requiere autenticación)
 */
export const sendInvitation = async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub;

    if (!auth0Id) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado. Se requiere un token válido.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.parentalAccountId) {
      return res.status(403).json({
        status: "error",
        message:
          "Debes tener una cuenta parental para invitar a otro progenitor.",
      });
    }

    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        status: "error",
        message: "El email y el nombre son obligatorios.",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "El formato del correo electrónico no es válido.",
      });
    }

    // 🧠 1. Crear la invitación
    const invitation = await createInvitation(
      email,
      firstName,
      user.parentalAccountId,
      user.id,
      req
    );

    // 📨 2. Simulación de envío de correo
    console.log("📨 (Simulado) Enviando invitación a:", email);
    console.log(`✅ Código de invitación: ${invitation.code}`);

    // 📝 3. Registrar en History
    await createHistoryEntry({
      userId: user.id,
      parentalAccountId: user.parentalAccountId,
      type: "evento",
      category: "invitación",
      summary: `Se invitó a ${email} a unirse a la cuenta parental.`,
      ip:
        req.headers["x-forwarded-for"]?.toString() ||
        req.socket?.remoteAddress ||
        null,
      userAgent: req.headers["user-agent"] || null,
    });

    return res.status(200).json({
      status: "success",
      message: "Invitación enviada exitosamente (simulada).",
      data: invitation,
    });
  } catch (error) {
    console.error("❌ Error al enviar la invitación:", error);
    return res.status(500).json({
      status: "error",
      message: "No se pudo enviar la invitación.",
    });
  }
};

/**
 * 📥 Aceptar una invitación con código
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { invitationCode } = req.body;
  const auth0Id = req.auth?.payload?.sub;

  if (!invitationCode) {
    return res.status(400).json({ message: "Código de invitación requerido." });
  }

  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado." });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { code: invitationCode },
  });

  if (!invitation) {
    return res.status(404).json({ message: "Código de invitación inválido." });
  }

  const now = new Date();
  if (now > invitation.expiresAt) {
    return res.status(410).json({ message: "El código ha expirado." });
  }

  // Asociar usuario a la cuenta parental
  await prisma.user.update({
    where: { id: user.id },
    data: { parentalAccountId: invitation.parentalAccountId },
  });

  // Registrar historial
  await prisma.history.create({
    data: {
      parentalAccountId: invitation.parentalAccountId,
      userId: user.id,
      type: "invitación aceptada",
      summary: `El usuario se unió mediante el código ${invitation.code}`,
      ip:
        req.headers["x-forwarded-for"]?.toString() ||
        req.socket?.remoteAddress ||
        null,
      userAgent: req.headers["user-agent"] || null,
    },
  });

  // Eliminar invitación aceptada
  await prisma.invitation.delete({ where: { code: invitation.code } });

  return res.status(200).json({
    status: "success",
    message: "Te has unido a la cuenta parental exitosamente.",
  });
});

/**
 * 📌 Obtener invitación activa del usuario autenticado
 */
export const getActiveInvitation = async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    if (!auth0Id) {
      return res.status(401).json({ message: "No autenticado." });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.parentalAccountId) {
      return res
        .status(200)
        .json({ data: null, message: "Sin cuenta parental." });
    }

    // Eliminar invitaciones expiradas
    const expired = await prisma.invitation.findMany({
      where: {
        parentalAccountId: user.parentalAccountId,
        expiresAt: { lt: new Date() },
      },
    });

    for (const inv of expired) {
      await prisma.invitation.delete({ where: { id: inv.id } });

      await createHistoryEntry({
        userId: user.id,
        parentalAccountId: user.parentalAccountId,
        type: "invitación caducada",
        summary: `La invitación enviada a ${inv.email} caducó el ${new Date(
          inv.expiresAt
        ).toLocaleDateString("es-CL")}.`,
      });
    }

    const active = await prisma.invitation.findFirst({
      where: {
        parentalAccountId: user.parentalAccountId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!active) {
      return res.status(200).json({
        data: null,
        message: expired.length
          ? `La invitación enviada a ${expired[0].email} ha caducado.`
          : "No hay invitación activa.",
      });
    }

    return res.status(200).json({ status: "success", data: active });
  } catch (err) {
    console.error("❌ Error al obtener invitación:", err);
    return res
      .status(200)
      .json({ data: null, message: "No hay invitación activa." });
  }
};

/**
 * ❌ Cancelar invitación activa
 */
export const deleteActiveInvitation = async (req, res) => {
  try {
    const auth0Id = req.auth.payload?.sub;

    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.parentalAccountId) {
      return res
        .status(403)
        .json({ status: "error", message: "Sin cuenta parental." });
    }

    // Buscar invitación activa primero
    const invitation = await prisma.invitation.findFirst({
      where: {
        parentalAccountId: user.parentalAccountId,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "No hay invitación activa para cancelar." });
    }

    // Eliminar la invitación
    await prisma.invitation.delete({
      where: { id: invitation.id },
    });

    // Registrar historial
    await prisma.history.create({
      data: {
        parentalAccountId: user.parentalAccountId,
        userId: user.id,
        type: "invitación cancelada",
        summary: `Se canceló la invitación enviada a ${invitation.email}.`,
        ip:
          req.headers["x-forwarded-for"]?.toString() ||
          req.socket?.remoteAddress ||
          null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Invitación cancelada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al cancelar invitación:", error);
    return res.status(500).json({
      status: "error",
      message: "No se pudo cancelar la invitación.",
    });
  }
};

/**
 * ❌ Obtener invitación caducada aún visible (7 días después de expiración)
 */
export const getExpiredInvitation = async (req, res) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    if (!auth0Id) {
      return res.status(200).json({ data: null });
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user?.parentalAccountId) {
      return res.status(200).json({ data: null });
    }

    // Invitaciones caducadas dentro de los últimos 14 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

    const expired = await prisma.invitation.findFirst({
      where: {
        parentalAccountId: user.parentalAccountId,
        acceptedAt: null,
        canceledAt: null,
        expiresAt: {
          lt: new Date(),
          gt: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!expired) {
      return res.status(200).json({ data: null });
    }

    return res.status(200).json({
      data: {
        email: expired.email,
        createdAt: expired.createdAt,
        expiredAt: expired.expiresAt,
      },
    });
  } catch (err) {
    console.warn("⚠️ Error controlado en getExpiredInvitation:", err.message);
    return res.status(200).json({ data: null });
  }
};
