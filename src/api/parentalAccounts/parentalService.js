import { prisma } from "../config/database.js";
import { createCalendarForAccount } from "../calendar/calendarService.js";

/**
 * 📌 Crea una cuenta parental con calendario y asocia al usuario
 */
export const createParentalAccount = async (userId, baseName = null) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new Error("Usuario no encontrado");

  const name = baseName || `Cuenta de ${user.firstName || "Padre"}`;

  const parentalAccount = await prisma.parentalAccount.create({
    data: {
      name,
      users: { connect: { id: userId } },
      calendar: { create: {} }, // Se crea un calendario vacío para la cuenta
    },
  });

  return parentalAccount; // Retorna la cuenta parental creada
};
