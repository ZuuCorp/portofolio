const CACHE = 'zu-portfolio-v1'
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './projects.html',
  './contact.html'
]
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))
})
self.addEventListener('fetch', e => {
  const req = e.request
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(net => {
      if (req.method === 'GET' && net.ok) {
        const clone = net.clone(); caches.open(CACHE).then(c=>c.put(req, clone))
      }
      return net
    }).catch(()=>caches.match('./index.html')))
  )
})