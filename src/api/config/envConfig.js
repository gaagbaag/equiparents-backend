import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "PORT",
  "JWT_SECRET",
  "AUTH0_DOMAIN",
  "AUTH0_AUDIENCE",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ FALTA VARIABLE DE ENTORNO: ${envVar}`);
    process.exit(1);
  }
});

export const config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  ENABLE_SENTRY: process.env.ENABLE_SENTRY === "true", // Optional: Configurar Sentry
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "*", // Optional: Controlar CORS
  // Puedes agregar más configuraciones específicas de entorno aquí.
};

export default config;
