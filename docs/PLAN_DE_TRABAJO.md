# Plan de Trabajo — NEON_LEDGER

> Portal de finanzas personales basado en los diseños de `stitch_nextgen_finance_portal`
> (sistema de diseño **Cyber-Fiducia / NEON_LEDGER**).

---

## 1. Resumen del producto

**NEON_LEDGER** es una aplicación web de gestión de finanzas personales con una estética
*cyberpunk / glassmorphism* ("command center"). Permite a cada usuario registrar cuentas,
categorías, transacciones (ingresos y gastos), presupuestos y metas de ahorro, y visualizar
su salud financiera a través de un dashboard, un libro de transacciones (ledger) y un
terminal de análisis.

El producto está pensado como **MVP desplegable** en un entorno gratuito (Vercel + Firebase),
con arquitectura modular preparada para crecer.

## 2. Objetivo general

Convertir los diseños estáticos de `stitch_nextgen_finance_portal` en una aplicación
Next.js funcional, responsive, segura, probada y desplegable, respetando con la máxima
fidelidad posible el sistema visual, e implementando persistencia real por usuario con
reglas de seguridad.

## 3. Alcance funcional

**Incluido en el MVP:**

- Autenticación (registro, inicio de sesión, cierre de sesión, recuperación de contraseña).
- Protección de rutas privadas y persistencia de sesión.
- CRUD de transacciones (ingresos / gastos), con filtros y búsqueda.
- CRUD de cuentas financieras (wallets).
- CRUD de categorías.
- CRUD de presupuestos.
- CRUD de metas de ahorro.
- Dashboard con KPIs (costos, ingresos, disponible), gráfico de distribución de gastos,
  tablas de movimientos y nodos de datos.
- Terminal de análisis (flujo de gasto, deriva de presupuesto, entropía de categorías).
- Perfil y configuración de cuenta (moneda, datos personales).
- Estados de carga, error y vacío en todas las vistas de datos.
- Datos de demostración (modo demo + seed).

**Fuera del MVP (documentado como trabajo futuro):**

- Biometría real / face-id (el diseño de login la sugiere; se implementa auth por
  email + contraseña, que es el equivalente funcional realista).
- Sincronización con blockchain / integraciones bancarias reales (son *flavor* del diseño).
- IA "AI Synthesis" con modelo real (se implementa como panel de recomendaciones derivadas
  de reglas simples sobre los datos del usuario).
- Multi-moneda con conversión en tiempo real (se soporta una moneda por usuario).
- Notificaciones push / alarmas activas reales.

## 4. Pantallas detectadas

| # | Diseño (carpeta) | Pantalla | Estado |
|---|------------------|----------|--------|
| 1 | `terminal_de_acceso_neon_ledger_1/2` | **Login / Terminal de Acceso** | Diseñada |
| 2 | `panel_de_control_dashboard_principal` | **Dashboard / Command Center** | Diseñada |
| 3 | `libro_de_transacciones_ledger` | **Transacciones / Ledger** | Diseñada |
| 4 | `an_lisis_de_datos_avanzado` | **Análisis / Analysis Terminal** | Diseñada |
| 5 | (referida en nav) | **Wallets** | Inferida |
| 6 | (referida en nav) | **Settings** | Inferida |
| 7 | (derivada del modelo) | **Registro / New Entity** | Inferida del login |
| 8 | (derivada del modelo) | **Recuperar contraseña / Recover Node** | Inferida del login |
| 9 | (derivada del modelo) | **Presupuestos** | Inferida del panel "Budget Drift" |
| 10 | (derivada del modelo) | **Metas de ahorro** | Inferida del panel "Meta Mensual" |
| 11 | (derivada del modelo) | **Perfil** | Inferida del avatar del header |

Las pantallas *inferidas* se construyen con el mismo sistema visual y con decisiones
sencillas y coherentes, documentadas en `DECISIONES_TECNICAS.md`.

## 5. Flujos de usuario

1. **Onboarding:** New Entity → registro (email, nombre, contraseña) → creación de perfil
   + cuenta por defecto + categorías base → redirección al dashboard.
2. **Acceso:** Terminal ID (email) + contraseña → "ESTABLISH UPLINK" → dashboard.
3. **Recuperación:** Recover Node → email → correo de restablecimiento.
4. **Registrar movimiento:** "Quick Add" → formulario (tipo, cuenta, categoría, monto,
   fecha, título) → validación → persistencia → actualización de balances y dashboard.
5. **Explorar ledger:** filtrar por tipo/fecha, buscar, paginar, editar/eliminar (con
   confirmación).
6. **Analizar:** ver flujo de gasto mensual, deriva de presupuestos, distribución por
   categoría, recomendaciones.
7. **Gestionar:** cuentas, categorías, presupuestos y metas (CRUD).
8. **Configurar:** actualizar perfil, moneda y cerrar sesión.

