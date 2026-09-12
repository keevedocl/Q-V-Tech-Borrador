/**
 * clients-service.js
 * ------------------------------------------------------------------
 * Única puerta de entrada a los datos de clientes desde el admin.
 * HOY: localStorage (para que crear/editar/buscar funcione de verdad
 * en el demo). MAÑANA: reemplazar el cuerpo de cada función por la
 * consulta a Supabase equivalente (comentada abajo de cada una).
 * Ninguna página (dashboard.js, clients-list.js, client-form.js)
 * necesita cambiar cuando eso ocurra.
 * ------------------------------------------------------------------
 */
import { uniqueSlug } from "./slug.js";

const STORAGE_KEY = "qv_admin_clients";

const SEED = [
  {
    id: "1", business_name: "Ferretería XYZ", slug: "ferreteria-xyz",
    description: "Todo para tus proyectos", logo_url: null,
    whatsapp: "+56912345678", whatsapp_message: "Hola, encontré su negocio mediante su tarjeta NFC.",
    phone: "+56912345678", instagram: "@ferreteriaxyz", facebook: null, tiktok: null, website: null,
    address: "Av. Balmaceda 123", city: "Curicó, Chile",
    google_maps_url: "https://maps.app.goo.gl/ejemplo",
    hours: { lun: "09:00 - 19:00", mar: "09:00 - 19:00", mie: "09:00 - 19:00", jue: "09:00 - 19:00", vie: "09:00 - 19:00", sab: "09:00 - 14:00", dom: null },
    status: "active", created_at: "2026-06-01T10:00:00.000Z", updated_at: "2026-06-01T10:00:00.000Z"
  },
  {
    id: "2", business_name: "Panadería Don Pedro", slug: "panaderia-don-pedro",
    description: "Pan recién horneado todos los días", logo_url: null,
    whatsapp: "+56987654321", whatsapp_message: "Hola, los encontré mediante su tarjeta NFC.",
    phone: null, instagram: "@panaderiadonpedro", facebook: "https://facebook.com/panaderiadonpedro",
    tiktok: null, website: null, address: null, city: null, google_maps_url: null, hours: null,
    status: "active", created_at: "2026-06-03T10:00:00.000Z", updated_at: "2026-06-03T10:00:00.000Z"
  },
  {
    id: "3", business_name: "Botillería El Sol", slug: "botilleria-el-sol",
    description: null, logo_url: null, whatsapp: "+56911112222", whatsapp_message: null,
    phone: null, instagram: null, facebook: null, tiktok: null, website: null,
    address: "Calle Principal 45", city: "San Javier, Chile", google_maps_url: null, hours: null,
    status: "inactive", created_at: "2026-05-20T10:00:00.000Z", updated_at: "2026-07-01T10:00:00.000Z"
  }
];

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
    return [...SEED];
  }
  return JSON.parse(raw);
}

function writeAll(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

/** getClients() -> lista completa, más recientes primero */
// Futuro Supabase: supabase.from('clients').select('*').order('created_at', { ascending: false })
export async function getClients() {
  return readAll().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Futuro Supabase: supabase.from('clients').select('*').eq('slug', slug).single()
export async function getClientBySlug(slug) {
  return readAll().find(c => c.slug === slug) || null;
}

// Futuro Supabase: supabase.from('clients').select('slug')  (para validar unicidad)
export async function getAllSlugs() {
  return readAll().map(c => c.slug);
}

/**
 * createClient(data) — data trae al menos business_name.
 * Genera slug único automáticamente si no se especifica uno.
 * Futuro Supabase: supabase.from('clients').insert({...}).select().single()
 */
export async function createClient(data) {
  const clients = readAll();
  const slug = data.slug || uniqueSlug(data.business_name, clients.map(c => c.slug));
  const now = new Date().toISOString();

  const client = {
    id: crypto.randomUUID(),
    business_name: data.business_name,
    slug,
    description: data.description || null,
    logo_url: data.logo_url || null,
    whatsapp: data.whatsapp || null,
    whatsapp_message: data.whatsapp_message || null,
    phone: data.phone || null,
    instagram: data.instagram || null,
    facebook: data.facebook || null,
    tiktok: data.tiktok || null,
    website: data.website || null,
    address: data.address || null,
    city: data.city || null,
    google_maps_url: data.google_maps_url || null,
    hours: data.hours || null,
    status: "active",
    created_at: now,
    updated_at: now
  };

  clients.push(client);
  writeAll(clients);
  return client;
}

/**
 * updateClient(id, changes)
 * Futuro Supabase: supabase.from('clients').update({...changes, updated_at: now}).eq('id', id)
 */
export async function updateClient(id, changes) {
  const clients = readAll();
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) throw new Error("Cliente no encontrado.");

  if (changes.business_name && !changes.slug) {
    // si cambia el nombre pero no especifican slug nuevo, se conserva el slug actual
    changes.slug = clients[idx].slug;
  }

  clients[idx] = { ...clients[idx], ...changes, updated_at: new Date().toISOString() };
  writeAll(clients);
  return clients[idx];
}

/** setStatus(id, 'active' | 'inactive') — soft delete, nunca se borra el registro */
// Futuro Supabase: supabase.from('clients').update({ status }).eq('id', id)
export async function setStatus(id, status) {
  return updateClient(id, { status });
}
