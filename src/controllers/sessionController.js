// 📦 Controlador GET /api/session

// Obtiene info del usuario desde Auth0
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
    console.error("❌ Error al obtener el usuario:", response.statusText);
    throw new Error("Error al obtener la información del usuario.");
  }

  const userInfo = await response.json();
  console.log("🔑 Información recibida:", userInfo);

  return userInfo;
};

export const getSession = async (req, res) => {
  try {
    console.log("🔐 Iniciando flujo de sesión...");

    const cookieHeader = req.headers.cookie;
    console.log("🍪 Cookies recibidas:", cookieHeader);

    const tokenMatch = cookieHeader?.match(/access_token=([^;]+)/);

    if (!tokenMatch) {
      console.warn("❌ Token no encontrado en cookies.");
      return res.status(401).json({ user: null });
    }

    const accessToken = tokenMatch[1];
    console.log("🔑 Token extraído:", accessToken);

    const userInfo = await getUserInfo(accessToken);

    const safeUser = {
      sub: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
      roles: userInfo["https://equiparents.com/roles"] || [],
      parentalAccountId:
        userInfo["https://equiparents.com/parentalAccountId"] || null,
    };

    console.log("🧾 Usuario para frontend:", safeUser);

    return res.status(200).json({
      user: safeUser,
      accessToken,
      roles: safeUser.roles,
    });
  } catch (error) {
    console.error("❌ Error en handler /session:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};
