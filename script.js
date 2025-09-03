const yearEl = document.getElementById("year")
if (yearEl) yearEl.textContent = new Date().getFullYear()

const header = document.querySelector(".site-header")
if (header) {
  const menuBtn = header.querySelector(".menu")
  if (menuBtn) menuBtn.addEventListener("click", () => {
    header.classList.toggle("open")
    const expanded = header.classList.contains('open')
    menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false')
    document.body.classList.toggle('is-locked', expanded)
  })
}

const overlay = document.querySelector(".transition")

document.addEventListener("click", e => {
  const link = e.target.closest("a")
  if (!link) return
  const href = link.getAttribute("href")
  if (!href) return
  if (href.startsWith("#")) {
    const target = document.querySelector(href)
    if (!target) return
    e.preventDefault()
    const offset = header ? header.offsetHeight + 12 : 0
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top: y, behavior: "smooth" })
    if (header) header.classList.remove("open")
    return
  }
  if (link.target === "_blank") return
  try {
    const url = new URL(href, window.location.href)
    if (url.origin !== window.location.origin) return
    e.preventDefault()
    if (overlay) {
      gsap.to(overlay, { scaleX: 1, transformOrigin: "left", duration: 0.3, ease: "power2.in", onComplete: () => { window.location.href = url.href } })
    } else {
      window.location.href = url.href
    }
  } catch {}
})

gsap.registerPlugin(ScrollTrigger)

gsap.from(".brand", { y: -18, opacity: 0, duration: 0.5, ease: "power3.out" })
gsap.from(".nav a", { y: -18, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 })

// theme toggle
;(function(){
  const btn = document.getElementById('themeToggle')
  const root = document.documentElement
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    root.setAttribute('data-theme', stored)
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light')
  }
  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
    if (next === 'dark') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', next)
  })
})()

gsap.utils.toArray(".section").forEach(section => {
  if (section.id === 'accueil') return
  const elements = section.querySelectorAll("h1, h2, h3, p, .skills, .grid, .contact-grid, .btn")
  if (!elements.length) return
  gsap.from(elements, { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, scrollTrigger: { trigger: section, start: "top 72%" } })
})

const hero = document.querySelector(".hero")
if (hero) {
  gsap.from([".hero-inner h1", ".hero-inner h2", ".hero-inner p", ".hero .btn"], { y: 20, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.06 })
  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: self => {
      const p = self.progress
      gsap.to(".hero-inner", { y: p * -40, ease: "none" })
    }
  })
}

const canvas = document.getElementById("bg")
if (canvas && window.THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
  renderer.setSize(window.innerWidth, window.innerHeight)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 8)
  const lightA = new THREE.PointLight(0xffffff, 0.9, 40)
  lightA.position.set(4, 6, 8)
  const lightB = new THREE.PointLight(0xffffff, 0.4, 40)
  lightB.position.set(-4, -6, -6)
  scene.add(lightA, lightB)
  const group = new THREE.Group()
  scene.add(group)
  const geo = new THREE.IcosahedronGeometry(2.2, 2)
  const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.35, roughness: 0.6, emissive: 0x000000, emissiveIntensity: 0.1 })
  const mesh = new THREE.Mesh(geo, mat)
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.12 })
  const wire = new THREE.Mesh(geo, wireMat)
  group.add(mesh, wire)
  const starCount = 900
  const positions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const r = 26
    const x = (Math.random() - 0.5) * r
    const y = (Math.random() - 0.5) * r
    const z = (Math.random() - 0.5) * r
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.01, transparent: true, opacity: 0.35 })
  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0
  window.addEventListener("mousemove", e => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    mouseX = (x - 0.5) * 2
    mouseY = (y - 0.5) * 2
  })
  function animate() {
    targetX += (mouseX - targetX) * 0.05
    targetY += (mouseY - targetY) * 0.05
    group.rotation.y += 0.002 + targetX * 0.02
    group.rotation.x += targetY * 0.02
    stars.rotation.y += 0.0006
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()
  window.addEventListener("resize", () => {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
}

const form = document.getElementById("contact-form")
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault()
    const status = document.querySelector(".form-status")
    if (status) {
      status.textContent = "Merci, votre message a été envoyé."
      gsap.fromTo(status, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" })
    }
    form.reset()
  })
}

