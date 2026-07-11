# Decisiones Técnicas — NEON_LEDGER

Registro de las decisiones de arquitectura y sus justificaciones. Formato ADR ligero.

---

## DT-01 · Framework: Next.js 14 (App Router) + JavaScript

- **Contexto:** el enunciado exige Next.js con App Router y JavaScript (no TypeScript).
- **Decisión:** Next.js **14.2.x** (no 15) porque el entorno usa **Node 19.9.0**, y Next 14
  es plenamente compatible, mientras que Next 15 recomienda Node 18.18+/20 y ha tenido
  fricciones en versiones intermedias de Node 19.
- **Consecuencia:** React 18, Route Handlers, Server/Client Components. Sin TypeScript;
  se usa **JSDoc + Zod** para tipado ligero y validación en runtime.

## DT-02 · Estilos: Tailwind CSS 3.4 con tokens del diseño

- **Contexto:** los diseños usan Tailwind vía CDN con una `tailwind.config` embebida y un
  design system "Cyber-Fiducia" (colores Material-you, fuentes Sora / Hanken Grotesk /
  JetBrains Mono, radios y spacing custom).
- **Decisión:** portar **exactamente** esa `tailwind.config` a `tailwind.config.js` local,
  añadir utilidades `.glass-panel`, `.neon-border-*`, `status-light`, etc. en `globals.css`,
  y cargar las fuentes con `next/font/google` para evitar dependencias de CDN en producción.
- **Consecuencia:** fidelidad visual alta y build autocontenido (sin `cdn.tailwindcss.com`).

## DT-03 · Backend de datos: Firebase (real) + adaptador Demo (local)

- **Contexto:** el enunciado recomienda **Firebase Auth + Firestore** salvo justificación
  técnica. Pero el entorno de desarrollo **no dispone de credenciales Firebase**, y los
  criterios de aceptación exigen que la app sea *ejecutable, probable y demostrable*.
- **Decisión:** implementar una **capa de repositorios con dos adaptadores** intercambiables
  (patrón Strategy / Dependency Inversion — principios D e I de SOLID):
  - **`firebase`** → Firestore + Firebase Authentication (backend real, documentado, con
    `firestore.rules` e índices). Es el backend de producción recomendado.
  - **`demo`** → persistencia en `localStorage` (cliente) / memoria (tests), con datos
    sembrados. Permite correr y probar la app **sin credenciales**.
  - Selección con `NEXT_PUBLIC_DATA_BACKEND` (`demo` por defecto; `firebase` en producción).
- **Justificación:** el propio enunciado admite "Datos mock controlados mediante una variable
  de entorno" y "Emuladores/usuario demo" como estrategia válida de demostración. Esta
  decisión **no descarta Firebase**: lo implementa como camino de producción y añade un
  camino demo para que el proyecto sea entregable de inmediato. Además mejora la arquitectura
  (inversión de dependencias, testabilidad sin red).
- **Consecuencia:** los `services` dependen de una interfaz de repositorio, no de Firebase.
  Cambiar de backend es una variable de entorno.

## DT-04 · Autenticación

- **Decisión:** `AuthContext` (Client Component) con dos implementaciones tras la misma API
  (`login`, `register`, `logout`, `resetPassword`, `user`, `loading`):
  - Firebase Authentication (email/contraseña, `sendPasswordResetEmail`).
  - Demo (valida contra usuario sembrado, persiste sesión en `localStorage`).
- **Biometría del diseño:** el login muestra "Biometric Verification". Se interpreta como
  *flavor* visual; el equivalente funcional realista y seguro es **email + contraseña**.
  Se conserva la estética (zona de "uplink") pero con un formulario real y accesible.

## DT-05 · Protección de rutas

- **Decisión:** guard en el layout del grupo `(dashboard)` que, en cliente, espera a
  `AuthContext` y redirige a `/login` si no hay sesión. En Firebase real, las reglas
  Firestore garantizan además el aislamiento por `userId` a nivel servidor (defensa en
  profundidad). Se documenta que un middleware con cookies de sesión sería el siguiente paso
  para SSR-gating.

