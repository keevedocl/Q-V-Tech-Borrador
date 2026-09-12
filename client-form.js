import { createClient, updateClient, getClientBySlug, getAllSlugs, setStatus } from "../services/clients-service.js";
import { slugify, uniqueSlug } from "../services/slug.js";
import { showToast } from "../ui/toast.js";
import { confirmModal } from "../ui/modal.js";
import { LoadingState, ErrorState } from "../ui/components.js";
import { PUBLIC_PROFILE_BASE_URL } from "../config.js";

const DAYS = [
  ["lun", "Lunes"], ["mar", "Martes"], ["mie", "Miércoles"], ["jue", "Jueves"],
  ["vie", "Viernes"], ["sab", "Sábado"], ["dom", "Domingo"]
];

export async function renderClientForm(content, { mode, slug }) {
  content.innerHTML = LoadingState();

  let client = null;
  if (mode === "edit") {
    client = await getClientBySlug(slug);
    if (!client) {
      content.innerHTML = ErrorState("No encontramos ese cliente.", "#/clientes");
      return;
    }
  }

  const hours = client?.hours || Object.fromEntries(DAYS.map(([key]) => [key, null]));

  content.innerHTML = `
    <div class="qv-page-header">
      <a class="qv-back-link" href="#/clientes">‹ Clientes</a>
      <h1>${mode === "create" ? "Nuevo cliente" : "Editar cliente"}</h1>
    </div>

    <form id="qv-client-form" class="qv-form">

      <section class="qv-form-section">
        <h2>Información principal</h2>
        <label class="qv-field">
          <span>Nombre del negocio *</span>
          <input type="text" name="business_name" required value="${client?.business_name || ""}" placeholder="Ferretería XYZ">
        </label>
        <label class="qv-field">
          <span>Descripción</span>
          <input type="text" name="description" value="${client?.description || ""}" placeholder="Todo para tus proyectos">
        </label>
        <label class="qv-field">
          <span>WhatsApp</span>
          <input type="text" name="whatsapp" value="${client?.whatsapp || ""}" placeholder="+56 9 1234 5678">
        </label>
        <label class="qv-field">
          <span>Instagram</span>
          <input type="text" name="instagram" value="${client?.instagram || ""}" placeholder="@ferreteriaxyz">
        </label>
        <label class="qv-field">
          <span>Dirección</span>
          <input type="text" name="address" value="${client?.address || ""}" placeholder="Av. Balmaceda 123">
        </label>
      </section>

      <details class="qv-form-section qv-form-collapsible" ${mode === "edit" ? "open" : ""}>
        <summary>Más opciones</summary>

        <div class="qv-form-subsection">
          <h3>Contacto</h3>
          <label class="qv-field"><span>Teléfono</span>
            <input type="text" name="phone" value="${client?.phone || ""}" placeholder="+56 9 1234 5678"></label>
          <label class="qv-field"><span>Facebook</span>
            <input type="text" name="facebook" value="${client?.facebook || ""}" placeholder="https://facebook.com/tu-negocio"></label>
          <label class="qv-field"><span>TikTok</span>
            <input type="text" name="tiktok" value="${client?.tiktok || ""}" placeholder="https://tiktok.com/@tu-negocio"></label>
          <label class="qv-field"><span>Sitio web</span>
            <input type="text" name="website" value="${client?.website || ""}" placeholder="https://tunegocio.cl"></label>
        </div>

        <div class="qv-form-subsection">
          <h3>Ubicación</h3>
          <label class="qv-field"><span>Ciudad</span>
            <input type="text" name="city" value="${client?.city || ""}" placeholder="Curicó, Chile"></label>
          <label class="qv-field"><span>Google Maps (enlace)</span>
            <input type="text" name="google_maps_url" value="${client?.google_maps_url || ""}" placeholder="https://maps.app.goo.gl/..."></label>
        </div>

        <div class="qv-form-subsection">
          <h3>Apariencia</h3>
          <label class="qv-field"><span>Logo</span>
            <input type="file" name="logo_file" accept="image/*">
          </label>
          <div id="qv-logo-preview">${client?.logo_url ? `<img src="${client.logo_url}" class="qv-logo-preview-img">` : ""}</div>
        </div>

        <div class="qv-form-subsection">
          <h3>Horarios</h3>
          <p class="qv-field-hint">Deja vacío el día que esté cerrado.</p>
          ${DAYS.map(([key, label]) => `
            <label class="qv-field qv-field-inline">
              <span>${label}</span>
              <input type="text" name="hours_${key}" value="${hours[key] || ""}" placeholder="09:00 - 19:00">
            </label>`).join("")}
        </div>

        ${mode === "edit" ? `
        <div class="qv-form-subsection">
          <h3>Estado</h3>
          <button type="button" id="qv-toggle-status" class="qv-btn-secondary qv-btn-block">
            ${client.status === "active" ? "Desactivar cliente" : "Activar cliente"}
          </button>
        </div>` : ""}

      </details>

      <p class="qv-form-error" id="qv-form-error" hidden></p>

      <button class="qv-btn-primary qv-btn-block" type="submit">
        ${mode === "create" ? "Crear cliente" : "Guardar cambios"}
      </button>
    </form>

    <div id="qv-success-screen" hidden></div>`;

  const form = document.getElementById("qv-client-form");
  const errorEl = document.getElementById("qv-form-error");
  const logoInput = form.querySelector('input[name="logo_file"]');
  const logoPreview = document.getElementById("qv-logo-preview");

  let logoDataUrl = client?.logo_url || null;

  logoInput.addEventListener("change", () => {
    const file = logoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoDataUrl = reader.result;
      logoPreview.innerHTML = `<img src="${logoDataUrl}" class="qv-logo-preview-img">`;
    };
    reader.readAsDataURL(file);
  });

  if (mode === "edit") {
    document.getElementById("qv-toggle-status").addEventListener("click", async () => {
      const goingInactive = client.status === "active";
      const ok = await confirmModal({
        title: goingInactive ? "¿Desactivar este cliente?" : "¿Activar este cliente?",
        message: goingInactive
          ? "Su perfil dejará de mostrarse públicamente. Podrás activarlo de nuevo cuando quieras."
          : "Su perfil volverá a mostrarse públicamente.",
        confirmLabel: goingInactive ? "Desactivar" : "Activar",
        danger: goingInactive
      });
      if (!ok) return;

      await setStatus(client.id, goingInactive ? "inactive" : "active");
      showToast(goingInactive ? "✓ Cliente desactivado" : "✓ Cliente activado");
      renderClientForm(content, { mode: "edit", slug: client.slug });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const fd = new FormData(form);
    const businessName = fd.get("business_name").trim();

    if (!businessName) {
      return showError("Ingresa el nombre del negocio.");
    }

    const urlFields = ["facebook", "tiktok", "website", "google_maps_url"];
    for (const field of urlFields) {
      const value = fd.get(field)?.trim();
      if (value && !/^https?:\/\/.+/.test(value)) {
        return showError("Ingresa una URL válida (debe empezar con https://).");
      }
    }

    const hoursData = {};
    let hasAnyHour = false;
    DAYS.forEach(([key]) => {
      const value = fd.get(`hours_${key}`)?.trim() || null;
      hoursData[key] = value;
      if (value) hasAnyHour = true;
    });

    const payload = {
      business_name: businessName,
      description: fd.get("description")?.trim() || null,
      whatsapp: fd.get("whatsapp")?.trim() || null,
      instagram: fd.get("instagram")?.trim() || null,
      address: fd.get("address")?.trim() || null,
      phone: fd.get("phone")?.trim() || null,
      facebook: fd.get("facebook")?.trim() || null,
      tiktok: fd.get("tiktok")?.trim() || null,
      website: fd.get("website")?.trim() || null,
      city: fd.get("city")?.trim() || null,
      google_maps_url: fd.get("google_maps_url")?.trim() || null,
      hours: hasAnyHour ? hoursData : null,
      logo_url: logoDataUrl
    };

    try {
      if (mode === "create") {
        const existingSlugs = await getAllSlugs();
        payload.slug = uniqueSlug(businessName, existingSlugs);
        const created = await createClient(payload);
        showToast("✓ Cliente creado correctamente");
        renderSuccessScreen(content, created);
      } else {
        const updated = await updateClient(client.id, payload);
        showToast("✓ Cambios guardados");
        window.location.hash = "#/clientes";
        // pequeño delay para que el hash aplique antes de posibles re-renders
        setTimeout(() => {}, 0);
        void updated;
      }
    } catch (err) {
      showError(err.message || "No pudimos guardar los cambios. Intenta nuevamente.");
    }
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderSuccessScreen(content, client) {
  const url = `${PUBLIC_PROFILE_BASE_URL}${client.slug}`;

  content.innerHTML = `
    <div class="qv-success-screen">
      <div class="qv-success-check">✓</div>
      <h1>Cliente creado</h1>
      <p class="qv-success-name">${client.business_name}</p>

      <div class="qv-url-box">
        <p>${url}</p>
      </div>

      <div class="qv-success-actions">
        <button class="qv-btn-primary qv-btn-block" id="qv-copy-url">Copiar URL</button>
        <a class="qv-btn-secondary qv-btn-block" href="${url}" target="_blank" rel="noopener">Ver perfil</a>
        <a class="qv-btn-secondary qv-btn-block" href="#/clientes/${client.slug}/editar">Editar cliente</a>
        <a class="qv-btn-ghost qv-btn-block" href="#/clientes">Ir a clientes</a>
      </div>
    </div>`;

  document.getElementById("qv-copy-url").addEventListener("click", () => {
    copyToClipboard(url);
    showToast("✓ URL copiada");
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  }
}