let konamiSeq = []
const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]
window.addEventListener("keydown", e => {
  konamiSeq.push(e.key)
  if (konamiSeq.length > konami.length) konamiSeq.shift()
  if (konami.every((k,i) => konamiSeq[i]?.toLowerCase() === k.toLowerCase())) {
    const overlay = document.getElementById("easter")
    if (overlay) {
      overlay.style.pointerEvents = "auto"
      overlay.style.background = "radial-gradient(600px 600px at 50% 50%, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 60%, transparent 70%), repeating-linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)"
      gsap.to(overlay, { opacity: 1, duration: 0.25, ease: "power2.out" })
      gsap.to(overlay, { opacity: 0, duration: 0.6, delay: 0.5, ease: "power2.in" })
    }
    try {
      if (window.THREE && typeof group !== "undefined") {
        gsap.to(group.rotation, { y: "+=1.2", x: "+=0.6", duration: 1.2, ease: "power3.out" })
      }
    } catch {}
  }
})

const term = document.getElementById("terminal")
const termToggle = document.getElementById("termToggle")
const termHeader = document.getElementById("termHeader")
const termMin = document.getElementById("termMin")
const termClose = document.getElementById("termClose")
if (term && termToggle && termHeader) {
  termToggle.addEventListener("click", () => {
    term.classList.toggle("open")
    termToggle.setAttribute('aria-expanded', term.classList.contains('open') ? 'true' : 'false')
  })
  termClose?.addEventListener("click", () => term.classList.remove("open"))
  termMin?.addEventListener("click", () => term.classList.toggle("open"))
  let isDragging = false
  let startX = 0, startY = 0, startLeft = 0, startTop = 0
  termHeader.addEventListener("mousedown", e => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    const rect = term.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top
    document.body.style.userSelect = "none"
  })
  window.addEventListener("mousemove", e => {
    if (!isDragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    term.style.right = "auto"
    term.style.bottom = "auto"
    term.style.left = `${Math.max(8, Math.min(window.innerWidth - term.offsetWidth - 8, startLeft + dx))}px`
    term.style.top = `${Math.max(8, Math.min(window.innerHeight - term.offsetHeight - 8, startTop + dy))}px`
  })
  window.addEventListener("mouseup", () => {
    isDragging = false
    document.body.style.userSelect = ""
  })
  const body = document.getElementById("termBody")
  if (body) {
    // typing demo removed in favor of real commands
    body.innerHTML = ''
    function appendLine(html) {
      const div = document.createElement('div')
      div.className = 'term-line'
      div.innerHTML = html
      body.appendChild(div)
      body.scrollTop = body.scrollHeight
    }
    function promptLine() {
      const line = document.createElement('div')
      line.className = 'term-line'
      const prompt = document.createElement('span')
      prompt.className = 'term-prompt'
      prompt.textContent = 'kali@zuCorps'
      const cwd = document.createElement('span')
      cwd.className = 'term-dim'
      cwd.textContent = ':~$ '
      const input = document.createElement('input')
      input.type = 'text'
      input.style.background = 'transparent'
      input.style.border = 'none'
      input.style.outline = 'none'
      input.style.color = 'inherit'
      input.style.font = 'inherit'
      input.autocapitalize = 'off'
      input.autocomplete = 'off'
      input.spellcheck = false
      line.appendChild(prompt)
      line.appendChild(cwd)
      line.appendChild(input)
      body.appendChild(line)
      input.focus()
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const cmd = input.value.trim()
          line.innerHTML = `<span class="term-prompt">kali@zuCorps</span><span class="term-dim">:~$ </span>${cmd}`
          const res = runCommand(cmd)
          if (res !== 'ASYNC') {
            promptLine()
          }
        }
      })
    }
    function runCommand(cmd) {
      const [name, ...args] = cmd.split(/\s+/)
      switch ((name||'').toLowerCase()) {
        case 'help': {
          appendLine('<span class="term-dim">Usage</span>')
          appendLine('  help                                 <span class="term-dim">Afficher cette aide</span>')
          appendLine('  clear                                <span class="term-dim">Nettoyer l\'écran</span>')
          appendLine('  whoami                               <span class="term-dim">Afficher l\'utilisateur</span>')
          appendLine('  ls                                   <span class="term-dim">Lister des éléments</span>')
          appendLine('  pwd                                  <span class="term-dim">Afficher le répertoire</span>')
          appendLine('  tcolor &lt;bg&gt; &lt;fg&gt;                 <span class="term-dim">Changer couleurs du terminal</span>')
          appendLine('  binary [texte]                       <span class="term-dim">Convertir en binaire</span>')
          appendLine('  encrypt &lt;texte&gt;                    <span class="term-dim">Chiffrer en hex</span>')
          appendLine('  decrypt &lt;hex&gt;                      <span class="term-dim">Déchiffrer depuis hex</span>')
          appendLine('  nmap [options] &lt;cible&gt;             <span class="term-dim">Scanner des ports</span>')
          appendLine('<span class="term-dim">Exemples</span>')
          appendLine('  tcolor #111 #eee')
          appendLine('  encrypt bonjour le monde')
          appendLine('  decrypt 626f6e6a6f7572206c65206d6f6e6465')
          appendLine('  nmap -sV portfolio.local')
          break
        }
        case 'clear':
          body.innerHTML = ''
          break
        case 'whoami':
          appendLine('zuCorps')
          break
        case 'ls':
          appendLine('projects  contact  assets  README')
          break
        case 'pwd':
          appendLine('/home/zuCorps')
          break
        case 'tcolor': {
          const bg = args[0] || '#0a0a0a'
          const fg = args[1] || '#e7e7e7'
          const root = document.documentElement
          root.style.setProperty('--term-bg', bg)
          root.style.setProperty('--term-header-bg', bg)
          root.style.setProperty('--term-fg', fg)
          appendLine(`Terminal colors set. bg=${bg}, fg=${fg}`)
          break
        }
        case 'binary': {
          const s = args.join(' ') || 'zuCorps'
          const bin = Array.from(s).map(ch=>ch.charCodeAt(0).toString(2).padStart(8,'0')).join(' ')
          appendLine(bin)
          break
        }
        case 'encrypt': {
          const text = args.join(' ')
          if (!text) { appendLine('Usage: encrypt &lt;text&gt;'); break }
          const enc = new TextEncoder().encode(text)
          const out = Array.from(enc).map(b=>b.toString(16).padStart(2,'0')).join('')
          appendLine(out)
          break
        }
        case 'decrypt': {
          const hex = args.join('')
          if (!/^[0-9a-fA-F]+$/.test(hex)) { appendLine('Usage: decrypt &lt;hex&gt;'); break }
          const bytes = hex.match(/.{1,2}/g)?.map(h=>parseInt(h,16))||[]
          const dec = new TextDecoder().decode(new Uint8Array(bytes))
          appendLine(dec)
          break
        }
        case 'nmap': {
          const target = (args.find(a=>!a.startsWith('-')) || 'localhost')
          fakeNmap(target)
          return 'ASYNC'
        }
        default:
          if (name) appendLine(`${name}: command not found`)
      }
    }
    function fakeNmap(target) {
      appendLine('Starting Nmap 7.94')
      appendLine(`Nmap scan report for ${target} (127.0.0.1)`) 
      const prog = document.createElement('div')
      prog.className = 'term-line'
      body.appendChild(prog)
      let pct = 0
      const t0 = performance.now()
      const timer = setInterval(() => {
        pct = Math.min(100, pct + Math.max(3, Math.round(Math.random()*12)))
        const bars = Math.round(pct/4)
        const bar = `[${'#'.repeat(bars).padEnd(25,' ')}] ${pct}%`
        prog.textContent = bar
        body.scrollTop = body.scrollHeight
        if (pct >= 100) {
          clearInterval(timer)
          const ports = [
            '22/tcp   open   ssh        OpenSSH 9.3',
            '53/tcp   open   domain     dnsmasq 2.86',
            '80/tcp   open   http       nginx 1.24',
            '443/tcp  open   https      nginx 1.24',
            '3306/tcp open   mysql      MySQL 8.0',
            '6379/tcp open   redis      Redis 7.0'
          ]
          appendLine('PORT     STATE  SERVICE   VERSION')
          ports.forEach(p=>appendLine(p))
          const sec = ((performance.now()-t0)/1000).toFixed(2)
          appendLine(`Nmap done: 1 IP address (1 host up) scanned in ${sec}s`)
          promptLine()
        }
      }, 120)
    }
    appendLine('Type "help" to list commands.')
    promptLine()
  }
}

