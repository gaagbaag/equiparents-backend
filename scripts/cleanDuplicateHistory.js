import { prisma } from "../src/config/database.js";

// Resúmenes base a limpiar (por categoría lógica)
const trackedSummaries = [
  "Ingreso diario:",
  "Nuevo usuario registrado:",
  "Invitación creada:",
];

async function main() {
  const allEntries = await prisma.history.findMany({
    where: {
      summary: {
        in: trackedSummaries.map((s) => ({
          startsWith: s,
        })),
      },
    },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });

  const seen = new Set();
  const duplicates = [];

  for (const entry of allEntries) {
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

    // Usa el primer user/account disponibles
    const reference = allEntries.find((e) => !duplicates.includes(e.id));

    await prisma.history.create({
      data: {
        type: "sistema",
        category: {
          connect: { name: "sistema" },
        },
        summary: `Limpieza automática: ${duplicates.length} duplicados eliminados en historial.`,
        user: { connect: { id: reference.userId } },
        parentalAccount: { connect: { id: reference.parentalAccountId } },
        ip: "cronjob",
        userAgent: "system-cleaner",
      },
    });

    console.log(`🧹 ${duplicates.length} duplicados eliminados y registrados.`);
  } else {
    console.log("✅ No se encontraron duplicados.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error limpiando historial:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
