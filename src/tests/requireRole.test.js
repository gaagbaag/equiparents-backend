// src/tests/requireRole.test.js

const express = require("express");
const request = require("supertest");
const requireRole = require("../src/middleware/requireRole"); // Verifica la ruta correcta

app.use("/internal", internalRoutes);

// 🚀 Inicializar Express
const app = express();

// Middleware de prueba
const mockUser = (roles) => (req, res, next) => {
  req.auth = { "https://equiparents.com/roles": roles };
  next();
};

// Ruta protegida por requireRole
app.get("/admin", mockUser(["admin"]), requireRole("admin"), (req, res) => {
  res.status(200).json({ message: "Acceso permitido (admin)" });
});

app.get("/parent", mockUser(["parent"]), requireRole("admin"), (req, res) => {
  res.status(200).json({ message: "Esto no debería pasar" });
});

app.get(
  "/missing",
  (req, res, next) => {
    req.auth = {}; // sin roles
    next();
  },
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({ message: "Esto tampoco debería pasar" });
  }
);

describe("🔒 Middleware requireRole", () => {
  it("permite acceso si el usuario tiene el rol requerido", async () => {
    const res = await request(app).get("/admin");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Acceso permitido (admin)");
  });

  it("deniega acceso si el usuario no tiene el rol requerido", async () => {
    const res = await request(app).get("/parent");
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/rol no autorizado/i);
  });

  it("deniega acceso si el usuario no tiene roles definidos", async () => {
    const res = await request(app).get("/missing");
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/sin roles/i);
  });
});
