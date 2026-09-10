import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

export const CART_KEY = "eljardinero_carrito";


// ==========================================
// SERVICIOS
// ==========================================

export const servicios = [
  {
    id: "corte-cesped",
    nombre: "Corte de césped",
    categoria: "cesped",
    imagen: "https://placehold.co/700x520/3e7d32/f6f5ef?text=Corte+de+Cesped",
    descripcion: "Corte y perfilado del césped para un jardín parejo y prolijo."
  },
  {
    id: "poda-arboles",
    nombre: "Poda de árboles",
    categoria: "poda",
    imagen: "https://placehold.co/700x520/16321f/f6f5ef?text=Poda+de+Arboles",
    descripcion: "Poda de formación y sanitaria para árboles de todo tamaño."
  },
  {
    id: "poda-setos",
    nombre: "Poda de setos y cercas vivas",
    categoria: "poda",
    imagen: "https://placehold.co/700x520/8bc34a/16321f?text=Poda+de+Setos",
    descripcion: "Dar forma y mantener prolijos los setos y cercas vivas."
  },
  {
    id: "diseno-jardines",
    nombre: "Diseño y decoración de jardines",
    categoria: "diseno",
    imagen: "https://placehold.co/700x520/c9a227/16321f?text=Diseno+de+Jardin",
    descripcion: "Planificación y decoración de espacios verdes a la medida."
  },
  {
    id: "fumigacion-plagas",
    nombre: "Fumigación y control de plagas",
    categoria: "fumigacion-riego",
    imagen: "https://placehold.co/700x520/40916c/f6f5ef?text=Control+de+Plagas",
    descripcion: "Control de plagas e insectos que afectan plantas y césped."
  },
  {
    id: "fertilizacion",
    nombre: "Fertilización y abonado",
    categoria: "cesped",
    imagen: "https://placehold.co/700x520/d9ead0/16321f?text=Fertilizacion",
    descripcion: "Nutrición del suelo para un césped y plantas más saludables."
  },
  {
    id: "riego-aspersion",
    nombre: "Instalación de riego por aspersión",
    categoria: "fumigacion-riego",
    imagen: "https://placehold.co/700x520/3e7d32/f6f5ef?text=Riego+por+Aspersion",
    descripcion: "Diseño e instalación de sistemas de riego automático."
  },
  {
    id: "limpieza-jardin",
    nombre: "Limpieza y desmalezado general",
    categoria: "mantenimiento",
    imagen: "https://placehold.co/700x520/6f4518/f6f5ef?text=Limpieza+de+Jardin",
    descripcion: "Retiro de maleza, hojas y residuos para dejar el jardín limpio."
  },
  {
    id: "siembra-plantas",
    nombre: "Siembra de plantas ornamentales",
    categoria: "diseno",
    imagen: "https://placehold.co/700x520/8bc34a/16321f?text=Siembra+Ornamental",
    descripcion: "Selección y siembra de plantas ornamentales para tu jardín."
  },
  {
    id: "trasplante-arboles",
    nombre: "Trasplante de árboles y arbustos",
    categoria: "poda",
    imagen: "https://placehold.co/700x520/16321f/f6f5ef?text=Trasplante",
    descripcion: "Traslado seguro de árboles y arbustos a una nueva ubicación."
  },
  {
    id: "control-maleza",
    nombre: "Control de maleza",
    categoria: "cesped",
    imagen: "https://placehold.co/700x520/c9a227/16321f?text=Control+de+Maleza",
    descripcion: "Eliminación de maleza que compite con el césped y las plantas."
  },
  {
    id: "mantenimiento-mensual",
    nombre: "Plan de mantenimiento mensual",
    categoria: "mantenimiento",
    imagen: "https://placehold.co/700x520/16321f/f6f5ef?text=Mantenimiento+Mensual",
    descripcion: "Corte, poda ligera y limpieza mensual para mantener tu jardín siempre listo."
  }
];


// ==========================================
// CARRITO (SOLICITUD DE COTIZACIÓN)
// ==========================================

export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function updateCartCount() {
  const contador = $("#cart-count");
  if (contador) contador.textContent = getCart().length;
}

