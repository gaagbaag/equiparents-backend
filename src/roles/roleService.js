import { prisma } from "../config/database.js";

/**
 * 📌 Obtener todos los roles
 * @returns {Promise<Array>} - Lista de roles
 */
export const getAllRoles = async () => {
  try {
    return await prisma.role.findMany();
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    throw new Error("Error al obtener roles");
  }
};

/**
 * 📌 Obtener un rol por ID
 * @param {string} id - ID del rol
 * @returns {Promise<Object|null>} - Rol encontrado o `null` si no existe
 */
export const getRoleById = async (id) => {
  try {
    return await prisma.role.findUnique({
      where: { id: Number(id) },
    });
  } catch (error) {
    console.error("❌ Error al obtener el rol por ID:", error);
    throw new Error("Error al obtener el rol");
  }
};

/**
 * 📌 Crear un nuevo rol
 * @param {Object} roleData - Datos del rol
 * @returns {Promise<Object>} - Rol creado
 */
export const createRole = async (roleData) => {
  try {
    // Verificar si el rol ya existe
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      throw new Error("Ya existe un rol con este nombre.");
    }

    // Crear un nuevo rol
    const newRole = await prisma.role.create({
      data: roleData,
    });

    return newRole; // Retorna el rol creado
  } catch (error) {
    console.error("❌ Error al crear el rol:", error);
    throw new Error("No se pudo crear el rol.");
  }
};

/**
 * 📌 Actualizar un rol por ID
 * @param {number} id - ID del rol
 * @param {Object} roleData - Datos a actualizar
 * @returns {Promise<Object>} - Rol actualizado
 */
export const updateRole = async (id, roleData) => {
  try {
    // Verificar que el rol exista antes de actualizar
    const existingRole = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRole) {
      throw new Error("Rol no encontrado.");
    }

    return await prisma.role.update({
      where: { id: Number(id) },
      data: roleData,
    });
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error);
    throw new Error("No se pudo actualizar el rol.");
  }
};

/**
 * 📌 Eliminar un rol por ID
 * @param {number} id - ID del rol
 * @returns {Promise<Object>} - Confirmación de eliminación
 */
export const deleteRole = async (id) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
    });

    if (!role) {
      throw new Error("Rol no encontrado");
    }

    await prisma.role.delete({
      where: { id: Number(id) },
    });

    return role; // Retorna el rol eliminado o lo que prefieras.
  } catch (error) {
    console.error("❌ Error al eliminar el rol:", error);
    throw new Error("No se pudo eliminar el rol.");
  }
};
