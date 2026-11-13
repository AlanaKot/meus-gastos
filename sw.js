// Service worker: um programinha que o navegador roda em segundo plano.
// Ele guarda uma cópia do site para abrir mesmo sem internet.
// Ao mudar este arquivo ou os ícones, aumente a VERSAO para os aparelhos baixarem a cópia nova.
const PREFIXO = "meus-gastos-";
const VERSAO = PREFIXO + "v1";
const ARQUIVOS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

// apaga só as cópias antigas deste app (outros apps no mesmo endereço, como o Meu Semestre, têm as deles)
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIXO) && k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // a página: tenta a internet primeiro (para pegar a versão nova) e usa a cópia se estiver sem conexão
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(VERSAO).then(k => k.put("index.html", c)); }
      return r;
    }).catch(() => caches.open(VERSAO).then(k => k.match("index.html").then(r => r || k.match("./")))));
    return;
  }

  // ícones e manifesto: cópia primeiro
  if (url.origin === location.origin) {
    e.respondWith(caches.open(VERSAO).then(k => k.match(req)).then(r => r || fetch(req)));
  }
});
