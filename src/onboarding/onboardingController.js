import { prisma } from "../config/database.js";
import asyncHandler from "express-async-handler";
import { createParentalAccount as createParentalAccountService } from "../parentalAccounts/parentalService.js";
import { createHistoryEntry } from "../utils/historyUtils.js";

/**
 * 🎯 POST /api/onboarding/profile
 * Actualiza el perfil del usuario autenticado
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const parentalAccountId = req.user?.parentalAccountId;

    const { firstName, lastName, phone } = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "Nombre y apellido son obligatorios" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone },
    });

    await createHistoryEntry({
      userId,
      summary: `👤 Perfil actualizado: ${updatedUser.email}`,
      category: "onboarding",
      type: "update",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      parentalAccountId,
    });

    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error en updateProfile:", error);
    return res.status(500).json({ message: "Error al actualizar el perfil" });
  }
};

/**
 * 📌 Maneja el proceso de creación o unión a una cuenta parental
 */
export const handleFamilyOnboarding = asyncHandler(async (req, res) => {
  console.log("🚀 Inicio de handleFamilyOnboarding con datos:", req.body);

  try {
    const userId = req.user?.id; // Obtener el ID del usuario autenticado
    const { option, invitationCode } = req.body; // Obtener la opción y el código de invitación

    if (!userId || !option) {
      console.log("⚠️ Datos incompletos:", req.body);
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Buscar al usuario en la base de datos
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log("⚠️ Usuario no encontrado con ID:", userId);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let parentalAccount;

    // Si la opción es "new", creamos una nueva cuenta parental
    if (option === "new") {
      console.log(
        "🛠 Creando nueva cuenta parental para el usuario:",
        user.firstName
      );
      parentalAccount = await prisma.parentalAccount.create({
        data: {
          name: `Cuenta de ${user.firstName || "Padre"}`,
          users: { connect: { id: user.id } },
          calendar: { create: {} }, // Crear un calendario asociado
        },
      });
    }
    // Si la opción es "invite", buscamos el código de invitación y asociamos la cuenta
    else if (option === "invite" && invitationCode) {
      console.log(
        "🔑 Uniendo a cuenta parental con código de invitación:",
        invitationCode
      );
      const invitation = await prisma.invitation.findUnique({
        where: { code: invitationCode },
        include: { parentalAccount: true },
      });

      if (!invitation) {
        console.log("⚠️ Código de invitación no válido:", invitationCode);
        return res.status(404).json({ message: "Invitación no válida" });
      }

      parentalAccount = await prisma.parentalAccount.update({
        where: { id: invitation.parentalAccountId },
        data: {
          users: { connect: { id: user.id } },
        },
      });

      await prisma.invitation.delete({ where: { code: invitationCode } }); // Eliminar la invitación después de ser utilizada
    } else {
      console.log("⚠️ Opción no válida o falta código de invitación.");
      return res.status(400).json({ message: "Opción no válida" });
    }

    // Actualizar el usuario con el ID de la cuenta parental asociada
    await prisma.user.update({
      where: { id: user.id },
      data: { parentalAccountId: parentalAccount.id },
    });

    // Registrar el evento en el historial
    await createHistoryEntry({
      userId: user.id,
      summary: `👨‍👩‍👧‍👦 Asociado a cuenta parental: ${parentalAccount.id}`,
      category: "onboarding",
      type: "update",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      parentalAccountId: parentalAccount.id,
    });

    console.log(
      "✅ Cuenta parental asociada correctamente:",
      parentalAccount.id
    );
    return res.status(200).json({
      message: "Cuenta parental asociada correctamente",
      parentalAccountId: parentalAccount.id,
    });
  } catch (error) {
    console.error("❌ Error en handleFamilyOnboarding:", error);
    return res
      .status(500)
      .json({ message: "Error al asociar cuenta parental" });
  }
});
