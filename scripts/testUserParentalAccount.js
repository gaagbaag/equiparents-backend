import { prisma } from "../src/config/database.js";

// Cambia este valor por un Auth0 ID real de prueba
const testAuth0Id = "auth0|usuario-ejemplo-id";

async function testUserParentalAccount(auth0Id) {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: {
        parentalAccount: {
          include: {
            users: true,
            calendar: true,
            children: true,
          },
        },
      },
    });

    if (!user) {
      console.log("❌ Usuario no encontrado.");
      return;
    }

    console.log("✅ Usuario encontrado:", {
      email: user.email,
      parentalAccountId: user.parentalAccountId,
    });

    if (user.parentalAccount) {
      console.log("🎉 Cuenta parental asociada:");
      console.dir(user.parentalAccount, { depth: null });
    } else {
      console.log("⚠️ Usuario no tiene cuenta parental asignada.");
    }
  } catch (error) {
    console.error("❌ Error al verificar:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserParentalAccount(testAuth0Id);
