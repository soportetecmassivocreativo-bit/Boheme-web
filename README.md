# 🌸 BOHEME Web

Sitio web oficial y catálogo boutique interactivo para **BOHEME** — Confección y diseño de gorritos quirúrgicos, lanyards y accesorios médicos con estilo único, creativo e innovador.

---

## 🎨 Paleta de Marca & Estilo
- **Borgoña de Marca:** `#550C18`
- **Terracota:** `#D86A33`
- **Melocotón Pastel:** `#FFC99C`
- **Fondo:** Blanco puro (`#FFFFFF`) y acentos crema cálidos (`#FFF9F5`)
- **Pie de Página:** `#3d0710` con marca de agua y logo en `#FFC99C`

---

## 🛠️ Stack Tecnológico
- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Estilos:** Tailwind CSS con animaciones continuas (Marquee Tickers, Washi Tapes, Bento Grid)
- **Base de Datos:** [Supabase](https://supabase.com) (PostgreSQL) con políticas Row Level Security (RLS)
- **Gestión de Estado:** Zustand (Carrito de compras interactivo)
- **Despliegue:** [Vercel](https://boheme-blue.vercel.app)

---

## 🗄️ Configuración de Supabase

1. Ejecutar el script SQL ubicado en [`supabase/schema.sql`](supabase/schema.sql) en el **SQL Editor** de tu panel de Supabase.
2. Configurar las siguientes variables de entorno en tu archivo `.env.local` o en la configuración de Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

---

## 🚀 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
