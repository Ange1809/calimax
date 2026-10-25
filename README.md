# Calimax

Calimax es una plataforma colaborativa para indexar y descubrir contenido
multimedia. Los usuarios aportan enlaces externos asociados a películas o
series de TMDB; los moderadores revisan esos aportes antes de publicarlos en el
catálogo.

## Stack

- Backend: Node.js, Express y TypeScript estricto.
- Persistencia: PostgreSQL y Prisma ORM.
- Frontend: Angular.
- Autenticación: JWT y bcrypt.
- Pruebas: Jest, Supertest y Cucumber.
- Infraestructura: Docker Compose, Nginx y GitHub Actions.

## Requisitos previos

- Node.js 20 o superior.
- npm.
- PostgreSQL local o Docker Desktop.
- Una clave de API de TMDB para las consultas de metadata.

## Configuración inicial

Desde la raíz del repositorio:

```powershell
Copy-Item .env.example .env
npm ci
npx prisma generate
```

## Cuentas y roles

- Usuario: registro en `/register`; el inicio de sesión es compartido en `/login`.
- Publisher: registro en `/publisher/register`; inicia sesión en `/login`. El alta requiere aceptar los términos y añadir al menos un enlace social; los enlaces de perfiles de contenido son opcionales.
- Moderator y Admin: usan el mismo inicio de sesión `/login` y no se pueden elegir desde el registro público. Sus cuentas se deben provisionar de forma administrativa; la API reserva la moderación para esos roles y permite enviar aportes únicamente a Publisher.
- El texto de términos mostrado en el formulario Publisher es provisional: debe sustituirse por el texto legal aprobado antes del lanzamiento.
- No hay mensualidad Publisher. Se otorga un punto por cada aporte aprobado; la calidad es el promedio de las calificaciones de moderación y la actividad diaria refleja un inicio de sesión en las últimas 24 horas.
- Solo los aportes aprobados aparecen en `/cartelera` y en el perfil público `/publishers/:id`. El email y los enlaces de alojamiento del perfil no son públicos.
- Cada cuenta autenticada puede abrir `/perfil` para ver su rol y panel, además de editar nombre público, biografía y foto mediante una URL HTTPS externa. La API `GET/PATCH /api/perfil` solo permite consultar o modificar el perfil asociado al token; email y rol no se pueden editar desde allí. Los datos de perfil Publisher se muestran públicamente en la cartelera y su perfil.
- La navegación principal se mantiene fija para todos los roles: todos conservan Inicio, Catálogo, Cartelera y Mi perfil; Publisher también tiene acceso directo a Enviar contenido y Moderador/Admin a Moderación. El perfil muestra el árbol de accesos adecuado al rol incluso mientras carga sus datos.
- Moderadores/Admin revisan todos los aportes desde `/staff/moderation`; aprobar requiere una calificación de 1 a 5. El contenido no se publica al enviarlo.
- Moderator/Admin se asignan desde el editor de tablas de Supabase, modificando `public.Usuario.rol` a `MODERATOR` o `ADMIN`. El registro público rechaza cualquier rol incluido por el cliente. Tras cambiarlo, el usuario debe volver a iniciar sesión para recibir un JWT con el rol actualizado. La contraseña de este backend es el hash de `public.Usuario.password_hash`; cambiar contraseñas en Supabase Auth no afecta estas cuentas personalizadas.

### Ejemplos de solicitudes en Postman

Usa `http://localhost:3000` como URL base en desarrollo y selecciona **Body → raw → JSON**. En las solicitudes protegidas, configura **Authorization → Bearer Token** con el token devuelto por el inicio de sesión correspondiente.

`POST /api/auth/register` — crear cuenta Usuario:

```json
{
  "email": "usuario@example.com",
  "password": "CAMBIAR_POR_UNA_CLAVE_SEGURA"
}
```

`POST /api/auth/register/publisher` — crear cuenta Publisher:

```json
{
  "email": "publisher@example.com",
  "password": "CAMBIAR_POR_UNA_CLAVE_SEGURA",
  "nombrePublico": "Nombre público",
  "aceptaTerminos": true,
  "enlacesSociales": [
    {
      "plataforma": "Instagram",
      "url": "https://instagram.com/tu_perfil"
    }
  ],
  "enlacesAlojamiento": [
    {
      "plataforma": "Google Drive",
      "url": "https://drive.google.com/drive/u/0/my-drive"
    }
  ]
}
```

`enlacesAlojamiento` es opcional; `nombrePublico`, aceptar los términos y al menos un enlace social HTTPS son obligatorios. Usa correos controlados por ti y contraseñas únicas; los valores de ejemplo no son cuentas creadas.

Inicio de sesión compartido para Usuario, Publisher, Moderador y Admin: `POST /api/auth/login`.

Perfil autenticado: `GET /api/perfil` consulta los datos de tu cuenta y `PATCH /api/perfil` actualiza los campos enviados. Ejemplo:

```json
{
  "nombrePublico": "Nombre visible",
  "fotoPerfilUrl": "https://imagenes.example.com/mi-foto.jpg",
  "biografia": "Una breve descripción."
}
```

Cada inicio de sesión recibe este JSON:

```json
{
  "email": "tu_correo@example.com",
  "password": "TU_CLAVE"
}
```

`POST /api/aportes` — enviar un aporte como Publisher; siempre queda pendiente:

```json
{
  "tmdbId": "603",
  "tipo": "pelicula",
  "enlaces": [
    {
      "servidor": "Google Drive",
      "url": "https://drive.google.com/tu_enlace"
    }
  ]
}
```

