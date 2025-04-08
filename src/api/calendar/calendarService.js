import { prisma } from "../config/database.js";

export const createCalendarForAccount = async (parentalAccountId) => {
  return await prisma.calendar.create({
    data: {
      parentalAccountId,
    },
  });
};

export async function getChildren() {
  const res = await fetch("/children", {
    headers: {
      Authorization: `Bearer ${getAccessTokenFromCookie()}`,
    },
  });

  if (!res.ok) {
    console.error("❌ Error en getChildren:", res.statusText);
    throw new Error("Error al obtener hijos");
  }

  const json = await res.json();
  return json.data; // 👈 importante si tu backend responde como { status, data }
}
