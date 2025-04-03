// src/sessionRoutes.js
import fetch from "node-fetch"; // Asegúrate de que `fetch` esté disponible en el backend

// Función para obtener la información completa del usuario desde Auth0
const getUserInfo = async (accessToken) => {
  console.log("🔑 Obteniendo información del usuario desde Auth0...");
  const response = await fetch(
    "https://dev-ufadmrew7lj7gth4.us.auth0.com/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    console.error(
      "❌ Error al obtener la información del usuario desde Auth0:",
      response.statusText
    );
    throw new Error("Error al obtener la información del usuario.");
  }

  const userInfo = await response.json();
  console.log("🔑 Información del usuario recibida de Auth0:", userInfo);
  return userInfo; // Devolvemos los datos del usuario
};

// Endpoint de sesión
export async function GET(request) {
  try {
    console.log("🔐 Comenzando el flujo de sesión...");

    // Obtener el JWT desde las cookies
    const cookieHeader = request.headers.get("cookie");
    console.log("🍪 Cookies recibidas:", cookieHeader);

    const tokenMatch = cookieHeader?.match(/access_token=([^;]+)/); // Extraemos el token de la cookie

    if (!tokenMatch) {
      console.error("❌ No se encontró el token de acceso en las cookies.");
      return new Response(
        JSON.stringify({ error: "No se encontró el token de acceso" }),
        { status: 401 }
      );
    }

    const accessToken = tokenMatch[1]; // Obtener el token de la cookie
    console.log("🔑 Token de acceso extraído de las cookies:", accessToken);

    // Obtener la información del usuario desde Auth0 usando el accessToken
    const userInfo = await getUserInfo(accessToken);
    console.log(
      "🧑‍💻 Roles del usuario:",
      userInfo["https://equiparents.com/roles"]
    );

    // Construir la respuesta con la información del usuario
    const safeUser = {
      sub: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      roles: userInfo["https://equiparents.com/roles"] || [],
      parentalAccountId:
        userInfo["https://equiparents.com/parentalAccountId"] || null,
    };

    console.log("🧑‍💻 Usuario seguro devuelto:", safeUser);

    return new Response(
      JSON.stringify({ user: safeUser, token: accessToken }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error en /session:", error);
    return new Response(
      JSON.stringify({ error: "Error interno al obtener la sesión" }),
      { status: 500 }
    );
  }
}
