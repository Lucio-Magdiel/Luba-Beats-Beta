# 🚀 Guía de Inicio Rápido - Luba Beats Beta

## ✅ Estado de Configuración

### Completado ✓
- [x] **package.json** - Todas las dependencias instaladas (1050+ paquetes)
- [x] **Prisma Schema** - Base de datos completa con soporte para pagos Latam
- [x] **Variables de Entorno** - .env.example con toda la configuración
- [x] **TypeScript** - Configuración estricta y path aliases
- [x] **ESLint** - Reglas de calidad de código
- [x] **Prettier** - Formateo automático de código
- [x] **Documentación** - README, ARCHITECTURE y PAYMENT_INTEGRATION

### Métodos de Pago Configurados 💳
- **Perú** 🇵🇪: Culqi (Yape, Plin, PagoEfectivo), Niubiz, Izipay
- **Latam** 🌎: Mercado Pago (18 países)
- **Internacional** 🌐: Stripe

---

## 🏗️ Próximos Pasos

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus credenciales
code .env.local
```

**Variables mínimas para empezar:**
- `DATABASE_URL` - PostgreSQL
- `NEXTAUTH_SECRET` - Generar con: `openssl rand -base64 32`
- `CULQI_PUBLIC_KEY` y `CULQI_SECRET_KEY` - Para pagos en Perú
- `CLOUDINARY_*` - Para subir archivos

### 2. Configurar Base de Datos PostgreSQL

**Opción A: Local con Docker**
```bash
# Crear contenedor de PostgreSQL
docker run --name lubabeats-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=lubabeats `
  -p 5432:5432 `
  -d postgres:16

# Verificar que esté corriendo
docker ps
```

**Opción B: Cloud (Recomendado para producción)**
- [Neon](https://neon.tech) - Gratis hasta 10GB
- [Supabase](https://supabase.com) - Incluye auth y storage
- [Railway](https://railway.app) - PostgreSQL + Redis

**Opción C: Local con XAMPP**
```bash
# Instalar PostgreSQL en Windows
# Descargar de: https://www.postgresql.org/download/windows/
```

### 3. Ejecutar Migraciones de Prisma

```bash
# Generar el cliente de Prisma
pnpm prisma generate

# Crear las tablas en la BD
pnpm prisma db push

# O usar migraciones (recomendado)
pnpm prisma migrate dev --name init

# Abrir Prisma Studio para ver la BD
pnpm prisma studio
```

### 4. Crear Estructura de Carpetas

```bash
# Crear todas las carpetas del proyecto
pnpm run setup:folders
```

O manualmente:
```bash
cd src
mkdir -p app/(auth)/login app/(auth)/register app/(platform)/browse
mkdir -p app/(platform)/player app/(platform)/profile app/(platform)/producer
mkdir -p app/(platform)/admin app/api/auth app/api/beats app/api/payments
mkdir -p components/ui components/audio components/beats components/forms
mkdir -p components/layout components/shared
mkdir -p lib/payment lib/audio lib/utils
mkdir -p hooks store types config styles
```

### 5. Configurar Redis (Opcional pero Recomendado)

**Opción A: Local con Docker**
```bash
docker run --name lubabeats-redis -p 6379:6379 -d redis:7
```

**Opción B: Cloud**
- [Upstash](https://upstash.com) - Redis serverless gratis
- [Redis Cloud](https://redis.com/try-free/) - 30MB gratis

### 6. Obtener API Keys de Pagos

#### Para Perú (CULQI) - Prioritario
1. Ir a [https://culqi.com](https://culqi.com)
2. Crear cuenta de empresa
3. Completar verificación (RUC, documentos)
4. Obtener keys de testing en el dashboard
5. Configurar webhook URL: `https://tu-dominio.com/api/webhooks/culqi`

