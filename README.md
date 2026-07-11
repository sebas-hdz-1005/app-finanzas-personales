# NEON_LEDGER — Portal de Finanzas Personales

Aplicación web de finanzas personales con estética *cyberpunk / glassmorphism*
("command center"), construida a partir de los diseños de
[`stitch_nextgen_finance_portal`](./stitch_nextgen_finance_portal). Permite
gestionar cuentas, categorías, transacciones, presupuestos y metas de ahorro, con
un dashboard, un libro de transacciones (ledger) y un terminal de análisis.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![JS](https://img.shields.io/badge/JavaScript-ES2022-yellow) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8) ![Tests](https://img.shields.io/badge/tests-Jest%20%2B%20Playwright-green)

---

## ✨ Características

- **Autenticación**: registro, inicio/cierre de sesión y recuperación de contraseña.
- **Rutas privadas protegidas** y persistencia de sesión.
- **CRUD** de transacciones, cuentas, categorías, presupuestos y metas de ahorro.
- **Dashboard** con KPIs (costos, ingresos, disponible), donut de distribución,
  tablas y nodos de datos.
- **Analysis Terminal**: flujo de gasto, deriva de presupuesto, entropía de
  categorías y recomendaciones.
- **Filtros y búsqueda** de transacciones + exportación a CSV.
- **Estados de carga, error y vacío** en todas las vistas.
- **Responsive** (360 / 768 / 1024 / 1440) y accesibilidad básica (WCAG AA).
- **Bilingüe (Español / Inglés)** con conmutador ES/EN en el menú de usuario y en
  Configuración; la preferencia se guarda en el navegador. Español por defecto.
- **Dos backends intercambiables**: `demo` (local, sin credenciales) y
  `firebase` (Firestore + Auth) — se elige con una variable de entorno.

## 🧱 Tecnologías

| Área | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router), React 18, **JavaScript** |
| Estilos | Tailwind CSS 3.4 (tokens del design system) + CSS Modules-ready |
| Estado | React Context (auth) + hooks de datos |
| Validación | Zod (cliente y servidor) |
| Backend | Firebase Auth + Cloud Firestore · adaptador Demo (localStorage) |
| Gráficos | SVG a mano (sin dependencias) |
| Pruebas | Jest + React Testing Library · Playwright (e2e) |

Decisiones detalladas en [`docs/DECISIONES_TECNICAS.md`](./docs/DECISIONES_TECNICAS.md).

## ✅ Requisitos previos

- Node.js **18.18+** (probado en 19.9) y npm 9+.
- (Opcional, para producción) Cuenta de Firebase y de Vercel.

## 🚀 Instalación y ejecución local

```bash
npm install
cp .env.example .env.local     # por defecto usa el modo demo
npm run dev                    # http://localhost:3000
```

Inicia sesión con el usuario demo: **`demo@neonledger.app` / `demo1234`**
(o crea uno nuevo con "New Entity"). En modo demo los datos se guardan en el
navegador (`localStorage`).

## 🔐 Variables de entorno

Copia `.env.example` a `.env.local`. Variables (todas `NEXT_PUBLIC_*`):

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_DATA_BACKEND` | `demo` (local) o `firebase` (producción) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clave web de Firebase (pública) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |
| `NEXT_PUBLIC_FIREBASE_USE_EMULATORS` | `true` para usar emuladores locales |

> Las claves web de Firebase son **públicas por diseño**; la seguridad la imponen
> las reglas de Firestore ([`firestore.rules`](./firestore.rules)). Nunca subas
> `.env.local` con credenciales al repositorio.

## 🔥 Configuración de Firebase (producción)

Resumen (guía completa en [`docs/GUIA_DESPLIEGUE.md`](./docs/GUIA_DESPLIEGUE.md)):

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com).
2. Habilita **Authentication → Email/Password**.
3. Crea una base **Firestore** (modo producción).
4. Copia la config web a `.env.local` y pon `NEXT_PUBLIC_DATA_BACKEND=firebase`.
5. Publica reglas e índices:
   ```bash
   npm i -g firebase-tools && firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## 🧪 Pruebas

