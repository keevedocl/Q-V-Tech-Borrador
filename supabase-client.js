/**
 * supabase-client.js
 * ------------------------------------------------------------------
 * Punto único de conexión a Supabase. Hoy no se usa (USE_SUPABASE = false
 * en config.js), pero deja listo el cableado para cuando se conecte.
 *
 * Pasos para activarlo:
 * 1. Agregar en index.html:
 *    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * 2. Completar SUPABASE_URL y SUPABASE_ANON_KEY abajo (clave pública, NUNCA la service_role).
 * 3. Cambiar USE_SUPABASE a true en config.js.
 * 4. auth-service.js y clients-service.js ya están escritos para usar
 *    este cliente en cuanto USE_SUPABASE sea true — no hace falta tocar
 *    ninguna página.
 * ------------------------------------------------------------------
 */

const SUPABASE_URL = "";       // ej: "https://xxxxx.supabase.co"
const SUPABASE_ANON_KEY = "";  // clave "anon/public", nunca la "service_role"

export function getSupabase() {
  if (!window.supabase) {
    throw new Error("SDK de Supabase no cargado. Agrega el <script> en index.html.");
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Faltan SUPABASE_URL / SUPABASE_ANON_KEY en supabase-client.js.");
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
