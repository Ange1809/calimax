

INFORMACIÓN DEL PROYECTO (CALIMAX) Calimax es una plataforma colaborativa (API REST) para indexar y descubrir contenido multimedia. Los usuarios no suben archivos de video, sino que aportan enlaces de proveedores externos (Vimeo, Drive) o links .m3u8 (TV en vivo) asociados a un ID de película de la API externa de TMDB. Todos los aportes pasan por una máquina de estados (PENDIENTE -> APROBADO -> REVISIÓN) gestionada por Moderadores.



2. STACK TECNOLÓGICO Y HERRAMIENTAS

Lenguaje: TypeScript (Modo Estricto activado).
Framework Backend: Express.js.
Base de Datos y ORM: PostgreSQL + Prisma ORM.
Pruebas (BDD): cucumber-js para escenarios Gherkin y supertest para peticiones HTTP simuladas.
Infraestructura: Despliegue en Render, BD en Supabase, CI/CD en GitHub Actions.
3. COMANDOS DEL ENTORNO LOCAL

Instalar dependencias: npm install
Sincronizar Prisma con la BD local: npx prisma db push
Generar cliente de Prisma: npx prisma generate
Levantar el servidor en desarrollo: npm run dev
Correr las pruebas BDD: npm run test:e2e

Después de actualizar el esquema Prisma, vuelve a generar el cliente y sincroniza la base de datos con `npx prisma generate` y `npx prisma db push`.

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

## Ejecución con Docker

1. Copia `.env.example` a `.env` y configura `JWT_SECRET` y `TMDB_API_KEY`.
2. Inicia los servicios con `docker compose up --build`.
3. Abre el frontend en `http://localhost:8080`; la API está disponible en `http://localhost:3000`.

PostgreSQL queda disponible en `localhost:5432` y sus datos persisten en `.docker/postgres-data/`.
4. REGLAS DE ARQUITECTURA (OBLIGATORIO)

Capas estritas: Separar código en Routes -> Controllers -> Services.
Seguridad: Las contraseñas se hashean siempre con bcrypt. La sesión se maneja con jsonwebtoken (JWT).
Códigos HTTP: Usar 200 (OK), 201 (Creado), 400 (Error de validación/DTO), 403 (Prohibido/Roles), 404 (No encontrado), 429 (Rate Limit).
5. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN (DoD) (Nota a la IA: Debes respetar estrictamente estos criterios al generar el código para tu módulo asignado).

Módulo 1: Seguridad (Miembro 1)

US1 (Login): Rutas POST /api/auth/register y /api/auth/register/publisher; todos los roles usan POST /api/auth/login. Hash con bcrypt. El JWT debe incluir el identificador y rol (USER, PUBLISHER, MODERATOR o ADMIN).
US2 (Rate Limiting): Usar express-rate-limit. Bloquear peticiones de /auth tras 5 intentos en 15 mins (Devuelve HTTP 429).
Módulo 2: Integración TMDB (Miembro 2)

US3 (Autocompletado): Ruta GET /api/metadata/tmdb/:id. Hacer fetch a TMDB y mapear la respuesta a un DTO limpio: { tmdbId, titulo, sinopsis, url_poster, fecha_lanzamiento }.
US4 (Caché): Guardar en memoria (TTL 12 horas) la respuesta mapeada para no volver a consultar a la API de TMDB externa en menos de 200ms.
Módulo 3: Moderación (Miembro 3)

US5 (Envío de Aportes): Ruta POST /api/aportes. Protegida por JWT y rol PUBLISHER. El DTO recibe { tmdbId o titulo, enlaces: [{ url, servidor }] }. Al guardar en Prisma, el estado inicial es "PENDIENTE".
US6 (Panel): Rutas GET /api/moderacion/pendientes y PATCH /api/moderacion/:id/estado. Protegidas por Middleware de rol (MODERATOR o ADMIN, sino devuelve HTTP 403). La publicación exige calificación de moderación; todo aporte nuevo comienza como "PENDIENTE".
Módulo 4: Catálogo y Búsqueda (Miembro 4)

US7 (Catálogo): Ruta GET /api/catalogo. Pública. Consultar a Prisma filtrando SOLAMENTE los de estado "PUBLICADO". Paginación por query (?page=1&limit=20). Respuesta JSON: { data: [], total, paginaActual, limite }.
US8 (Reportes): Ruta POST /api/catalogo/enlaces/:linkId/reportar. Suma +1 a reportes. Si llega a 5, hace un UPDATE en Prisma y pasa el enlace a estado "REVISION" automáticamente.