```bash
npm run test              # unitarias + componentes (Jest, 50 pruebas)
npm run test:e2e:install  # instala el navegador de Playwright (una vez)
npm run test:e2e          # end-to-end (Playwright, modo demo)
```

Cobertura de pruebas:
- **Unitarias**: cálculos financieros, filtros, formateadores, validaciones, repositorio demo.
- **Componentes**: `TransactionForm` (validación), `MoneyText`, `EmptyState`, `ErrorState`.
- **E2E**: protección de rutas, registro→dashboard, login/logout demo, CRUD y búsqueda de transacciones.

## 🏗️ Build de producción

```bash
npm run build
npm run start
```

## ☁️ Despliegue (Vercel + Firebase)

1. Importa el repositorio en Vercel (framework Next.js autodetectado).
2. Añade las variables de entorno (incluida `NEXT_PUBLIC_DATA_BACKEND=firebase`).
3. Deploy. Añade tu dominio de Vercel a los *Authorized domains* de Firebase Auth.

También puedes desplegar en **modo demo** (sólo `NEXT_PUBLIC_DATA_BACKEND=demo`)
para una vista previa pública sin backend.

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/{login,register,recover}     # rutas públicas
│   ├── (dashboard)/{dashboard,transactions,analysis,
│   │                 wallets,budgets,goals,profile,settings}
│   ├── api/health                          # route handler
│   ├── layout.js · page.js · globals.css · not-found.js
├── components/{common,layout,forms,charts,tables,financial,providers}
├── features/auth                           # AuthContext
├── i18n/                                    # LanguageProvider, diccionarios ES/EN, opciones
├── hooks/                                  # useFinancialData, useDataChanged
├── lib/{backend, firebase, auth}           # selección de backend y adaptadores
├── services/                               # lógica de negocio (cálculos + orquestación)
├── repositories/{demo,firebase}            # persistencia intercambiable
├── validations/                            # esquemas Zod
├── constants/ · utils/                     # tokens, formateadores, helpers
e2e/                                        # pruebas Playwright
docs/                                       # PLAN, DECISIONES, MODELO, DESPLIEGUE, ESTADO
firestore.rules · firestore.indexes.json · firebase.json
```

## 🧭 Decisiones técnicas principales

- **Arquitectura por capas + inversión de dependencias**: los servicios dependen
  de una interfaz de repositorio; el backend (`demo`/`firebase`) es una variable
  de entorno. Facilita pruebas sin red y despliegue inmediato.
- **Firebase Auth + Firestore** como backend de producción recomendado, con
  reglas que aíslan los datos por `userId`.
- **Gráficos en SVG** para fidelidad exacta al diseño y cero dependencias extra.
- **Zod** para validación reutilizada en cliente y servidor.

## ⚠️ Limitaciones conocidas

- El "login biométrico" de los diseños se implementa como **email + contraseña**
  (equivalente funcional realista); ver `docs/DECISIONES_TECNICAS.md`.
- En **modo demo** los datos son por navegador (no se sincronizan entre dispositivos).
- Sin conversión multi-moneda en tiempo real (una moneda por usuario).
- El *gating* de rutas es en cliente; para SSR-gating se recomienda middleware con
  cookies de sesión (trabajo futuro).

## 🛣️ Próximos pasos

- Middleware de sesión para protección en el servidor.
- Caché/revalidación con TanStack Query.
- Multi-moneda y conversión.
- Notificaciones/alertas reales.
- Paginación server-side en Firestore para grandes volúmenes.

## 📄 Documentación

- [Plan de trabajo](./docs/PLAN_DE_TRABAJO.md)
- [Decisiones técnicas](./docs/DECISIONES_TECNICAS.md)
- [Modelo de datos](./docs/MODELO_DE_DATOS.md)
- [Guía de despliegue](./docs/GUIA_DESPLIEGUE.md)
- [Estado de implementación](./docs/ESTADO_IMPLEMENTACION.md)

## 🗒️ Nota sobre Git

El directorio del proyecto está anidado en un repositorio git que abarca todo el
home del usuario. Para publicar, se recomienda inicializar un repo dedicado:

```bash
cd app_finanzas
git init && git add . && git commit -m "NEON_LEDGER: MVP inicial"
```

(El `.gitignore` ya excluye `node_modules`, `.next` y `.env.local`.)
