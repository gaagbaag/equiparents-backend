import { prisma } from "../config/database.js";

/**
 * 📌 Obtener todos los hijos de una cuenta parental
 */
export const fetchAllChildren = async (parentalAccountId) => {
  return await prisma.child.findMany({
    where: { parentalAccountId },
    select: { id: true, name: true, dateOfBirth: true },
  });
};

/**
 * 📌 Obtener un hijo por ID
 * Añadimos validación para asegurar que el hijo pertenezca a la cuenta parental
 */
export const fetchChildById = async (id, parentalAccountId) => {
  const child = await prisma.child.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      parentalAccountId: true,
    },
  });

  if (child && child.parentalAccountId !== parentalAccountId) {
    throw new Error("Este hijo no pertenece a tu cuenta parental.");
  }

  return child;
};

/**
 * 📌 Crear un nuevo hijo
 */
export const createNewChild = async (
  name,
  dateOfBirth,
  parentalAccountId,
  userId
) => {
  return await prisma.child.create({
    data: { name, dateOfBirth, parentalAccountId, userId },
  });
};

/**
 * 📌 Actualizar los datos de un hijo
 * Añadimos validación para asegurarnos que el hijo pertenece a la cuenta parental del usuario
 */
export const updateExistingChild = async (
  id,
  updateData,
  parentalAccountId
) => {
  const child = await prisma.child.findUnique({
    where: { id: Number(id) },
  });

  if (!child || child.parentalAccountId !== parentalAccountId) {
    throw new Error("No tienes permiso para actualizar este hijo.");
  }

  return await prisma.child.update({
    where: { id: Number(id) },
    data: { ...updateData, updatedAt: new Date() },
  });
};

/**
 * 📌 Eliminar un hijo por ID
 * Añadimos validación para asegurarnos que el hijo pertenece a la cuenta parental
 */
export const removeChild = async (id, parentalAccountId) => {
  const child = await prisma.child.findUnique({
    where: { id: Number(id) },
  });

  if (!child || child.parentalAccountId !== parentalAccountId) {
    throw new Error("No tienes permiso para eliminar este hijo.");
  }

  return await prisma.child.delete({ where: { id: Number(id) } });
};
