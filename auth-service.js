import { USE_SUPABASE } from "../config.js";
import { getSupabase } from "./supabase-client.js";

const SESSION_KEY = "qv_admin_session";

/**
 * login(email, password)
 * HOY: acepta cualquier credencial no vacía (mock de desarrollo).
 * MAÑANA: reemplazar el bloque `if (!USE_SUPABASE)` por
 *   const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
 *   if (error) throw new Error("Correo o contraseña incorrectos.");
 *   return data.session;
 * No se almacenan contraseñas en ningún momento: Supabase Auth las maneja.
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Ingresa tu correo y contraseña.");
  }

  if (!USE_SUPABASE) {
    const session = { email, loggedInAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error("Correo o contraseña incorrectos.");
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
  return data.session;
}

export async function logout() {
  localStorage.removeItem(SESSION_KEY);
  if (USE_SUPABASE) {
    await getSupabase().auth.signOut();
  }
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(getSession());
}
