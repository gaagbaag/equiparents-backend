import { prisma } from "../config/database.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [users, accounts, children, history] = await Promise.all([
      prisma.user.count(),
      prisma.parentalAccount.count(),
      prisma.child.count(),
      prisma.history.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: true,
          category: true,
        },
      }),
    ]);

    return res.status(200).json({
      users,
      accounts,
      children,
      history,
    });
  } catch (err) {
    console.error("❌ Error en admin stats:", err);
    return res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

export const getAllUsersWithAccounts = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        parentalAccount: {
          select: {
            id: true,
            name: true,
            children: {
              select: { id: true },
            },
          },
        },
        role: true,
      },
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("❌ Error en getAllUsersWithAccounts:", err);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;

  if (!newRole) return res.status(400).json({ message: "Rol requerido" });

  try {
    const role = await prisma.role.findUnique({ where: { name: newRole } });

    if (!role) return res.status(404).json({ message: "Rol no válido" });

    const updated = await prisma.user.update({
      where: { id },
      data: { roleId: role.id },
    });

    return res.status(200).json({ message: "Rol actualizado", user: updated });
  } catch (err) {
    console.error("❌ Error actualizando rol:", err);
    res.status(500).json({ message: "Error al actualizar rol" });
  }
};

export const unlinkParentalAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { parentalAccountId: null },
    });

    return res
      .status(200)
      .json({ message: "Cuenta desvinculada", user: updated });
  } catch (err) {
    console.error("❌ Error desvinculando:", err);
    res.status(500).json({ message: "Error al desvincular usuario" });
  }
};

/**
 * 📅 GET /api/admin/events
 * Lista todos los eventos del sistema (admin)
 */
export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        calendar: {
          include: {
            parentalAccount: {
              select: { name: true, id: true },
            },
          },
        },
        category: true,
        child: true,
      },
      orderBy: { start: "desc" },
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.error("❌ Error al obtener eventos globales:", error);
    return res.status(500).json({ message: "Error al obtener eventos" });
  }
};

/**
 * 🗑️ DELETE /api/admin/events/:id
 * Elimina un evento específico (solo admin)
 */
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado." });
    }

    await prisma.event.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Evento eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar evento:", error);
    return res.status(500).json({ message: "Error al eliminar evento." });
  }
};

const trackedSummaries = [
  "Ingreso diario:",
  "Nuevo usuario registrado:",
  "Invitación creada:",
];

export const cleanHistory = async (req, res) => {
  try {
    const entries = await prisma.history.findMany({
      where: {
        summary: {
          in: trackedSummaries.map((s) => ({
            startsWith: s,
          })),
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const seen = new Set();
    const duplicates = [];

    for (const entry of entries) {
      const summaryKey = trackedSummaries.find((s) =>
        entry.summary.startsWith(s)
      );
      if (!summaryKey) continue;

      const key = `${entry.userId}-${entry.parentalAccountId}-${entry.createdAt
        .toISOString()
        .slice(0, 10)}-${summaryKey}`;
      if (seen.has(key)) {
        duplicates.push(entry.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      await prisma.history.deleteMany({
        where: { id: { in: duplicates } },
      });

      const reference = entries.find((e) => !duplicates.includes(e.id));

      await prisma.history.create({
        data: {
          type: "sistema",
          category: { connect: { name: "sistema" } },
          summary: `Limpieza manual: ${duplicates.length} entradas duplicadas eliminadas.`,
          userId: reference?.userId,
          parentalAccountId: reference?.parentalAccountId,
          ip: req.ip,
          userAgent: req.get("User-Agent") || "admin-panel",
        },
      });
    }

    return res.status(200).json({
      message: `Limpieza realizada. ${duplicates.length} entradas duplicadas eliminadas.`,
    });
  } catch (error) {
    console.error("❌ Error en limpieza de historial:", error);
    return res.status(500).json({ message: "Error en limpieza de historial" });
  }
};
