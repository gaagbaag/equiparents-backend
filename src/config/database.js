import { PrismaClient } from "@prisma/client";

// Prisma Client: solo se crea una instancia para reutilizarla (evitar nuevas conexiones en cada import)
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Usar una instancia global en desarrollo para evitar que se creen múltiples instancias
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Conectado a la base de datos");
  } catch (error) {
    console.error("❌ No se pudo conectar a la base de datos:", error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("🔌 Desconectado de la base de datos");
  } catch (error) {
    console.error("❌ Error al cerrar la conexión:", error.message);
  }
};

export { prisma, connectDB, disconnectDB };
