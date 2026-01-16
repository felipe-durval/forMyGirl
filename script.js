// 05/04/2025 (05 de abril de 2025)
const datingDate = new Date(2025, 3, 5, 0, 0, 0);

function plural(n, singular, plural) {
  return n === 1 ? singular : plural;
}

// diferença por calendário (anos/meses/dias) + tempo do dia (hh:mm:ss)
function diffParts(from, to) {
  let ms = to - from;
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;

  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;

  const totalDays = Math.floor(totalHours / 24);

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  if (years < 0) {
    years = 0; months = 0; days = 0;
  }

  return { years, months, days, totalDays, hours, minutes, seconds };
}

function updateCounter() {
  const now = new Date();
  const p = diffParts(datingDate, now);

  // Topo (maior): anos, meses e dias
  const ymd =
    `${p.years} ${plural(p.years, "ano", "anos")}, ` +
    `${p.months} ${plural(p.months, "mês", "meses")}, ` +
    `${p.days} ${plural(p.days, "dia", "dias")}`;
  document.getElementById("ymd").textContent = ymd;

  // Abaixo: horas
  const clock =
    `${String(p.hours).padStart(2, "0")}:` +
    `${String(p.minutes).padStart(2, "0")}:` +
    `${String(p.seconds).padStart(2, "0")}`;
  document.getElementById("clock").textContent = clock;

  // Também mostrar os dias (total)
  const totalDays = `${p.totalDays} ${plural(p.totalDays, "dia", "dias")} no total`;
  document.getElementById("totalDays").textContent = totalDays;
}

updateCounter();
setInterval(updateCounter, 1000);

// ---------------- Carrossel (auto) ----------------
const track = document.getElementById("track");
const dotsWrap = document.getElementById("dots");
const btnPrev = document.querySelector(".prev");
const btnNext = document.querySelector(".next");
const viewport = document.getElementById("viewport");

const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];
const basePath = "img/";

let index = 0;
let autoplayTimer = null;
const AUTOPLAY_MS = 5200;

function buildSlides() {
  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  photos.forEach((file, i) => {
    const fig = document.createElement("figure");
    fig.className = "slide";

    const img = document.createElement("img");
    img.src = basePath + file;
    img.alt = `Foto ${i + 1}`;

    img.loading = "lazy";
    img.decoding = "async";

    img.width = 1080;
    img.height = 1920;

    fig.appendChild(img);
    track.appendChild(fig);
  });

  renderDots();
  goTo(0, true);
}

function renderDots() {
  dotsWrap.innerHTML = "";
  photos.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === index ? " active" : "");
    b.type = "button";
    b.ariaLabel = `Ir para a foto ${i + 1}`;
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
}

function goTo(i, skipTransition = false) {
  if (photos.length === 0) return;

  index = (i + photos.length) % photos.length;

  if (skipTransition) {
    track.style.transition = "none";
    track.style.transform = `translateX(-${index * 100}%)`;
    // força reflow para reativar a transition
    void track.offsetHeight;
    track.style.transition = "transform 380ms ease";
  } else {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  // atualiza dots
  Array.from(dotsWrap.children).forEach((dot, di) => {
    dot.classList.toggle("active", di === index);
  });
}

function next() { goTo(index + 1); }
function prev() { goTo(index - 1); }

btnNext.addEventListener("click", next);
btnPrev.addEventListener("click", prev);

// Swipe (mobile)
let startX = 0;
let isDown = false;

viewport.addEventListener("pointerdown", (e) => {
  if (photos.length <= 1) return;
  isDown = true;
  startX = e.clientX;
});

viewport.addEventListener("pointerup", (e) => {
  if (!isDown) return;
  isDown = false;

  const dx = e.clientX - startX;
  const threshold = 35;

  if (dx > threshold) prev();
  else if (dx < -threshold) next();
});

viewport.addEventListener("pointerleave", () => { isDown = false; });

// Autoplay (pausa ao passar o mouse / tocar)
function startAutoplay() {
  stopAutoplay();
  if (photos.length <= 1) return;
  autoplayTimer = setInterval(next, AUTOPLAY_MS);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

viewport.addEventListener("mouseenter", stopAutoplay);
viewport.addEventListener("mouseleave", startAutoplay);
viewport.addEventListener("touchstart", stopAutoplay, { passive: true });
viewport.addEventListener("touchend", startAutoplay);

buildSlides();
startAutoplay();
