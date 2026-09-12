/**
 * Configuración global del panel.
 * Cuando el perfil público (qvtech.cl/p/[slug]) esté desplegado,
 * solo hay que actualizar esta URL — nada más del código cambia.
 */
export const PUBLIC_PROFILE_BASE_URL = "https://qvtech.cl/p/";

// Se activa automáticamente cuando conectemos Supabase real
// (ver services/supabase-client.js). Mientras tanto todo corre en mock/localStorage.
export const USE_SUPABASE = false;
