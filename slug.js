/**
 * Convierte "Ferretería Ñuñoa" en "ferreteria-nunoa".
 * Maneja tildes, ñ, mayúsculas, espacios y caracteres especiales.
 */
export function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quita tildes (incluida la de la ñ)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")      // quita símbolos
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Genera un slug único comparando contra los slugs ya existentes.
 * "ferreteria-xyz" -> si ya existe -> "ferreteria-xyz-2", "ferreteria-xyz-3", etc.
 */
export function uniqueSlug(baseText, existingSlugs, ignoreSlug = null) {
  const base = slugify(baseText) || "negocio";
  const taken = new Set(existingSlugs.filter(s => s !== ignoreSlug));

  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
