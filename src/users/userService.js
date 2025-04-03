import { prisma } from "../config/database.js";
import bcrypt from "bcryptjs";

/**
 * 📌 Verifica si un usuario ya existe en la base de datos por email.
 * @param {string} email - Email del usuario
 * @returns {Promise<boolean>} - `true` si el usuario existe, `false` si no
 */
export const validateExistingUser = async (email) => {
  if (!email) {
    console.error("❌ Error: Email no proporcionado.");
    return false;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
  } catch (error) {
    console.error("❌ Error al validar usuario existente:", error);
    throw new Error("Error al verificar si el usuario existe.");
  }
};

/**
 * 📌 Obtiene un rol por su nombre.
 * @param {string} roleName - Nombre del rol
 * @returns {Promise<Object|null>} - Retorna el rol si existe, `null` si no
 */
export const getRoleByName = async (roleName) => {
  if (!roleName) {
    console.error("❌ Error: roleName no está definido.");
    return null;
  }

  try {
    const role = await prisma.role.findUnique({ where: { name: roleName } });

    if (!role) {
      console.error("❌ Error: No se encontró el rol con el nombre:", roleName);
    }

    return role;
  } catch (error) {
    console.error("❌ Error al obtener el rol:", error);
    throw new Error("Error al obtener el rol.");
  }
};

/**
 * 📌 Obtiene un usuario por email.
 * @param {string} email - Email del usuario a buscar
 * @returns {Promise<Object|null>} - Retorna el usuario si existe, `null` si no
 */
export const getUserByEmail = async (email) => {
  if (!email) {
    console.error("❌ Error: Email no proporcionado.");
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { email },
      include: { role: true, parentalAccount: true },
    });
  } catch (error) {
    console.error("❌ Error al obtener usuario por email:", error);
    throw new Error("Error al obtener el usuario por email.");
  }
};

/**
 * 📌 Crea un nuevo usuario con contraseña encriptada.
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Usuario creado
 */
export const createUser = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  roleId,
}) => {
  if (!Number.isInteger(roleId))
    throw new Error("roleId debe ser un número válido.");

  try {
    // Validar que el rol exista antes de crear el usuario
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new Error("El rol proporcionado no existe.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Usar una transacción para crear el usuario y asociar el rol
    const newUser = await prisma.$transaction(async (prisma) => {
      return await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
          roleId,
        },
      });
    });
    console.log("✅ Usuario creado2:", newUser);

    return newUser;
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    throw new Error("Error al registrar usuario.");
  }
};
