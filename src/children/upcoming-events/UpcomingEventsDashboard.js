"use client";

import { useEffect, useState } from "react";

export default function UpcomingEventsDashboard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildrenWithEvents = async () => {
      try {
        const tokenRes = await fetch("/auth/token");
        const { accessToken } = await tokenRes.json();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/children/upcoming-events`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setChildren(data.children || []);
        }
      } catch (err) {
        console.error(
          "Error cargando datos de hijos con eventos próximos:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenWithEvents();
  }, []);

  if (loading) return <p>Cargando eventos...</p>;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold mb-2">👶 Hijos con eventos próximos</h2>

      {children.length === 0 ? (
        <p>No hay hijos con eventos próximos.</p>
      ) : (
        <ul className="space-y-4">
          {children.map((child) => (
            <li key={child.id} className="border p-3 rounded-md shadow-sm">
              <h3 className="font-medium text-blue-900">
                {child.firstName} {child.lastName || ""}
              </h3>
              <ul className="space-y-2">
                {child.eventLinks.map((link) => (
                  <li key={link.event.id} className="p-2 border rounded-md">
                    <div className="font-medium">{link.event.title}</div>
                    <div className="text-sm text-gray-700">
                      {new Date(link.event.start).toLocaleString("es-CL")} →{" "}
                      {new Date(link.event.end).toLocaleString("es-CL")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Categoría: {link.event.category.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cuenta Parental:{" "}
                      {link.event.calendar.parentalAccount.name}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