#### Mercado Pago (Resto de Latam)
1. Ir a [https://www.mercadopago.com.pe/developers](https://www.mercadopago.com.pe/developers)
2. Crear aplicación
3. Obtener credenciales de test
4. Configurar webhook: `https://tu-dominio.com/api/webhooks/mercadopago`

#### Stripe (Internacional - Backup)
1. Ir a [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Obtener keys de test
3. Configurar webhook: `https://tu-dominio.com/api/webhooks/stripe`

### 7. Configurar Cloudinary

1. Crear cuenta en [https://cloudinary.com](https://cloudinary.com)
2. Obtener Cloud Name, API Key y API Secret
3. Crear upload preset:
   - Settings → Upload → Upload presets
   - Nombre: `luba_beats_preset`
   - Mode: Unsigned
   - Folder: `luba-beats`
   - Allowed formats: `mp3,wav,flac,jpg,png,webp`

### 8. Iniciar Servidor de Desarrollo

```bash
# Instalar dependencias (si aún no lo hiciste)
pnpm install

# Iniciar Next.js en modo desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto Actual

```
luba-beats-beta/
├── src/
│   └── app/
│       ├── layout.tsx         # Layout principal
│       ├── page.tsx           # Landing page (temporalmente)
│       └── globals.css        # Estilos globales
├── prisma/
│   └── schema.prisma          # ✅ Schema completo
├── public/
│   └── (assets estáticos)
├── .env.example               # ✅ Variables de entorno
├── .prettierrc                # ✅ Configuración Prettier
├── package.json               # ✅ 1050+ paquetes instalados
├── tsconfig.json              # ✅ TypeScript configurado
├── eslint.config.mjs          # ✅ ESLint configurado
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── postcss.config.mjs         # PostCSS config
├── README.md                  # ✅ Documentación completa
├── ARCHITECTURE.md            # ✅ Arquitectura técnica
├── PAYMENT_INTEGRATION.md     # ✅ Guía de pagos Latam
└── GETTING_STARTED.md         # ✅ Esta guía
```

---

## 🎯 Tareas Inmediatas

### Fase 1: Setup Básico (Esta semana)
- [ ] Configurar todas las variables de entorno
- [ ] Levantar PostgreSQL y Redis
- [ ] Ejecutar migraciones de Prisma
- [ ] Crear estructura de carpetas completa
- [ ] Obtener API keys de Culqi (modo test)

### Fase 2: Autenticación (Semana 2)
- [ ] Implementar NextAuth.js
- [ ] Crear páginas de login/registro
- [ ] Integrar Google OAuth
- [ ] Sistema de roles y permisos
- [ ] Middleware de protección de rutas

### Fase 3: Sistema de Beats (Semana 3-4)
- [ ] Upload de beats a Cloudinary
- [ ] Generación de waveforms
- [ ] Reproductor de audio básico
- [ ] Listado y búsqueda de beats
- [ ] Dashboard de productor

### Fase 4: Pagos con Culqi (Semana 5)
- [ ] Integración de Culqi
- [ ] Checkout con Yape
- [ ] Checkout con Plin
- [ ] Checkout con tarjetas
- [ ] Pago en efectivo (PagoEfectivo)
- [ ] Webhooks y verificación

### Fase 5: Features Avanzadas (Semana 6-8)
- [ ] Mercado Pago para Latam
- [ ] Sistema de reviews
- [ ] Playlists y favoritos
- [ ] Panel de administración
- [ ] Analytics y reportes

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Iniciar servidor de desarrollo
pnpm build                  # Build de producción
pnpm start                  # Iniciar servidor de producción

# Base de Datos
pnpm prisma generate        # Generar cliente Prisma
pnpm prisma studio          # Abrir GUI de base de datos
pnpm prisma migrate dev     # Crear nueva migración
pnpm prisma db push         # Push cambios sin migración
pnpm prisma db seed         # Poblar base de datos

# Código
pnpm lint                   # Ejecutar ESLint
pnpm lint:fix              # Corregir errores automáticamente
pnpm type-check            # Verificar tipos TypeScript
pnpm format                # Formatear con Prettier

# Testing
pnpm test                  # Ejecutar tests
pnpm test:watch            # Tests en modo watch
pnpm test:coverage         # Cobertura de tests

# Análisis
pnpm analyze               # Analizar tamaño del bundle
```

---

## 📚 Recursos

### Documentación Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://authjs.dev)

### Pagos Perú/Latam
- [Culqi Docs](https://docs.culqi.com)
- [Mercado Pago Docs](https://www.mercadopago.com.pe/developers/es/docs)
- [Niubiz Docs](https://integration.niubiz.com.pe/)

### Comunidad
- [Discord de Next.js](https://discord.gg/nextjs)
- [Foro de Prisma](https://github.com/prisma/prisma/discussions)

---

## 🐛 Troubleshooting

### Error: Cannot connect to database
```bash
# Verificar que PostgreSQL esté corriendo
# Docker:
docker ps | findstr postgres

# Verificar URL en .env.local
echo $env:DATABASE_URL
```

### Error: Module not found
```bash
# Limpiar caché y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item -Force pnpm-lock.yaml
pnpm install
```

### Error: Port 3000 already in use
```bash
# Matar proceso en puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# O usar otro puerto
pnpm dev -- -p 3001
```

### Error: Prisma Client not generated
```bash
pnpm prisma generate
```

---

## 💡 Tips de Desarrollo

1. **Usa pnpm en lugar de npm** - Es más rápido y eficiente
2. **Activa autosave en VS Code** - Para Prettier automático
3. **Instala extensiones recomendadas:**
   - Prisma
   - Tailwind CSS IntelliSense
   - ESLint
   - Prettier
   - TypeScript Error Translator
4. **Usa Git desde el principio**
5. **Configura pre-commit hooks con Husky**

---

## 🚀 ¿Listo para Empezar?

1. Configura el `.env.local`
2. Levanta PostgreSQL
3. Ejecuta `pnpm prisma db push`
4. Ejecuta `pnpm dev`
5. ¡A programar! 🎵

**¿Necesitas ayuda?** Pregunta lo que necesites.