Moderación requiere un token de Moderador/Admin: consultar `GET /api/moderacion/pendientes`; aprobar con `PATCH /api/moderacion/:id/estado` y `{"estado":"PUBLICADO","calidad":5,"comentario":"Revisado"}`; o rechazar con `{"estado":"RECHAZADO","comentario":"Motivo"}`.

Edita `.env` y configura al menos:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/calimax?schema=public
DIRECT_URL=postgresql://usuario:contraseña@localhost:5432/calimax?schema=public
JWT_SECRET=una-clave-segura
TMDB_API_KEY=tu-clave-de-tmdb
PORT=3000
```

Si la base de datos ya está creada, sincroniza el esquema:

```powershell
npx prisma db push
```

## Ejecutar backend y frontend en desarrollo

Son dos procesos independientes. Abre dos terminales en la raíz del proyecto.

### Terminal 1: backend

```powershell
npm run dev
```

La API queda disponible en `http://localhost:3000`. El proceso principal crea
workers mediante `cluster`; los mensajes sobre `ExperimentalWarning` de
Node.js no son errores y los mensajes `Worker ... listening on port 3000`
confirman que el backend arrancó correctamente.

### Terminal 2: frontend

Instala las dependencias del frontend una sola vez:

```powershell
Set-Location .\frontend
npm ci
```

Luego inicia Angular:

```powershell
npm start
```

Abre `http://localhost:4200`. El archivo
[`frontend/proxy.conf.json`](frontend/proxy.conf.json) redirige las solicitudes
`/api` al backend en el puerto 3000, por lo que no se debe cambiar la URL de
la API en los servicios Angular.

Para volver a la raíz:

```powershell
Set-Location ..
```

## Comprobar que funciona

Con el backend activo:

```powershell
Invoke-WebRequest http://localhost:3000/api-docs/ -UseBasicParsing
Invoke-WebRequest http://localhost:3000/api/catalogo -UseBasicParsing
```

Ambas solicitudes deben responder con HTTP 200. También puedes abrir la
documentación interactiva en
[`http://localhost:3000/api-docs/`](http://localhost:3000/api-docs/).

Con backend y frontend activos:

1. Abre `http://localhost:4200`.
2. Registra un usuario desde `/register`.
3. Inicia sesión desde `/login`.
4. Comprueba que se navega al catálogo y que las solicitudes `/api` aparecen
   en la terminal del backend.

Si el puerto 3000 está ocupado:

```powershell
$env:PORT=3001
npm run dev
```

En ese caso también debes cambiar el `target` de
[`frontend/proxy.conf.json`](frontend/proxy.conf.json) a
`http://localhost:3001`.

## Ejecutar todo con Docker

Docker Compose levanta PostgreSQL, la API y el frontend de producción.

1. Copia y completa `.env` como se explica arriba.
2. Ejecuta desde la raíz:

```powershell
docker compose up --build
```

3. Abre `http://localhost:8080`.

En Docker:

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Swagger: `http://localhost:3000/api-docs/`

Los datos de PostgreSQL persisten en `.docker/postgres-data/`. Para detener los
servicios:

```powershell
docker compose down
```

## Problemas frecuentes

### `npm run dev` muestra `ExperimentalWarning`

Es una advertencia del loader ESM de `ts-node` en Node.js 24. No indica que el
backend haya fallado. La señal correcta es ver uno o más mensajes:

```text
Worker ... started and listening on port 3000
```

### El frontend no abre

`npm run dev` solo inicia la API. Para ver la interfaz debes abrir otra
terminal, entrar en `frontend`, ejecutar `npm ci` (la primera vez) y luego
`npm start`. La dirección de desarrollo es `http://localhost:4200`.

### `npm ci` devuelve `EPERM` en Windows

Normalmente significa que el backend está usando un archivo de Prisma. Detén
el backend con `Ctrl+C`, ejecuta nuevamente `npm ci` desde la raíz y vuelve a
iniciar `npm run dev`.

### El catálogo responde vacío

La API está funcionando aunque no haya registros publicados. La respuesta
esperada será un JSON con `data: []`. Para consultar metadata de TMDB sí es
necesario configurar `TMDB_API_KEY`.

## Rutas principales

- `POST /api/auth/register`
- `POST /api/auth/register/publisher`
- `POST /api/auth/login`
- `GET /api/metadata/tmdb/:tipo/:id`
- `POST /api/aportes`
- `GET /api/publishers/cartelera`
- `GET /api/publishers/:id`
- `GET /api/perfil`
- `PATCH /api/perfil`
- `GET /api/moderacion/pendientes`
- `PATCH /api/moderacion/:id/estado`
- `GET /api/catalogo`
- `POST /api/catalogo/enlaces/:linkId/reportar`

Las rutas protegidas requieren `Authorization: Bearer <token>`. El panel de
moderación requiere el rol `MODERATOR` o `ADMIN`.

## Pruebas y calidad

Desde la raíz:

```powershell
npm run build
npm run lint
npm run format:check
npm run test:unit -- --runInBand
npm run test:e2e
```

Para validar el frontend:

```powershell
Set-Location .\frontend
npm ci
npm run build
npm test -- --watch=false
```

El workflow de GitHub Actions ejecuta instalación reproducible, compilación,
lint, formato y pruebas BDD en cada push a `main` y en cada pull request.

El build y las pruebas de Angular se validan desde `frontend` con los comandos
anteriores.

## Arquitectura

El backend mantiene la separación:

```text
Routes -> Controllers -> Services -> Prisma
```

Las prácticas XP, la matriz de historias, el Definition of Done y la
trazabilidad de BDD están documentadas en
[`docs/XP.md`](docs/XP.md).
