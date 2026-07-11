# Guía de Despliegue — NEON_LEDGER

Dos caminos: **(A) Demo** (sin backend, para vista previa inmediata) y **(B) Producción**
(Vercel + Firebase). El código es el mismo; sólo cambian las variables de entorno.

---

## 0. Requisitos

- Node.js 18.18+ (probado en 19.9) y npm 9+.
- Cuenta de [Vercel](https://vercel.com) (gratis) para hosting.
- Proyecto de [Firebase](https://console.firebase.google.com) (plan Spark gratis) para el
  backend real (opcional si sólo quieres demo).

---

## A. Despliegue en modo DEMO (sin credenciales)

Ideal para publicar una vista previa funcional sin configurar Firebase.

1. `cp .env.example .env.local`
2. En `.env.local` deja: `NEXT_PUBLIC_DATA_BACKEND=demo`
3. `npm install && npm run build && npm run start` (local) — o importa el repo en Vercel y
   despliega: sólo necesita `NEXT_PUBLIC_DATA_BACKEND=demo` como variable de entorno.
4. Entra con el usuario demo: **`demo@neonledger.app` / `demo1234`** (o usa "New Entity" para
   crear un usuario demo local). Los datos viven en el navegador (`localStorage`).

> En demo, los datos son por navegador y no se comparten entre dispositivos. Es el modo de
> demostración, no de producción.

---

## B. Despliegue en PRODUCCIÓN (Vercel + Firebase)

### B.1 Crear el proyecto Firebase

1. Consola Firebase → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database → Production mode → (región cercana).**
4. **Project settings → General → Your apps → Web (`</>`)** → registra la app y copia el
   objeto `firebaseConfig`.

### B.2 Configurar variables de entorno

Copia los valores de `firebaseConfig` a las variables (en `.env.local` para local y en
**Vercel → Project → Settings → Environment Variables** para producción):

```env
NEXT_PUBLIC_DATA_BACKEND=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Las variables `NEXT_PUBLIC_*` de Firebase Web son **públicas por diseño**; la seguridad la
> imponen las **reglas de Firestore**, no el secreto de estas claves.

### B.3 Publicar reglas e índices

Con [Firebase CLI](https://firebase.google.com/docs/cli):

```bash
npm i -g firebase-tools
firebase login
firebase use --add            # selecciona tu proyecto
firebase deploy --only firestore:rules,firestore:indexes
```

Los archivos `firestore.rules` y `firestore.indexes.json` están en la raíz del repo.

### B.4 Dominios autorizados (Auth)

En **Authentication → Settings → Authorized domains**, agrega tu dominio de Vercel
(`tu-app.vercel.app`) y cualquier dominio propio. `localhost` ya viene autorizado.

### B.5 Desplegar la app en Vercel

1. **New Project → Import Git Repository** (tu repo de `app_finanzas`).
2. Framework: **Next.js** (autodetectado). Build: `npm run build`. Output: por defecto.
3. Agrega las variables de entorno de B.2 (todas las `NEXT_PUBLIC_*` + `NEXT_PUBLIC_DATA_BACKEND=firebase`).
4. **Deploy.**

### B.6 Sembrar datos (opcional)

- Inicia sesión con un usuario real; ve a **Settings → "Cargar datos de demostración"** para
  sembrar categorías/cuenta/transacciones de ejemplo en tu propia cuenta.
- O llama a `POST /api/seed` autenticado.

---

## C. Emuladores de Firebase (desarrollo local con backend real, sin tocar producción)

Opcional, recomendado para desarrollar contra Firestore sin datos reales:

```bash
firebase init emulators      # selecciona Auth + Firestore
firebase emulators:start
```

Y en `.env.local`: `NEXT_PUBLIC_FIREBASE_USE_EMULATORS=true` (la app conecta a
`localhost:8080`/`9099` cuando esta bandera está activa).

---

## D. Comandos

```bash
npm install        # dependencias
npm run dev        # desarrollo (http://localhost:3000)
npm run lint       # ESLint
npm run test       # unit + componentes (Jest)
npm run test:e2e   # end-to-end (Playwright, modo demo)
npm run build      # build de producción
npm run start      # servir el build
```

## E. Checklist de despliegue

- [ ] Variables de entorno configuradas en Vercel.
- [ ] `firestore.rules` e `firestore.indexes.json` desplegados.
- [ ] Dominio de Vercel en "Authorized domains" de Auth.
- [ ] `npm run build` local exitoso.
- [ ] Login/registro funcionan en el dominio desplegado.
- [ ] Sin secretos en el repositorio (`.env.local` en `.gitignore`).
