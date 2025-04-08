export const errorLogger = (err, req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(err); // no loguea nada en producción
  }

  console.error("❌ Error no capturado:");
  console.error(`📍 Ruta: ${req.method} ${req.originalUrl}`);
  console.error(`🧑 Usuario: ${req.user?.id || "anónimo"}`);
  console.error(`📄 Mensaje: ${err.message}`);
  console.error(`📚 Stack: ${err.stack}`);

  next(err); // pasa el error al siguiente middleware de manejo (como errorHandler)
};
