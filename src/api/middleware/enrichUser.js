import { prisma } from "../config/database.js";

export const enrichUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    if (!auth0Id) return res.status(401).json({ message: "No autenticado" });

    const user = await prisma.user.findUnique({
      where: { auth0Id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: { select: { name: true } },
        parentalAccountId: true,
      },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error al enriquecer usuario:", error);
    res.status(500).json({ message: "Error interno al autenticar usuario" });
  }
};