// scroll progress bar
const progress = document.getElementById('progress')
if (progress) {
  const update = () => {
    const doc = document.documentElement
    const h = doc.scrollHeight - doc.clientHeight
    const v = Math.max(0, Math.min(1, window.scrollY / (h || 1)))
    progress.style.width = `${v * 100}%`
  }
  update()
  window.addEventListener('scroll', update, { passive: true })
}

// command palette
const palette = document.getElementById('palette')
const paletteInput = document.getElementById('paletteInput')
const paletteList = document.getElementById('paletteList')
function openPalette() {
  if (!palette) return
  palette.classList.add('open')
  paletteInput && (paletteInput.value = '')
  paletteInput && paletteInput.focus()
}
function closePalette() {
  palette && palette.classList.remove('open')
}
window.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openPalette()
  } else if (e.key === 'Escape') {
    closePalette()
  }
})
if (palette) {
  palette.addEventListener('click', e => { if (e.target === palette) closePalette() })
}
if (paletteList) {
  const focusables = () => Array.from(document.querySelectorAll('#paletteInput, #paletteList li'))
  function onKey(e){
    if (!palette.classList.contains('open')) return
    if (e.key === 'Tab') {
      const els = focusables(); const first = els[0]; const last = els[els.length-1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }
  window.addEventListener('keydown', onKey)
  paletteList.addEventListener('click', e => {
    const li = e.target.closest('li')
    if (!li) return
    const action = li.getAttribute('data-action')
    switch (action) {
      case 'open-projects':
        location.href = './projects.html'; break
      case 'open-terminal':
        term?.classList.add('open'); break
      case 'term-dark': {
        const root = document.documentElement
        root.style.setProperty('--term-bg', '#0a0a0a')
        root.style.setProperty('--term-header-bg', '#0a0a0a')
        root.style.setProperty('--term-fg', '#e7e7e7')
        break
      }
      case 'term-light': {
        const root = document.documentElement
        root.style.setProperty('--term-bg', '#f6f6f6')
        root.style.setProperty('--term-header-bg', '#ececec')
        root.style.setProperty('--term-fg', '#111')
        break
      }
      case 'nmap':
        if (term && !term.classList.contains('open')) term.classList.add('open')
        const fake = document.createElement('div'); fake.className = 'term-line'; fake.textContent = 'nmap -sV localhost'
        document.getElementById('termBody')?.appendChild(fake)
        try { fakeNmap('localhost') } catch {}
        break
      case 'zugeo':
        location.href = './projects.html'; break
    }
    closePalette()
  })
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(()=>{})
  })
}

