# Q&V Tech — Panel administrativo (`/admin`)

SPA en JS vanilla (sin build step), mobile-first, preparada como PWA instalable en iPhone.
Administra los mismos clientes que consume el perfil público (`qvtech.cl/p/[slug]`).

## Probarlo ahora

Sirve la carpeta con cualquier servidor estático (los módulos ES no funcionan con `file://`):

```bash
npx serve .
# o
python3 -m http.server 8080
```

Abre `http://localhost:8080`, inicia sesión con cualquier correo/contraseña (login mock) y prueba:
crear un cliente, editar uno existente, subir un logo, activar/desactivar, buscar, copiar la URL.

Los datos se guardan en `localStorage` del navegador — persisten al recargar, pero son locales
a ese navegador hasta que se conecte Supabase.

## Estructura de archivos

```
index.html            entrada de la SPA
manifest.json          PWA
sw.js                   cache offline del shell (nunca cachea datos)
css/
  tokens.css            variables de marca (compartidas conceptualmente con el perfil público)
  app.css               estilos de la app
js/
  config.js             URLs y flags (USE_SUPABASE)
  main.js                arranque + registro del service worker
  router.js              router por hash + guardia de autenticación
  services/
    supabase-client.js   conexión a Supabase (desactivada hasta configurar credenciales)
    auth-service.js       login/logout/sesión
    clients-service.js    CRUD de clientes (localStorage hoy, Supabase mañana)
    slug.js                generación de slugs únicos
  ui/
    components.js         StatusBadge, ClientCard, EmptyState, LoadingState, ErrorState
    toast.js               notificaciones
    modal.js                confirmaciones
  pages/
    login.js, dashboard.js, clients-list.js, client-form.js, settings.js, nav.js
```

Cada capa tiene una sola responsabilidad, así que agregar analíticas, tarjetas NFC o
personalización visual más adelante significa **agregar** archivos, no reescribir los existentes.

## Esquema de base de datos (Supabase / Postgres)

```sql
create table clients (
  id               uuid primary key default gen_random_uuid(),
  business_name    text not null,
  slug             text not null unique,
  description      text,
  logo_url         text,
  whatsapp         text,
  whatsapp_message text,
  phone            text,
  instagram        text,
  facebook         text,
  tiktok           text,
  website          text,
  address          text,
  city             text,
  google_maps_url  text,
  hours            jsonb,
  status           text not null default 'active' check (status in ('active', 'inactive')),
  -- reservados para personalización futura, no se editan desde esta versión:
  primary_color    text,
  secondary_color  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index clients_slug_idx on clients (slug);
```

Tablas previstas para más adelante (no se crean en esta etapa, solo quedan documentadas
para no diseñar nada que las bloquee):

```sql
-- futura gestión de tarjetas físicas
create table nfc_cards (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references clients(id),
  card_code  text,
  status     text,
  created_at timestamptz default now()
);

-- futuras analíticas de clics/visitas
create table profile_events (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references clients(id),
  event_type text, -- 'visit' | 'whatsapp_click' | 'instagram_click' | ...
  created_at timestamptz default now()
);
```

`clients-service.js` ya emite exactamente los eventos que `profile_events` necesitaría
(ver `trackClick` en el perfil público) — conectar analíticas es agregar un insert, no rediseñar.

## Row Level Security (RLS)

```sql
alter table clients enable row level security;

-- lectura pública: solo perfiles activos, y solo columnas necesarias para mostrarlos
create policy "public_read_active_clients"
  on clients for select
  to anon
  using (status = 'active');

-- lectura/escritura completa: solo usuarios autenticados de Q&V
create policy "staff_full_access"
  on clients for all
  to authenticated
  using (true)
  with check (true);
```

El perfil público (`/p/[slug]`) usa el rol `anon` con la política de solo-activos.
El panel `/admin` usa el rol `authenticated` (usuarios que hicieron login con Supabase Auth).

## Autenticación

- `auth-service.js` hoy acepta cualquier credencial (modo desarrollo, sin backend).
- Al activar Supabase (`USE_SUPABASE = true` en `config.js`), `login()` pasa a llamar
  `supabase.auth.signInWithPassword({ email, password })`. Las contraseñas nunca se
  guardan en la base de datos propia — las administra Supabase Auth.
- Los usuarios autorizados de Q&V se crean directamente en el panel de Supabase
  (Authentication → Users), no hay registro público.

## Subida de logos (Storage)

Hoy el logo se convierte a `data URL` en el navegador (`client-form.js`) y se guarda
directo en `logo_url`, para que subir/ver el logo funcione en el demo sin backend.

Al conectar Supabase:

```js
const { data, error } = await supabase.storage
  .from('client-logos')
  .upload(`${slug}-${Date.now()}.jpg`, file);

const { data: { publicUrl } } = supabase.storage
  .from('client-logos')
  .getPublicUrl(data.path);

// publicUrl se guarda en logo_url, igual que hoy con el data URL
```

Bucket `client-logos` con lectura pública y escritura solo para `authenticated`.

## Relación con el perfil público

Ambos proyectos leen de la misma tabla `clients` en Supabase. El admin escribe,
el perfil público solo lee (con la política de RLS de arriba). Cambiar el WhatsApp
de un cliente en `/admin` actualiza automáticamente lo que ve cualquiera que toque
su tarjeta NFC — la URL de la tarjeta nunca cambia.

## PWA en iPhone

1. Abrir el sitio en Safari.
2. Compartir → Añadir a pantalla de inicio.
3. Queda instalado como "Q&V Tech", pantalla completa, sin barra de Safari.

Los íconos en `icons/` son un placeholder con las iniciales "Q&V" (fondo verde oscuro
de marca) — reemplázalos por el logo oficial cuando esté listo; el resto de la PWA
(manifest, service worker) no necesita cambios.

## Qué queda intencionalmente fuera de esta primera versión

- Conexión real a Supabase (hoy mock/localStorage — ver instrucciones arriba).
- Analíticas reales (la arquitectura de eventos ya está prevista, no implementada).
- Gestión de tarjetas NFC (`nfc_cards`, tabla documentada, no creada).
- Módulo comercial (ventas, precios, renovaciones).
- Personalización visual por cliente (`primary_color`/`secondary_color` reservados en el
  esquema, sin editor todavía).

Cada uno de estos puntos se agrega sin rehacer lo ya construido.
