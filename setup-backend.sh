#!/bin/bash

echo "🛠️  Iniciando configuración del backend Equi·Parents con pnpm..."

# Elimina lockfiles antiguos
rm -f package-lock.json yarn.lock

# Instala dependencias con pnpm
pnpm install

# Aprueba scripts necesarios
echo "🔐 Aprobando scripts seguros..."
pnpm approve-builds

# Ejecuta prisma generate y migrate
echo "📐 Generando cliente Prisma..."
pnpm generate

echo "🧱 Ejecutando migraciones de base de datos..."
pnpm migrate

echo ""
echo "📦 Scripts aprobados. Cliente Prisma generado y migraciones aplicadas."
echo "✅ Backend listo para usar con pnpm 🚀"
echo ""
echo "▶️ Ejecuta: pnpm dev"
