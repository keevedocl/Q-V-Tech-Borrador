import { login } from "../services/auth-service.js";
import { showToast } from "../ui/toast.js";

export async function renderLogin(app) {
  app.innerHTML = `
    <div class="qv-login-screen">
      <div class="qv-login-card">
        <div class="qv-login-logo">Q&amp;V</div>
        <h1>Q&amp;V Tech</h1>
        <p class="qv-login-subtitle">Panel administrativo</p>

        <form id="qv-login-form" class="qv-form">
          <label class="qv-field">
            <span>Correo</span>
            <input type="email" name="email" placeholder="tucorreo@qvtech.cl" required autocomplete="username">
          </label>
          <label class="qv-field">
            <span>Contraseña</span>
            <input type="password" name="password" placeholder="••••••••" required autocomplete="current-password">
          </label>
          <p class="qv-form-error" id="qv-login-error" hidden></p>
          <button class="qv-btn-primary qv-btn-block" type="submit">Iniciar sesión</button>
        </form>
      </div>
    </div>`;

  const form = document.getElementById("qv-login-form");
  const errorEl = document.getElementById("qv-login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const data = new FormData(form);

    try {
      await login(data.get("email"), data.get("password"));
      showToast("✓ Sesión iniciada");
      window.location.hash = "#/dashboard";
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });
}