## DT-06 · Validación: Zod (cliente + servidor)

- **Decisión:** esquemas Zod en `validations/` reutilizados por formularios (cliente) y por
  Route Handlers/servicios (servidor). Sanitización de strings (trim, longitíud, escape de
  caracteres de control) en `utils/sanitize`.

## DT-07 · Estado y datos en cliente

- **Decisión:** **sin librería de estado global pesada**. Se usa React Context para auth y
  hooks de datos (`useTransactions`, `useAccounts`, …) que encapsulan carga/estados. Esto
  evita sobreingeniería para un MVP. (Se documenta que TanStack Query sería el upgrade
  natural para caché/revalidación.)

## DT-08 · Gráficos

- **Decisión:** gráficos **hechos a mano con SVG** (donut y área/línea), como en los diseños
  originales, sin dependencias de charting. Ventajas: fidelidad exacta al diseño, cero peso
  extra, control de accesibilidad. `DonutChart` y `AreaLineChart` son componentes puros que
  reciben datos calculados por `financeService`.

## DT-09 · Moneda y formato

- **Decisión:** `Intl.NumberFormat` con moneda por usuario (default `MXN`, símbolo `$` como
  en los diseños). Formateadores centralizados en `utils/format` y probados.

## DT-10 · Pruebas

- **Decisión:** Jest + Testing Library (unit/componentes) con `jsdom`; Playwright para e2e
  contra el modo demo (determinista, sin red). Los e2e usan el seed en memoria para no tocar
  producción.

## DT-11 · Testing del build en Node 19

- **Decisión:** fijar versiones compatibles (Next 14.2, eslint-config-next 14.2). Se evita
  cualquier API que requiera Node 20.

## DT-13 · Internacionalización (i18n) ES/EN

- **Contexto:** la app debía quedar en español, conservando la estética del diseño.
- **Decisión:** sistema i18n propio y ligero (sin dependencias): `LanguageProvider`
  (React Context) + `useTranslation()` que expone `t(clave, params)`, `lang`, `setLang`
  y `months`. Diccionarios en `src/i18n/dictionaries.js` (`es` por defecto, `en`).
  - **Español por defecto**; conmutador **ES/EN** en el menú de usuario, en el drawer
    móvil y en Configuración. La preferencia se guarda en `localStorage`.
  - Se **mantienen en inglés** los términos de marca/HUD (`NEON_LEDGER`, "System Status:
    Synced", footer tipo terminal) por fidelidad al design system; se traduce todo el
    contenido (navegación, encabezados, formularios, estados, toasts, tablas).
  - **Formato localizado:** `Intl` con locale conmutable (`es-MX`/`en-US`) vía
    `setFormatLocale`; etiquetas de meses traducidas por índice.
  - **Validaciones:** los esquemas Zod conservan el mensaje en español como "clave" y se
    traducen a EN en `validateWith(schema, values, lang)` mediante un mapa
    (`src/i18n/validationMessages.js`), sin dependencias de React (usable en servicios).
  - **Datos de usuario** (nombres de cuentas/categorías/transacciones) **no** se traducen.
- **Fallback resiliente:** `useTranslation` fuera del proveedor devuelve el diccionario
  por defecto (ES), lo que mantiene los componentes utilizables en pruebas unitarias.

## DT-12 · Git

- **Contexto:** el directorio del proyecto (`Desktop/app_finanzas`) está anidado dentro de un
  repositorio git que abarca **todo el home del usuario** (`C:/Users/SEBASTIAN`).
- **Decisión:** no se realizan commits automáticos para no contaminar ese repo. Se entrega un
  `.gitignore` correcto en el proyecto. Se recomienda al usuario inicializar un repositorio
  dedicado en `app_finanzas/` (ver README) antes de publicar/desplegar.
