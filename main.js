import { startRouter } from "./router.js";

startRouter();

// Registro de service worker para comportamiento de PWA (offline básico + instalable)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // si falla (p. ej. abierto como file://), la app sigue funcionando igual, solo sin cache offline
    });
  });
}
