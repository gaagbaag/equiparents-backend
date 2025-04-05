// prisma/seed-event-types.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const eventTypes = [
  { name: "actividad" },
  { name: "reunión" },
  { name: "evaluación" },
  { name: "cuidado" },
  { name: "vacuna" },
  { name: "viaje" },
  { name: "otro" },
];

async function seed() {
  for (const type of eventTypes) {
    const exists = await prisma.eventType.findUnique({
      where: { name: type.name },
    });

    if (!exists) {
      await prisma.eventType.create({ data: type });
      console.log(`✅ Tipo creado: ${type.name}`);
    } else {
      console.log(`⏩ Tipo ya existente: ${type.name}`);
    }
  }

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("❌ Error al crear tipos de eventos:", err);
  prisma.$disconnect();
  process.exit(1);
});
