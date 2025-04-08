import { prisma } from "../config/database.js";
import asyncHandler from "express-async-handler";
import { createParentalAccount as createParentalAccountService } from "./parentalService.js";
import { createHistoryEntry } from "../utils/historyUtils.js";

/**
 * 🔍 Devuelve el ID de la cuenta parental asociada al usuario logueado
 */
export const getParentalAccountForUser = asyncHandler(async (req, res) => {
  const auth0Id = req.auth.payload?.sub;

  if (!auth0Id) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
    include: {
      parentalAccount: {
        include: {
          users: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          children: true,
          calendar: true,
        },
      },
    },
  });

  if (!user?.parentalAccount) {
    return res.status(200).json(null); // No tiene cuenta parental
  }

  return res.status(200).json(user.parentalAccount); // Retorna la cuenta parental
});

/**
 * 📌 Crear una nueva cuenta parental
 */
export const createParentalAccount = asyncHandler(async (req, res) => {
  const auth0Id = req.auth.payload?.sub;

  if (!auth0Id) {
    return res.status(400).json({ message: "Usuario no autenticado" });
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // Llamada al servicio para crear la cuenta parental
  const newAccount = await createParentalAccountService(
    user.id,
    req.body?.name
  );

  // Registrar en History
  await createHistoryEntry({
    userId: user.id,
    summary: `Cuenta parental creada: ${newAccount.id}`,
    category: "onboarding",
    type: "create",
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    parentalAccountId: newAccount.id,
  });

  return res.status(201).json({
    message: "Cuenta parental creada exitosamente.",
    data: newAccount,
  });
});

/**
 * 📌 Obtener una cuenta parental por ID
 */
export const getParentalAccountById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const account = await prisma.parentalAccount.findUnique({
    where: { id },
    include: {
      users: true,
      children: true,
      calendar: true,
    },
  });

  if (!account) {
    return res
      .status(404)
      .json({ status: "error", message: "Cuenta parental no encontrada." });
  }

  return res.status(200).json({ status: "success", data: account });
});

/**
 * 📌 Actualizar una cuenta parental
 */
export const updateParentalAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedAccount = await prisma.parentalAccount.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Cuenta parental actualizada correctamente.",
    data: updatedAccount,
  });
});

/**
 * 📌 Eliminar una cuenta parental
 */
export const deleteParentalAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.parentalAccount.delete({ where: { id } });

  return res.status(200).json({
    status: "success",
    message: "Cuenta parental eliminada correctamente.",
  });
});

/**
 * 📩 Invitar a otro progenitor
 */
export const inviteParent = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const auth0Id = req.auth?.sub;

  if (!email) {
    return res.status(400).json({ message: "El correo es obligatorio." });
  }

  const user = await prisma.user.findUnique({
    where: { auth0Id },
    select: { id: true, parentalAccountId: true },
  });

  if (!user?.parentalAccountId) {
    return res.status(400).json({ message: "No tienes cuenta parental aún." });
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return res.status(400).json({ message: "El usuario ya está registrado." });
  }

  const invitationCode = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  await prisma.invitation.create({
    data: {
      email,
      parentalAccountId: user.parentalAccountId,
      invitationCode,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await createHistoryEntry({
    userId: user.id,
    parentalAccountId: user.parentalAccountId,
    type: "evento",
    category: "invitación",
    summary: `El usuario envió una invitación a ${email} para unirse a la cuenta parental.`,
  });

  return res.status(200).json({
    message: "Invitación enviada.",
    invitationCode,
  });
});

/**
 * 📥 Usar un código de invitación para unirse a una cuenta parental
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;
  const auth0Id = req.auth.payload?.sub;

  if (!inviteCode) {
    return res.status(400).json({ message: "Código de invitación requerido." });
  }

  const user = await prisma.user.findUnique({ where: { auth0Id } });

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado." });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { invitationCode: inviteCode },
    include: { parentalAccount: true },
  });

  if (!invitation) {
    return res.status(404).json({ message: "Código inválido." });
  }

  if (invitation.expiresAt < new Date()) {
    // Registrar en History
    await prisma.history.create({
      data: {
        parentalAccountId: invitation.parentalAccountId,
        userId: user.id,
        type: "invitación caducada",
        summary: `El usuario ${user.email} intentó usar un código expirado enviado a ${invitation.email}.`,
        ip:
          req.headers["x-forwarded-for"]?.toString() ||
          req.socket?.remoteAddress ||
          null,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    return res.status(410).json({ message: "El código ha expirado." });
  }

  const updatedUser = await prisma.user.update({
    where: { email: user.email },
    data: { parentalAccountId: invitation.parentalAccountId },
  });

  // 🧠 Registrar en History
  await prisma.history.create({
    data: {
      parentalAccountId: invitation.parentalAccountId,
      userId: updatedUser.id,
      type: "invitación aceptada",
      summary: `El usuario ${user.email} se unió a la cuenta parental mediante invitación.`,
      ip:
        req.headers["x-forwarded-for"]?.toString() ||
        req.socket?.remoteAddress ||
        null,
      userAgent: req.headers["user-agent"] || null,
    },
  });

  await createHistoryEntry({
    userId: updatedUser.id,
    parentalAccountId: invitation.parentalAccountId,
    type: "evento",
    category: "invitación",
    summary: `El usuario se unió a una cuenta parental mediante código de invitación.`,
  });

  await prisma.invitation.delete({
    where: { invitationCode: inviteCode },
  });

  return res.status(200).json({
    message: "Te has unido a la cuenta parental exitosamente.",
  });
});
