import { prisma } from "../config/database.js"; // Asegúrate de tener la instancia de prisma
import { authenticate } from "../middleware/authenticate.js"; // Middleware de autenticación

// Se asume que este archivo está usando rutas de tipo `app/children/[id]/route.js` con el método PUT
export default async function handler(req, res) {
  // El middleware `authenticate` debe estar validando el token y colocando los datos del usuario en `req.user`
  if (req.method === "PUT") {
    try {
      const { id } = req.query; // ID del hijo a actualizar
      const { name, dateOfBirth } = req.body; // Suponiendo que estos campos se envíen en el body

      // Verificar que el ID esté presente
      if (!id) {
        return res.status(400).json({ error: "ID no proporcionado" });
      }

      // Verificar que el ID sea un número válido
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID debe ser un número válido" });
      }

      // Verificar que el nombre se proporcione en el body
      if (!name) {
        return res.status(400).json({ error: "Nombre no proporcionado" });
      }

      // Verificar que el `parentalAccountId` esté disponible en `req.user` (debe ser verificado por el middleware)
      const { parentalAccountId } = req.user;
      if (!parentalAccountId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para actualizar este hijo." });
      }

      // Buscar el hijo y asegurarnos de que pertenezca a la cuenta parental del usuario autenticado
      const child = await prisma.child.findUnique({
        where: { id: Number(id) },
        select: { parentalAccountId: true, name: true },
      });

      if (!child) {
        return res.status(404).json({ error: "Hijo no encontrado" });
      }

      if (child.parentalAccountId !== parentalAccountId) {
        return res.status(403).json({
          error:
            "No tienes permiso para actualizar este hijo. No pertenece a tu cuenta parental.",
        });
      }

      // Realizar la actualización en la base de datos con Prisma
      const updatedRecord = await prisma.child.update({
        where: { id: Number(id) },
        data: { name, dateOfBirth }, // Actualiza el nombre y la fecha de nacimiento
      });

      // Responder con éxito
      return res.status(200).json({
        success: true,
        data: updatedRecord, // Retorna los datos actualizados
      });
    } catch (error) {
      console.error("❌ Error en la actualización:", error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}
