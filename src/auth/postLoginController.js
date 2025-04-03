// src/auth/postLoginController.js
import asyncHandler from "express-async-handler";
import { prisma } from "../config/database.js";
import { getRoleByName } from "../users/userService.js";
import { registerHistoryEvent } from "../history/historyService.js";

export const createUserPostLogin = asyncHandler(async (req, res) => {
  const auth0Id = req.auth.payload?.sub;
  const email = req.auth.payload?.email;

  if (!auth0Id || !email) {
    return res.status(400).json({ message: "Datos de sesión incompletos" });
  }

  const existingUser = await prisma.user.findUnique({ where: { auth0Id } });

  if (existingUser) {
    return res.status(200).json({ message: "Usuario ya registrado" });
  }

  const role = await getRoleByName("parent");
  if (!role) {
    return res.status(500).json({ message: "Rol por defecto no encontrado" });
  }

  const newUser = await prisma.user.create({
    data: {
      auth0Id,
      email,
      roleId: role.id,
    },
  });

  await registerHistoryEvent(newUser.id, "CREATED_USER_AUTOMATIC");

  res
    .status(201)
    .json({ message: "Usuario creado correctamente", user: newUser });
});
