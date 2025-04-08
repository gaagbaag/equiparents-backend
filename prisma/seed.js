import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{ name: "admin" }, { name: "parent" }],
    skipDuplicates: true,
  });
  console.log("🌱 Roles insertados");

  await prisma.category.createMany({
    data: [
      { name: "Visita", type: "event", color: "#4F46E5", icon: "users" },
      { name: "Salud", type: "event", color: "#DC2626", icon: "heart" },
      { name: "Cumpleaños", type: "event", color: "#F59E0B", icon: "cake" },
      { name: "Escolar", type: "event", color: "#0EA5E9", icon: "book-open" },
      {
        name: "Actividad Cultural",
        type: "event",
        color: "#8B5CF6",
        icon: "palette",
      },
      { name: "Recreativo", type: "event", color: "#10B981", icon: "gamepad" },
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
      { name: "Transporte", type: "expense", color: "#F97316", icon: "car" },
      { name: "Servicios", type: "expense", color: "#EF4444", icon: "tools" },
      { name: "Sistema", type: "history", color: "#6B7280", icon: "terminal" },
      { name: "Invitación", type: "history", color: "#6366F1", icon: "mail" },
      {
        name: "Evento",
        type: "history",
        color: "#0F766E",
        icon: "calendar-plus",
      },
      { name: "Gasto", type: "history", color: "#FACC15", icon: "credit-card" },
    ],
    skipDuplicates: true,
  });
  console.log("🌱 Categorías insertadas");

  await prisma.tag.createMany({
    data: [
      { name: "Presencial", appliesTo: "event" },
      { name: "Virtual", appliesTo: "event" },
      { name: "Híbrido", appliesTo: "event" },
      { name: "Recurrente", appliesTo: "event" },
      { name: "Urgente", appliesTo: "event" },
      { name: "Planificado", appliesTo: "event" },
      { name: "Interactivo", appliesTo: "event" },
      { name: "Familiar", appliesTo: "event" },
      { name: "Fijo", appliesTo: "expense" },
      { name: "Variable", appliesTo: "expense" },
      { name: "Prioritario", appliesTo: "expense" },
      { name: "Eventual", appliesTo: "expense" },
    ],
    skipDuplicates: true,
  });
  console.log("🏷️ Etiquetas insertadas");

  await prisma.metric.createMany({
    data: [
      {
        name: "Cantidad de eventos mensuales",
        key: "monthly_event_count",
        appliesTo: "event",
        description: "Número total de eventos por mes",
        chartType: "bar",
      },
      {
        name: "Horas compartidas por hij@",
        key: "child_shared_hours",
        appliesTo: "event",
        description: "Total de horas compartidas por niño/a",
        chartType: "bar",
      },
      {
        name: "Gasto total mensual",
        key: "monthly_expense_total",
        appliesTo: "expense",
        description: "Suma de todos los gastos mensuales",
        chartType: "line",
      },
      {
        name: "Distribución por tipo de gasto",
        key: "expense_type_distribution",
        appliesTo: "expense",
        description: "Porcentaje por categoría de gasto",
        chartType: "pie",
      },
      {
        name: "Eventos por tipo de actividad",
        key: "event_category_distribution",
        appliesTo: "event",
        description: "Distribución de eventos por categoría",
        chartType: "pie",
      },
    ],
    skipDuplicates: true,
  });
  console.log("📊 Métricas insertadas");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