function addToCart(servicio) {
  const carrito = getCart();

  if (carrito.some(s => s.servicioId === servicio.id)) {
    alert(`"${servicio.nombre}" ya está en tu solicitud.`);
    return;
  }

  carrito.push({
    id: Date.now(),
    servicioId: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    categoria: servicio.categoria,
    fecha: "",
    hora: "",
    ubicacion: "",
    metodoPago: ""
  });

  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  updateCartCount();

  alert(`"${servicio.nombre}" agregado a tu solicitud 🌿`);
}


// ==========================================
// MOSTRAR SERVICIOS
// ==========================================

function showServices(lista = servicios) {
  const grid = $("#service-grid");
  if (!grid) return;

  grid.innerHTML = lista.map(s => `
    <article class="service-card" data-category="${s.categoria}" data-name="${s.nombre}">

      <div class="service-media">
        <img src="${s.imagen}" alt="${s.nombre}">
        <span class="badge badge-category">${s.categoria.replace("-", " y ")}</span>
      </div>

      <div class="service-body">
        <h3>${s.nombre}</h3>
        <p>${s.descripcion}</p>

        <div class="service-footer">
          <div class="service-actions">
            <button class="btn btn-primary btn-small add-btn" data-id="${s.id}">
              Agregar
            </button>
          </div>
        </div>
      </div>

    </article>
  `).join("");

  $("#service-empty")?.classList.toggle("hidden", lista.length > 0);
}


// ==========================================
// FILTRAR Y BUSCAR
// ==========================================

let categoria = "todos";

function filterServices() {
  const texto = ($("#service-search")?.value || "").toLowerCase();

  const filtrados = servicios.filter(s =>
    (categoria === "todos" || s.categoria === categoria) &&
    s.nombre.toLowerCase().includes(texto)
  );

  showServices(filtrados);
}

$$(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    categoria = btn.dataset.filter;

    $$(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    filterServices();
  };
});

$("#service-search")?.addEventListener("input", filterServices);


// ==========================================
// BOTÓN AGREGAR
// ==========================================

$("#service-grid")?.addEventListener("click", e => {
  const boton = e.target.closest(".add-btn");
  if (!boton) return;

  const servicio = servicios.find(s => s.id === boton.dataset.id);
  if (servicio) addToCart(servicio);
});


// ==========================================
// FORMULARIO DE CONTACTO
// ==========================================

const contactForm = $("#contact-form");
const contactResponse = $("#contact-response");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  contactResponse.classList.remove("error");

  if (!contactForm.checkValidity()) {
    contactResponse.textContent = "Completa todos los campos correctamente.";
    contactResponse.classList.add("error");
    contactForm.reportValidity();
    return;
  }

  const boton = contactForm.querySelector("button[type='submit']");
  boton.disabled = true;
  boton.textContent = "Enviando...";
  contactResponse.textContent = "";

  const nombre = $("#contact-nombre").value.trim();
  const correo = $("#contact-correo").value.trim();
  const telefono = $("#contact-telefono").value.trim();
  const mensaje = $("#contact-mensaje").value.trim();

  try {
    await addDoc(collection(db, "mensajes"), {
      nombre,
      correo,
      telefono,
      mensaje,
      estado: "pendiente",
      creadoEn: serverTimestamp()
    });

    contactResponse.textContent = "Mensaje enviado. Te contactaremos pronto.";
    contactForm.reset();
  } catch (error) {
    console.error(error);
    contactResponse.textContent = "No se pudo enviar el mensaje. Intenta de nuevo.";
    contactResponse.classList.add("error");
  } finally {
    boton.disabled = false;
    boton.textContent = "Enviar mensaje";
  }
});


// ==========================================
// MENÚ
// ==========================================

$(".menu-toggle")?.addEventListener("click", () => {
  $(".nav-links")?.classList.toggle("open");
});

$$(".nav-link").forEach(link => {
  link.onclick = () => {
    $(".nav-links")?.classList.remove("open");

    $$(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  };
});


// ==========================================
// INICIO
// ==========================================

showServices();
updateCartCount();