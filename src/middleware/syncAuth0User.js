import { prisma } from "../config/database.js";
import { createHistoryEntry } from "../utils/historyUtils.js";

const syncAuth0User = async (req, res, next) => {
  console.log("💻 Middleware `syncAuth0User` ejecutándose...");

  try {
    const auth0User = req.auth;

    if (!auth0User?.sub || !auth0User.email) {
      console.warn("⚠️ Usuario inválido o sin email.");
      return res.status(400).json({ error: "Usuario inválido." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { auth0Id: auth0User.sub },
    });

    if (existingUser) {
      console.log("🔁 Usuario ya existe:", existingUser.email);
      return next();
    }

    console.log("🆕 Creando usuario...");

    // Buscar o crear el rol parent
    let parentRole = await prisma.role.findUnique({
      where: { name: "parent" },
    });

    if (!parentRole) {
      parentRole = await prisma.role.create({ data: { name: "parent" } });
      console.log("✅ Rol 'parent' creado automáticamente.");
    }

    const newUser = await prisma.user.create({
      data: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name || null,
        picture: auth0User.picture || null,
        firstName: auth0User.given_name || "",
        lastName: auth0User.family_name || "",
        role: { connect: { id: parentRole.id } },
      },
    });

    console.log("✅ Usuario creado3:", newUser.email);

    await createHistoryEntry({
      parentalAccountId: newUser.parentalAccountId || null,
      userId: newUser.id,
      type: "evento",
      category: "registro",
      summary: `Usuario registrado automáticamente desde Auth0 (${newUser.email})`,
    });

    console.log("📝 Historial creado.");
    next();
  } catch (error) {
    console.error("❌ Error en syncAuth0User:", error);
    return res.status(500).json({ error: "Error interno en sincronización." });
  }
};

export default syncAuth0User;
