"use client";

import React from "react";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const tokenRes = await fetch("/auth/token");
      const { accessToken } = await tokenRes.json();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) return;

      const json = await res.json();
      setData(json);
    };

    fetchStats();
  }, []);

  if (!data) return <p>Cargando estadísticas...</p>;

  return (
    <main className="container">
      <h1>📊 Panel de administración</h1>

      <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
        <Stat label="Usuarios" value={data.users} />
        <Stat label="Cuentas parentales" value={data.accounts} />
        <Stat label="Hijos" value={data.children} />
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2>🕓 Últimas acciones</h2>
        <ul>
          {data.history.map((h: any) => (
            <li key={h.id}>
              <strong>{h.summary}</strong> —{" "}
              {new Date(h.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "#f4f4f4",
        borderRadius: "8px",
        flex: "1",
        textAlign: "center",
      }}
    >
      <h3>{label}</h3>
      <p style={{ fontSize: "2rem", margin: 0 }}>{value}</p>
    </div>
  );
}
