# Equi·Parents Backend

## Descripción

El backend de la aplicación **Equi·Parents** está construido con **Node.js** y **Express.js**. Se encarga de gestionar la lógica de negocio, bases de datos y seguridad, y está integrado con **Auth0** para la autenticación de los usuarios.

## Estructura de Archivos

```
📂 equiparents-backend/
│── 📂 src/ (Código fuente del backend)
│ │── 📂 api/ (Endpoints organizados por entidad - REST API)
│ │ │── 📂 auth/ (Manejo de autenticación)
│ │ │── 📂 users/ (Gestión de usuarios)
│ │ │── 📂 roles/ (Gestión de roles)
│ │ │── 📂 children/ (Gestión de hijos)
│ │ │── 📂 parentalAccounts/ (Gestión de cuentas parentales)
│ │ │── 📂 history/ (Gestión del historial)
│ │── 📂 middleware/ (Middlewares para validaciones y autenticación)
│ │── 📂 config/ (Configuraciones globales)
│ │── 📂 utils/ (Utilidades y helpers globales)
│── 📂 prisma/ (Configuración y migraciones de Prisma ORM)
│── 📜 .env (Variables de entorno)
│── 📜 .gitignore
│── 📜 server.js (Punto de entrada)
│── 📜 README.md (Este archivo)
```

## Instalación

1. Clona el repositorio:

   ```bash
   git clone <url-del-repositorio>
   ```

2. Entra en el directorio del proyecto:

   ```bash
   cd equiparents-backend
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Configura las variables de entorno en **`.env`**:

   ```
   AUTH0_CLIENT_ID=<tu-client-id>
   AUTH0_CLIENT_SECRET=<tu-client-secret>
   AUTH0_ISSUER_BASE_URL=https://dev-xxxxx.us.auth0.com/
   DB_URL=postgresql://user:password@localhost:5432/equiparents
   ```

5. Asegúrate de que **Prisma** esté configurado y realiza las migraciones:

   ```bash
   npx prisma migrate dev
   ```

6. Ejecuta el proyecto:

   ```bash
   npm run dev
   ```

7. Abre tu navegador y navega a `http://localhost:5000`.

## Dependencias

- **Node.js**: Plataforma de JavaScript para ejecutar código en el backend.
- **Express.js**: Framework para manejar las rutas y lógica de negocio.
- **Prisma ORM**: Herramienta para interactuar con la base de datos PostgreSQL.
- **Auth0 SDK**: Para la autenticación de usuarios.
- **express-oauth2-jwt-bearer**: Middleware para verificar JWT en las solicitudes.

## Base de Datos

El backend usa **PostgreSQL** como base de datos. La configuración se encuentra en **Prisma** con el archivo **schema.prisma**.

## Uso de Git

Sigue el flujo de trabajo estándar para Git:

1. Crea una rama:

   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Realiza cambios y haz un `git commit`:

   ```bash
   git commit -m "Descripción de los cambios"
   ```

3. Sube los cambios:

   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. Crea un pull request a la rama `main`.
