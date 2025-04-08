/**
 * 📡 Extrae la IP del cliente
 */
export const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  return typeof forwarded === "string"
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || null;
};

/**
 * 🧠 Extrae el User-Agent
 */
export const getUserAgent = (req) => {
  return req.headers["user-agent"] || null;
};
