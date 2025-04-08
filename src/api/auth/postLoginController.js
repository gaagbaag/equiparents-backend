// src/auth/postLoginController.js
import asyncHandler from "express-async-handler";
import { prisma } from "../config/database.js";
import { getRoleByName } from "../users/userService.js";
import { registerHistoryEvent } from "../history/historyService.js";

/**
 * 📌 Crear usuario automáticamente si no existe tras login con Auth0
 */
export const createUserPostLogin = asyncHandler(async (req, res) => {
  const auth0Id = req.auth?.payload?.sub;
  const email = req.auth?.payload?.email;

  console.log("🚀 POST /auth/post-login ejecutado");
  console.log("🔐 auth0Id del token:", auth0Id);
  console.log("📨 email del token:", email);

  if (!auth0Id || !email) {
    console.warn("❌ Faltan datos en el token (sub o email)");
    return res.status(400).json({ message: "Datos de sesión incompletos" });
  }

  // Buscar si ya existe
  const existingUser = await prisma.user.findUnique({ where: { auth0Id } });

  if (existingUser) {
    console.log("ℹ️ Usuario ya existente en DB:", existingUser.id);
    return res.status(200).json({ message: "Usuario ya registrado" });
  }

  // Buscar rol "parent"
  const role = await getRoleByName("parent");
  if (!role) {
    console.error("❌ Rol 'parent' no encontrado en la base de datos");
    return res.status(500).json({ message: "Rol por defecto no encontrado" });
  }

  console.log("🔧 Creando usuario nuevo en DB...");

  try {
    const newUser = await prisma.user.create({
      data: {
        auth0Id,
        email,
        roleId: role.id,
      },
    });

    console.log("✅ Usuario creado en DB con ID:", newUser.id);

    await registerHistoryEvent(newUser.id, "CREATED_USER_AUTOMATIC");
    console.log("🕓 Evento registrado en historial: CREATED_USER_AUTOMATIC");

    return res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id: newUser.id,
        email: newUser.email,
        auth0Id: newUser.auth0Id,
      },
    });
  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    return res.status(500).json({ message: "Error al crear usuario" });
  }
});
