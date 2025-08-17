const yearEl = document.getElementById("year")
yearEl.textContent = new Date().getFullYear()

const header = document.querySelector(".site-header")
const menuBtn = header.querySelector(".menu")
menuBtn.addEventListener("click", () => header.classList.toggle("open"))

const overlay = document.querySelector(".transition")
const navLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    const hash = link.getAttribute("href")
    if (!hash || hash.length < 2) return
    const target = document.querySelector(hash)
    if (!target) return
    e.preventDefault()
    const y = target.getBoundingClientRect().top + window.pageYOffset - (header.offsetHeight + 12)
    const tl = gsap.timeline()
    tl.to(overlay, { scaleX: 1, transformOrigin: "left", duration: 0.35, ease: "power2.in" })
      .add(() => { window.scrollTo(0, y); header.classList.remove("open") })
      .to(overlay, { scaleX: 0, transformOrigin: "right", duration: 0.5, ease: "power2.out" })
  })
})

gsap.registerPlugin(ScrollTrigger)

gsap.from(".brand", { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" })
gsap.from(".nav a", { y: -20, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 })

gsap.from([".hero-inner h1", ".hero-inner h2", ".hero-inner p", ".hero .btn"], { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08 })

gsap.utils.toArray(".section").forEach(section => {
  if (section.id === "accueil") return
  const elements = section.querySelectorAll("h3, p, .skills, .grid, .contact-grid")
  if (!elements.length) return
  gsap.from(elements, { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: section, start: "top 72%" } })
})

ScrollTrigger.create({
  trigger: "#a-propos",
  start: "top 70%",
  once: true,
  onEnter: () => {
    document.querySelectorAll(".skills .fill").forEach(el => {
      const level = Number(el.dataset.level || 0)
      gsap.to(el, { width: level + "%", duration: 1.2, ease: "power3.out" })
    })
  }
})

gsap.utils.toArray(".project-card").forEach((card, i) => {
  gsap.from(card, { y: 30, opacity: 0, duration: 0.8, delay: i * 0.06, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%" } })
})

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom top",
  scrub: true,
  onUpdate: self => {
    const p = self.progress
    gsap.to(".hero-inner", { y: p * -60, ease: "none" })
  }
})

const canvas = document.getElementById("bg")
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 8)

const lightA = new THREE.PointLight(0x00f0ff, 1.3, 40)
lightA.position.set(4, 6, 8)
const lightB = new THREE.PointLight(0x7c4dff, 1.1, 40)
lightB.position.set(-4, -6, -6)
scene.add(lightA, lightB)

const group = new THREE.Group()
scene.add(group)

const geo = new THREE.IcosahedronGeometry(2.2, 2)
const mat = new THREE.MeshStandardMaterial({ color: 0x0b1120, metalness: 0.6, roughness: 0.3, emissive: 0x041c1e, emissiveIntensity: 0.6 })
const mesh = new THREE.Mesh(geo, mat)
const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.3 })
const wire = new THREE.Mesh(geo, wireMat)
group.add(mesh, wire)

const starCount = 1000
const positions = new Float32Array(starCount * 3)
for (let i = 0; i < starCount; i++) {
  const r = 28
  const x = (Math.random() - 0.5) * r
  const y = (Math.random() - 0.5) * r
  const z = (Math.random() - 0.5) * r
  positions[i * 3] = x
  positions[i * 3 + 1] = y
  positions[i * 3 + 2] = z
}
const starGeo = new THREE.BufferGeometry()
starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
const starMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.015, transparent: true, opacity: 0.7 })
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
  stars.rotation.y += 0.0008
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

const form = document.getElementById("contact-form")
form.addEventListener("submit", e => {
  e.preventDefault()
  const status = document.querySelector(".form-status")
  status.textContent = "Merci, votre message a été envoyé."
  gsap.fromTo(status, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" })
  form.reset()
})