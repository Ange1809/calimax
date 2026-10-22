# Prácticas XP de Calimax

Este documento reúne la evidencia verificable de las prácticas de Programación
Extrema solicitadas para el proyecto.

## TDD / BDD

Cada historia de usuario tiene una especificación `.feature` en
[`features/`](../features/). Los escenarios marcados `@manual` son criterios
de aceptación que requieren una base de datos y/o credenciales de prueba; no se
ejecutan automáticamente hasta que ese entorno esté disponible. La suite
automatizada actual se ejecuta con:

```text
npm run test:e2e
npm run test:unit -- --runInBand
```

## Planning Game y Definition of Done

| Historia | Descripción                       | Esfuerzo |
| -------- | --------------------------------- | -------: |
| US1      | Registro y login con JWT          |        5 |
| US2      | Rate limiting de autenticación    |        3 |
| US3      | Consulta y mapeo de metadata TMDB |        5 |
| US4      | Caché de metadata                 |        3 |
| US5      | Envío autenticado de aportes      |        8 |
| US6      | Panel de moderación               |        5 |
| US7      | Catálogo paginado                 |        5 |
| US8      | Reporte y revisión de enlaces     |        5 |

Una historia está terminada cuando:

1. Tiene escenarios positivos y negativos en `features/`.
2. Sus capas de rutas, controlador y servicio están implementadas.
3. La entrada está validada y los códigos HTTP coinciden con el contrato.
4. Las pruebas unitarias y BDD relevantes pasan.
5. `npm run build`, `npm run lint` y `npm run format:check` pasan en CI.
6. Existe una revisión de código mediante pull request.

## Pair Programming

Las sesiones deben registrarse en esta tabla al finalizar cada sesión. Se
conservan los nombres de ambos integrantes, el objetivo y el commit resultante
para que la evidencia sea auditable.

| Fecha                  | Driver    | Navigator | Objetivo                            | Commit/PR |
| ---------------------- | --------- | --------- | ----------------------------------- | --------- |
| Pendiente de registrar | Pendiente | Pendiente | Completar durante la próxima sesión | Pendiente |

## Integración continua y releases

`.github/workflows/ci.yml` ejecuta instalación reproducible, compilación,
lint, formato y pruebas en cada push a `main` y en cada pull request.

Las entregas deben ser incrementales por módulo, usando tags de versión
`vMAJOR.MINOR.PATCH` y un pull request revisado antes de fusionar.

## Collective Code Ownership y estándares

El código no pertenece exclusivamente a su autor: cualquier integrante puede
corregir o mejorar cualquier módulo mediante pull request. La revisión debe
comprobar la Definition of Done y el resultado del pipeline.

TypeScript estricto, ESLint y Prettier son los estándares ejecutados localmente
y en CI:

```text
npm run build
npm run lint
npm run format:check
```
