const CACHE_NAME = "qv-admin-shell-v1";

const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/app.css",
  "./js/main.js",
  "./js/router.js",
  "./js/config.js",
  "./js/services/auth-service.js",
  "./js/services/clients-service.js",
  "./js/services/slug.js",
  "./js/services/supabase-client.js",
  "./js/ui/components.js",
  "./js/ui/toast.js",
  "./js/ui/modal.js",
  "./js/pages/nav.js",
  "./js/pages/login.js",
  "./js/pages/dashboard.js",
  "./js/pages/clients-list.js",
  "./js/pages/client-form.js",
  "./js/pages/settings.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: shell cacheado primero (rápido, funciona offline);
// los datos (Supabase) siempre van directo a la red, nunca se cachean aquí.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace("./", "/")));

  if (event.request.method !== "GET" || !isShellFile) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
