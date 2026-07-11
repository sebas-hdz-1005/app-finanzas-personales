# Modelo de Datos — NEON_LEDGER

Base de datos documental (**Cloud Firestore**). Cada entidad es una colección; el
aislamiento es por `userId`. El adaptador **demo** replica el mismo esquema en
`localStorage`/memoria.

Convenciones:
- `id`: string (autogenerado por Firestore o `crypto.randomUUID()` en demo).
- Fechas: se almacenan como ISO string (`YYYY-MM-DD` para fechas, ISO completo para timestamps).
  En Firestore real pueden migrarse a `Timestamp`; el repositorio normaliza a ISO en la app.
- Montos: `number` en la unidad menor no fraccionada de la moneda del usuario (se usan
  decimales estándar; los cálculos redondean a 2 decimales).
- `type` de movimiento/categoría: `'income' | 'expense'`.

---

## Colección `users`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | = `auth.uid` |
| `name` | string | nombre visible |
| `email` | string | único (gestionado por Auth) |
| `photoURL` | string \| null | avatar |
| `currency` | string | ISO 4217, default `MXN` |
| `createdAt` | ISO string | |
| `updatedAt` | ISO string | |

## Colección `accounts` (wallets)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | |
| `userId` | string | dueño |
| `name` | string | p. ej. "Cuenta principal", "Tarjeta de crédito" |
| `type` | string | `'checking' \| 'savings' \| 'credit' \| 'cash' \| 'investment'` |
| `initialBalance` | number | saldo inicial |
| `currentBalance` | number | derivado: `initialBalance + Σ(ingresos) − Σ(gastos)` de la cuenta |
| `currency` | string | hereda de user |
| `createdAt` / `updatedAt` | ISO string | |

> `currentBalance` se recalcula por servicio a partir de las transacciones; se persiste como
> caché para lecturas rápidas y se recomputa en cada mutación de transacción.

## Colección `categories`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | |
| `userId` | string | dueño (las base se siembran por usuario) |
| `name` | string | "Hogar", "Alimentación", "Salud"… |
| `type` | string | `'income' \| 'expense'` |
| `icon` | string | nombre de Material Symbol (`home`, `restaurant`…) |
| `color` | string | hex del token (para gráficos/leyendas) |
| `createdAt` | ISO string | |

## Colección `transactions`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | |
| `userId` | string | dueño |
| `accountId` | string | FK → accounts |
| `categoryId` | string | FK → categories |
| `type` | string | `'income' \| 'expense'` |
| `title` | string | "Modernist Loft / Rent" |
| `description` | string \| null | |
| `amount` | number | siempre positivo; el signo lo da `type` |
| `status` | string | `'confirmed' \| 'pending'` (mapea a SYNCED/PENDING/INCOMING del diseño) |
| `transactionDate` | ISO date | fecha del movimiento |
| `createdAt` / `updatedAt` | ISO string | |

## Colección `budgets`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | |
| `userId` | string | dueño |
| `categoryId` | string | FK → categories |
| `limitAmount` | number | tope del periodo |
| `period` | string | `'monthly' \| 'weekly' \| 'yearly'` |
| `startDate` / `endDate` | ISO date | ventana del presupuesto |
| `createdAt` / `updatedAt` | ISO string | |

> "Budget Drift" del diseño = `gastadoEnCategoria / limitAmount` (%). >100% = umbral superado.

## Colección `savingGoals`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string | |
| `userId` | string | dueño |
| `name` | string | "Fondo de emergencia" |
| `targetAmount` | number | meta |
| `currentAmount` | number | ahorrado |
| `targetDate` | ISO date | fecha objetivo |
| `status` | string | `'active' \| 'completed' \| 'paused'` |
| `createdAt` / `updatedAt` | ISO string | |

---

## Relaciones

```
users (1) ──< accounts (N)
users (1) ──< categories (N)
users (1) ──< transactions (N) >── (1) accounts
                              >── (1) categories
users (1) ──< budgets (N) >── (1) categories
users (1) ──< savingGoals (N)
```

## Índices (Firestore) — ver `firestore.indexes.json`

- `transactions`: (`userId` ASC, `transactionDate` DESC) — listados y paginación.
- `transactions`: (`userId` ASC, `type` ASC, `transactionDate` DESC) — filtros por tipo.
- `budgets`: (`userId` ASC, `categoryId` ASC).
- `savingGoals`: (`userId` ASC, `status` ASC).

## Derivaciones (calculadas por `financeService`, no persistidas salvo caché)

- **Costos totales** = Σ `amount` de transacciones `expense` del periodo.
- **Ingresos totales** = Σ `amount` de transacciones `income` del periodo.
- **Disponible** = ingresos − costos (o balance agregado de cuentas).
- **Distribución de gastos** = por `categoryId`, `%` sobre costos totales.
- **Flujo mensual (Spending Flux)** = Σ gastos por mes.
- **Budget Drift** = por presupuesto, `gastado / limitAmount`.
