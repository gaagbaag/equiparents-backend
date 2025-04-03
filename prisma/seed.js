import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Roles base
  await prisma.role.createMany({
    data: [{ name: "admin" }, { name: "parent" }],
    skipDuplicates: true,
  });
  console.log("🌱 Roles insertados");

  // Categorías base reutilizables
  await prisma.category.createMany({
    data: [
      // Eventos
      { name: "Visita", type: "event", color: "#4F46E5", icon: "users" },
      { name: "Salud", type: "event", color: "#DC2626", icon: "heart" },
      { name: "Cumpleaños", type: "event", color: "#F59E0B", icon: "cake" },

      // Gastos
      {
        name: "Pensión",
        type: "expense",
        color: "#16A34A",
        icon: "dollar-sign",
      },
      { name: "Educación", type: "expense", color: "#3B82F6", icon: "book" },
      {
        name: "Alimentación",
        type: "expense",
        color: "#10B981",
        icon: "shopping-cart",
      },

      // Historial
      { name: "Sistema", type: "history", color: "#6B7280", icon: "terminal" },
      { name: "Invitación", type: "history", color: "#6366F1", icon: "mail" },
    ],
    skipDuplicates: true,
  });

  console.log("🌱 Categorías insertadas");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
