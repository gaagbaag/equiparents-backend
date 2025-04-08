import { prisma } from "../config/database.js";
import crypto from "crypto";
import { getClientIP, getUserAgent } from "../utils/requestInfo.js";
import { createHistoryEntry } from "../utils/historyUtils.js";

/**
 * 📌 Verifica si ya existe una invitación activa para esta cuenta parental
 */
const hasActiveInvitation = async (parentalAccountId) => {
  const existing = await prisma.invitation.findFirst({
    where: {
      parentalAccountId,
      expiresAt: {
        gte: new Date(),
      },
    },
  });
  return !!existing;
};

/**
 * 📌 Genera un código de invitación único (con verificación de colisión)
 */
const generateInvitationCode = async () => {
  let code;
  let exists;

  do {
    code = crypto.randomBytes(8).toString("hex").toUpperCase();
    exists = await prisma.invitation.findUnique({
      where: { code },
    });
  } while (exists);

  return code;
};

/**
 * 📌 Crea una invitación para un progenitor (y elimina expiradas previas)
 */
export const createInvitation = async (
  email,
  firstName,
  parentalAccountId,
  senderId,
  req
) => {
  if (!parentalAccountId) {
    throw new Error("Cuenta parental no proporcionada.");
  }

  // 🧹 Eliminar invitaciones caducadas
  const expired = await prisma.invitation.findMany({
    where: {
      parentalAccountId,
      expiresAt: { lt: new Date() },
    },
  });

  for (const inv of expired) {
    await prisma.invitation.delete({ where: { id: inv.id } });

    await createHistoryEntry({
      userId: senderId,
      parentalAccountId,
      type: "invitación caducada",
      summary: `La invitación enviada a ${inv.email} caducó el ${new Date(
        inv.expiresAt
      ).toLocaleDateString("es-CL")}.`,
      ip: getClientIP(req),
      userAgent: getUserAgent(req),
    });
  }

  // ⛔ Validación de duplicado
  const alreadyInvited = await hasActiveInvitation(parentalAccountId);
  if (alreadyInvited) {
    throw new Error(
      "Ya existe una invitación activa para esta cuenta parental."
    );
  }

  const code = await generateInvitationCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  const invitation = await prisma.invitation.create({
    data: {
      email,
      firstName,
      code,
      parentalAccountId,
      invitedById: senderId,
      expiresAt,
    },
  });

  await createHistoryEntry({
    userId: senderId,
    parentalAccountId,
    type: "invitación creada",
    summary: `Invitaste a ${email} (${firstName}) con el código ${code}.`,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
  });

  return invitation;
};

/**
 * 📌 Valida si un código de invitación es válido
 */
export const validateInvitationCode = async (code, email) => {
  const invitation = await prisma.invitation.findFirst({
    where: { code, email },
  });

  if (!invitation) {
    throw new Error("Código de invitación no válido.");
  }

  return invitation.parentalAccountId;
};

/**
 * 📌 Vincula un usuario a una cuenta parental tras aceptar la invitación
 */
export const linkUserToParentalAccount = async (email, parentalAccountId) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  const updatedUser = await prisma.$transaction(async (prisma) => {
    return await prisma.user.update({
      where: { email },
      data: { parentalAccountId },
    });
  });

  return updatedUser;
};
