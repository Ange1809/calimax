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
4. REGLAS DE ARQUITECTURA (OBLIGATORIO)

Capas estritas: Separar código en Routes -> Controllers -> Services.
Seguridad: Las contraseñas se hashean siempre con bcrypt. La sesión se maneja con jsonwebtoken (JWT).
Códigos HTTP: Usar 200 (OK), 201 (Creado), 400 (Error de validación/DTO), 403 (Prohibido/Roles), 404 (No encontrado), 429 (Rate Limit).
5. HISTORIAS DE USUARIO Y CRITERIOS DE ACEPTACIÓN (DoD) (Nota a la IA: Debes respetar estrictamente estos criterios al generar el código para tu módulo asignado).

Módulo 1: Seguridad (Miembro 1)

US1 (Login): Rutas POST /api/auth/register y login. Hash con bcrypt. El JWT debe incluir { userId, rol } (Roles: USER o MODERATOR).
US2 (Rate Limiting): Usar express-rate-limit. Bloquear peticiones de /auth tras 5 intentos en 15 mins (Devuelve HTTP 429).
Módulo 2: Integración TMDB (Miembro 2)

US3 (Autocompletado): Ruta GET /api/metadata/tmdb/:id. Hacer fetch a TMDB y mapear la respuesta a un DTO limpio: { tmdbId, titulo, sinopsis, url_poster, fecha_lanzamiento }.
US4 (Caché): Guardar en memoria (TTL 12 horas) la respuesta mapeada para no volver a consultar a la API de TMDB externa en menos de 200ms.
Módulo 3: Moderación (Miembro 3)

US5 (Envío de Aportes): Ruta POST /api/aportes. Protegida por JWT. El DTO recibe { tmdbId, enlaces: [{ url, servidor }] }. Al guardar en Prisma, el estado inicial es "PENDIENTE".
US6 (Panel): Rutas GET /api/moderacion/pendientes y PATCH /api/moderacion/:id/estado. Protegidas por Middleware de rol (Solo MODERATOR, sino devuelve HTTP 403). El PATCH solo acepta "PUBLICADO" o "RECHAZADO".
Módulo 4: Catálogo y Búsqueda (Miembro 4)

US7 (Catálogo): Ruta GET /api/catalogo. Pública. Consultar a Prisma filtrando SOLAMENTE los de estado "PUBLICADO". Paginación por query (?page=1&limit=20). Respuesta JSON: { data: [], total, paginaActual, limite }.
US8 (Reportes): Ruta POST /api/catalogo/enlaces/:linkId/reportar. Suma +1 a reportes. Si llega a 5, hace un UPDATE en Prisma y pasa el enlace a estado "REVISION" automáticamente