## 6. Requerimientos funcionales

- **RF-01** El usuario puede registrarse con email y contraseña.
- **RF-02** El usuario puede iniciar y cerrar sesión; la sesión persiste al recargar.
- **RF-03** El usuario puede solicitar recuperación de contraseña.
- **RF-04** Las rutas del dashboard requieren sesión válida.
- **RF-05** El usuario puede crear, listar, editar y eliminar transacciones.
- **RF-06** El usuario puede filtrar transacciones por tipo, fecha, categoría y texto.
- **RF-07** El usuario puede crear, editar y eliminar cuentas, categorías, presupuestos y metas.
- **RF-08** El sistema calcula costos totales, ingresos totales y balance disponible.
- **RF-09** El dashboard muestra distribución de gastos por categoría y últimos movimientos.
- **RF-10** El análisis muestra flujo mensual, deriva de presupuesto y entropía de categorías.
- **RF-11** Cada usuario sólo accede a sus propios datos.
- **RF-12** Toda eliminación requiere confirmación explícita.
- **RF-13** El usuario puede editar su perfil y moneda preferida.
- **RF-14** Existe un modo demo/seed para probar sin credenciales reales.

## 7. Requerimientos no funcionales

- **RNF-01 Responsive:** 360px (móvil), 768px (tablet), 1024px (desktop), 1440px (grande).
- **RNF-02 Accesibilidad:** WCAG AA básico (roles, labels, foco visible, contraste, teclado).
- **RNF-03 Rendimiento:** build de producción sin errores; code-splitting por ruta.
- **RNF-04 Seguridad:** validación cliente+servidor, sanitización, reglas Firestore,
  aislamiento por `userId`, sin secretos en el repo.
- **RNF-05 Mantenibilidad:** SOLID donde aplique, componentes pequeños, capa de
  repositorios/servicios, tokens de diseño centralizados.
- **RNF-06 Testeabilidad:** unit + componentes + e2e; datos de prueba aislados.
- **RNF-07 Portabilidad:** ejecutable local sin credenciales (modo demo) y con Firebase real.

## 8. Arquitectura propuesta

Aplicación **Next.js (App Router)** en JavaScript. Se usa una **arquitectura por capas +
feature-first** con inversión de dependencias en el acceso a datos:

```
UI (app/ + components/)
   ↓ usa
Hooks (hooks/) + Features (features/)
   ↓ usan
Services (services/)  ← lógica de negocio (cálculos, orquestación)
   ↓ usan
Repositories (repositories/)  ← interfaz de persistencia
   ↓ implementada por
Adapters: firebase | demo (localStorage/in-memory)
```

- **Repositorio con dos adaptadores** (patrón Strategy / Dependency Inversion):
  - `firebase`: Firestore real.
  - `demo`: almacenamiento local sembrado, para correr sin credenciales y para tests.
  - Se selecciona con `NEXT_PUBLIC_DATA_BACKEND` (`demo` por defecto).
- **API Route Handlers** (`app/api/*`) para operaciones sensibles/lógica de negocio del
  lado servidor (p. ej. seed, validación server-side), evitando lógica sensible en el cliente.
- **Cálculos financieros** en `services/` puros y testeables (sin dependencias de UI).

Ver `DECISIONES_TECNICAS.md` para la justificación completa.

## 9. Modelo de datos

Entidades: `users`, `accounts`, `categories`, `transactions`, `budgets`, `savingGoals`.
Modelo completo (campos, tipos, relaciones, índices) en `MODELO_DE_DATOS.md`.

## 10. Estrategia de autenticación

- **Firebase Authentication** (email/password) como backend real, documentado.
- **Adaptador demo**: usuario `demo@neonledger.app` / `demo1234` con datos sembrados,
  sin credenciales sensibles en el código.
- `AuthContext` en el cliente expone `user`, `loading`, `login`, `register`, `logout`,
  `resetPassword`.
- Rutas privadas protegidas por un guard (`(dashboard)/layout.js`) que redirige a `/login`.

## 11. Estructura de carpetas

```
app_finanzas/
├── docs/
├── public/
├── e2e/
├── src/
│   ├── app/
│   │   ├── (auth)/{login,register,recover}/page.js
│   │   ├── (dashboard)/{dashboard,transactions,analysis,wallets,budgets,goals,settings,profile}/page.js
│   │   ├── api/{seed,health}/route.js
│   │   ├── layout.js  ·  page.js  ·  globals.css
│   ├── components/{common,layout,forms,charts,tables,financial}/
│   ├── features/{auth,dashboard,transactions,accounts,categories,budgets,saving-goals}/
│   ├── hooks/
│   ├── lib/ (firebase, backend selection, providers)
│   ├── services/
│   ├── repositories/{firebase,demo}/
│   ├── validations/
│   ├── constants/
│   ├── utils/
│   └── styles/ (design tokens)
├── firestore.rules  ·  firestore.indexes.json
├── .env.example
├── jest.config.js  ·  jest.setup.js  ·  playwright.config.js
├── tailwind.config.js  ·  postcss.config.js  ·  next.config.mjs  ·  jsconfig.json
└── package.json  ·  README.md
```

