import { prisma } from "../config/database.js";

// Obtener perfil del usuario autenticado
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        role: true,
        address: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      countryCode: user.countryCode,
      countryDialCode: user.countryDialCode,
      role: user.role?.name,
      parentalAccountId: user.parentalAccountId,
      address: user.address,
    });
  } catch (error) {
    console.error("❌ Error en GET /users/me:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los usuarios (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error en GET /users:", error);
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Admin actualiza a cualquier usuario por ID
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, countryCode, phone } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, countryCode, phone },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error en PUT /users/:id:", error);
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// Admin elimina a cualquier usuario por ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).end();
  } catch (error) {
    console.error("❌ Error en DELETE /users/:id:", error);
    return res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// Usuario actual actualiza sus datos
export const updateCurrentUser = async (req, res) => {
  const auth0Id = req.auth?.payload?.sub;
  const { firstName, lastName, phone, countryCode, countryDialCode, address } =
    req.body;

  if (!auth0Id) {
    return res.status(401).json({ message: "Token inválido" });
  }

  if (!countryCode || !countryDialCode || !phone) {
    return res.status(400).json({
      message: "Faltan datos obligatorios: país o teléfono",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: {
        firstName,
        lastName,
        phone,
        countryCode,
        countryDialCode,
        address: {
          upsert: {
            update: {
              country: address.country,
              state: address.state,
              city: address.city,
              zipCode: address.zipCode,
              street: address.street,
              number: address.number,
              departmentNumber: address.departmentNumber,
            },
            create: {
              country: address.country,
              state: address.state,
              city: address.city,
              zipCode: address.zipCode,
              street: address.street,
              number: address.number,
              departmentNumber: address.departmentNumber,
            },
          },
        },
      },
      include: {
        address: true,
        role: true,
      },
    });

    return res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      countryCode: updatedUser.countryCode,
      countryDialCode: updatedUser.countryDialCode,
      role: updatedUser.role?.name,
      parentalAccountId: updatedUser.parentalAccountId,
      address: updatedUser.address,
    });
  } catch (error) {
    console.error("❌ Error en PUT /users/me:", error);
    return res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// Recupera usuario actual
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("❌ Error al obtener el usuario actual:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Admin cambia rol de cualquier usuario
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  if (!roleId) {
    return res.status(400).json({ message: "El campo roleId es obligatorio" });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { roleId },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error en PATCH /users/:id/role:", error);
    return res.status(500).json({ message: "Error al cambiar rol" });
  }
};

// Recupera el usuario usan userSub
// Obtener usuario por sub (lo que hace el backend)
export const getUserBySub = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        sub: req.params.sub, // Buscamos el usuario por su 'sub'
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error al obtener los datos del usuario" });
  }
};

export const updateUserBySub = async (req, res) => {
  const { sub } = req.params; // Usamos el `sub` para identificar al usuario
  const { firstName, lastName, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { sub },
      data: { firstName, lastName, email },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      error: "Error al actualizar los datos del usuario",
      message: error.message,
    });
  }
};
