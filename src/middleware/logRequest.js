export const logRequest = (req, res, next) => {
  if (process.env.NODE_ENV === "production") return next();

  const start = process.hrtime.bigint(); // Marca de inicio en nanosegundos
  const userId = req.user?.id || "anónimo";
  const method = req.method;
  const path = req.originalUrl;

  // Esperar a que la respuesta se envíe
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000; // Convertir a milisegundos

    console.log(
      `📥 ${method} ${path} | 🧑 ${userId} | ⏱️ ${durationMs.toFixed(2)} ms`
    );
  });

  next();
};
