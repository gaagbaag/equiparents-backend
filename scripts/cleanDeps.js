// scripts/cleanDeps.js
import { execSync } from "child_process";

console.log("🔍 Revisión y limpieza de dependencias...");

try {
  console.log("\n📦 Mostrando dependencias obsoletas...");
  execSync("npm outdated", { stdio: "inherit" });

  console.log("\n⬆️ Actualizando dependencias posibles...");
  execSync("npm update", { stdio: "inherit" });

  console.log("\n🧹 Ejecutando dedupe para evitar duplicados...");
  execSync("npm dedupe", { stdio: "inherit" });

  console.log("\n🛡️ Ejecutando auditoría de seguridad...");
  execSync("npm audit fix", { stdio: "inherit" });

  console.log("\n✅ Limpieza completada con éxito.");
} catch (err) {
  console.error("\n❌ Error durante limpieza de dependencias:", err.message);
  process.exit(1);
}