## 12. Componentes reutilizables

- **common:** `Button`, `Card` (glass-panel), `Input`, `Select`, `Badge/Chip`, `Modal`,
  `ConfirmDialog`, `Spinner/Loader`, `EmptyState`, `ErrorState`, `StatusLight`,
  `ProgressBar`, `Toast`.
- **layout:** `TopNav`, `SideNav`, `MobileNav`, `Footer`, `AppShell`, `GlowBackground`.
- **forms:** `TransactionForm`, `AccountForm`, `CategoryForm`, `BudgetForm`, `GoalForm`,
  `FormField`.
- **charts:** `DonutChart`, `AreaLineChart`, `ProgressMeter`.
- **tables:** `LedgerTable`, `DataTable`, `Pagination`.
- **financial:** `StatCard`, `KpiCard`, `CategoryLegend`, `MoneyText`, `TransactionRow`.

## 13. Endpoints / servicios

- `services/financeService`: cálculos de totales, distribución, balances, flujo mensual,
  deriva de presupuesto.
- `services/transactionService`, `accountService`, `categoryService`, `budgetService`,
  `goalService`: orquestan validación + repositorio.
- `repositories/*`: `create/list/get/update/remove` por entidad y `userId`.
- `app/api/health` (GET): healthcheck.
- `app/api/seed` (POST): siembra datos demo para el usuario autenticado (protegido).

## 14. Estrategia de pruebas

- **Unitarias (Jest):** `financeService` (totales, %, balances), formateadores de moneda/fecha,
  validaciones (Zod), utilidades.
- **Componentes (RTL):** `TransactionForm` (validación), `StatCard`, `EmptyState`,
  `ErrorState`, `LedgerTable`.
- **E2E (Playwright, modo demo):** login demo → dashboard, crear/editar/eliminar transacción,
  protección de ruta privada.
- Datos de prueba independientes (seed en memoria), nunca producción.

## 15. Estrategia de despliegue

- **App:** Vercel (Next.js nativo).
- **DB/Auth:** Firebase (Firestore + Authentication) free tier.
- **Modo demo** disponible para vista previa pública sin backend.
- Variables en `.env.example`; reglas en `firestore.rules`. Detalle en `GUIA_DESPLIEGUE.md`.

## 16. Riesgos técnicos

| Riesgo | Mitigación |
|--------|-----------|
| Sin credenciales Firebase en el entorno actual | Adaptador demo runnable + tests sin red |
| Node 19 (no LTS) | Se fija Next.js 14 (compatible) |
| Fidelidad visual con Tailwind CDN → build real | Se portan los tokens al `tailwind.config.js` |
| Cálculos financieros incorrectos | Servicios puros con pruebas unitarias |
| Fugas de datos entre usuarios | Reglas Firestore + filtrado por `userId` en repos |

## 17. Decisiones pendientes

- Proveer credenciales Firebase reales para desplegar con backend real (el usuario deberá
  crear el proyecto). Hasta entonces, el modo demo cubre la demostración.
- Confirmar moneda por defecto (se asume MXN por los montos `$` de los diseños; configurable).

## 18. Fases de implementación

1. Descubrimiento + documentación.
2. Configuración base (Next.js, Tailwind, lint, Jest, estructura).
3. Sistema de diseño + layout.
4. Autenticación + protección de rutas.
5. Capa de datos + módulo financiero (cuentas, categorías, transacciones).
6. Dashboard.
7. Análisis, wallets, presupuestos, metas, perfil, settings.
8. Pruebas.
9. Reglas, docs finales, lint y build.

## 19. Criterios de aceptación por fase

- **F2:** `npm install` ok; `npm run dev` levanta; lint configurado.
- **F3:** layout responsive con sidebar/topnav/mobile-nav; tokens aplicados.
- **F4:** registro/login/logout/recuperación funcionan (demo); rutas privadas protegidas.
- **F5:** CRUD de transacciones/cuentas/categorías persiste (demo) y calcula balances.
- **F6:** dashboard con datos reales del usuario, con estados vacío/carga/error.
- **F7:** análisis, presupuestos, metas, perfil y settings operativos.
- **F8:** pruebas unitarias y de componentes en verde; e2e configurado.
- **F9:** `npm run lint` sin errores críticos; `npm run build` exitoso; docs completas.

## 20. Definición de "terminado" (MVP)

Ver `docs/ESTADO_IMPLEMENTACION.md` para el avance real por fase y el checklist de
criterios de aceptación globales del enunciado.