// projects filter/search
(function(){
  const search = document.getElementById('projectSearch')
  const chips = document.querySelectorAll('.filter-chip')
  const cards = document.querySelectorAll('.project-card')
  if (!search && !chips.length) return
  let active = 'all'
  function apply() {
    const q = (search?.value || '').toLowerCase().trim()
    cards.forEach(card => {
      const tags = (card.getAttribute('data-tags') || '').toLowerCase()
      const text = card.textContent.toLowerCase()
      const byTag = active === 'all' || tags.includes(active)
      const byText = !q || text.includes(q)
      card.style.display = byTag && byText ? '' : 'none'
    })
  }
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed','false'); c.setAttribute('aria-selected','false') })
    ch.classList.add('is-active')
    ch.setAttribute('aria-pressed','true')
    ch.setAttribute('aria-selected','true')
    active = ch.getAttribute('data-filter') || 'all'
    apply()
  }))
  search?.addEventListener('input', apply)
})()

// Three.js lazy init and pause on hidden
let threeCleanup = null
;(function(){
  const canvas = document.getElementById('bg')
  if (!canvas || !window.THREE) return
  const start = () => { /* already initialized earlier */ }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { start(); obs.disconnect() }
    })
  }, { rootMargin: '200px' })
  obs.observe(canvas)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { try { renderer?.setAnimationLoop(null) } catch {} }
    else { try { renderer?.setAnimationLoop(() => {}) } catch {} }
  })
})()

// motion/data-saver adjustments
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
const saveData = connection && connection.saveData
if (prefersReduced || saveData) {
  try { ScrollTrigger?.killAll?.() } catch {}
}

// hide terminal toggle on small screens
if (window.matchMedia('(max-width: 720px)').matches) {
  const tgl = document.getElementById('termToggle')
  if (tgl) tgl.style.display = 'none'
}

// back-to-top
(function(){
  const btn = document.getElementById('backTop')
  if (!btn) return
  const toggle = () => {
    if (window.scrollY > 400) btn.classList.add('show'); else btn.classList.remove('show')
  }
  toggle()
  window.addEventListener('scroll', toggle, { passive: true })
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
})()