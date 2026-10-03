const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);


// ==========================================
// GALERÍA (CARRUSEL AUTOMÁTICO DE FOTOS)
// ==========================================

(function initGallery() {
  const carrusel = $("#gallery-carousel");
  if (!carrusel) return;

  const slides = Array.from(carrusel.querySelectorAll(".gallery-slide"));
  const dotsBox = $("#gallery-dots");
  const btnPrev = carrusel.querySelector(".gallery-prev");
  const btnNext = carrusel.querySelector(".gallery-next");

  let indice = 0;
  let temporizador = null;
  const INTERVALO = 4000;

  dotsBox.innerHTML = slides
    .map((_, i) => `<button class="gallery-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Ir a la foto ${i + 1}"></button>`)
    .join("");

  const dots = Array.from(dotsBox.querySelectorAll(".gallery-dot"));

  function mostrar(nuevoIndice) {
    slides[indice].classList.remove("active");
    dots[indice].classList.remove("active");

    indice = (nuevoIndice + slides.length) % slides.length;

    slides[indice].classList.add("active");
    dots[indice].classList.add("active");
  }

  function siguiente() {
    mostrar(indice + 1);
  }

  function iniciarAuto() {
    detenerAuto();
    temporizador = setInterval(siguiente, INTERVALO);
  }

  function detenerAuto() {
    if (temporizador) clearInterval(temporizador);
  }

  btnNext.onclick = () => {
    mostrar(indice + 1);
    iniciarAuto();
  };

  btnPrev.onclick = () => {
    mostrar(indice - 1);
    iniciarAuto();
  };

  dots.forEach(dot => {
    dot.onclick = () => {
      mostrar(+dot.dataset.index);
      iniciarAuto();
    };
  });

  carrusel.addEventListener("mouseenter", detenerAuto);
  carrusel.addEventListener("mouseleave", iniciarAuto);

  iniciarAuto();
})();


// ==========================================
// MENÚ
// ==========================================

$(".menu-toggle")?.addEventListener("click", () => {
  $(".nav-links")?.classList.toggle("open");
});

$$(".nav-link").forEach(link => {
  link.onclick = () => {
    $(".nav-links")?.classList.remove("open");
  };
});