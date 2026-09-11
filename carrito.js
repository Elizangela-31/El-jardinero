import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ================= CONFIGURACIÓN =================

const CART_KEY = "eljardinero_carrito";
const WHATSAPP = "593990000000";

const $ = id => document.getElementById(id);

const items = $("cart-items");
const empty = $("cart-empty");
const sumCount = $("sum-count");
const form = $("checkout-form");
const mensaje = $("checkout-message");
const confirmar = $("checkout-btn");
const cancelar = $("cancel-order-btn");
const locationText = $("location-text");

const citaFechaInput = $("cita-fecha");
const citaHoraSelect = $("cita-hora");
const citaPagoSelect = $("cita-pago");
const paymentPanelBox = $("payment-panel-box");


// ================= UBICACIÓN (MAPA) =================

let ubicacionSeleccionada = null; // { lat, lng, direccion }
let mapaDisponible = false;

try {

  if (typeof L === "undefined") {
    throw new Error("Leaflet no se cargó (revisa tu conexión o bloqueador de anuncios).");
  }

  const mapa = L.map("location-map").setView([-0.1807, -78.4678], 12); // Quito por defecto

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
  }).addTo(mapa);

  let marcador = null;

  const marcarUbicacion = (lat, lng, direccion) => {
    if (marcador) mapa.removeLayer(marcador);

    marcador = L.marker([lat, lng]).addTo(mapa);
    mapa.setView([lat, lng], 16);

    ubicacionSeleccionada = { lat, lng, direccion: direccion || `${lat.toFixed(5)}, ${lng.toFixed(5)}` };

    locationText.textContent = `📍 ${ubicacionSeleccionada.direccion}`;
  };

  mapa.on("click", async (e) => {
    const { lat, lng } = e.latlng;

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await resp.json();
      marcarUbicacion(lat, lng, data.display_name);
    } catch {
      marcarUbicacion(lat, lng, null);
    }
  });

  const geocoder = L.Control.Geocoder.nominatim();

  $("map-search").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const texto = e.target.value.trim();
    if (!texto) return;

    geocoder.geocode(texto, (resultados) => {
      if (!resultados.length) {
        alert("No se encontró esa dirección. Intenta ser más específico o marca el punto directamente en el mapa.");
        return;
      }

      const mejor = resultados[0];
      marcarUbicacion(mejor.center.lat, mejor.center.lng, mejor.name);
    });
  });

  mapaDisponible = true;

} catch (error) {
  console.error("No se pudo cargar el mapa:", error);
  locationText.textContent = "⚠️ El mapa no se pudo cargar. Escribe tu dirección igual, la anotaremos manualmente.";
}


// ================= FECHA MÍNIMA =================

function hoy() {
  return new Date().toISOString().split("T")[0];
}

if (citaFechaInput) citaFechaInput.min = hoy();

function fechaBonita(fecha) {
  if (!fecha) return "Por seleccionar";

  return new Date(`${fecha}T12:00:00`)
    .toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
}


// ================= CARRITO =================

const getCart = () =>
  JSON.parse(localStorage.getItem(CART_KEY)) || [];

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  render();
}


// ================= PANEL DE MÉTODO DE PAGO (ÚNICO PARA TODA LA SOLICITUD) =================

function paymentPanelHTML(metodo) {
  if (metodo === "efectivo") {
    return `
      <div class="payment-panel">
        <h4>💵 Pago en efectivo</h4>
        <p>Pagas directamente al equipo el día de la visita, una vez confirmado el precio final.</p>
      </div>
    `;
  }

  if (metodo === "transferencia") {
    return `
      <div class="payment-panel">
        <h4>🏦 Transferencia bancaria</h4>
        <div class="payment-line"><span>Banco</span><strong>Banco Pichincha</strong></div>
        <div class="payment-line"><span>Cuenta de ahorros</span><strong>N.º 2200XXXXXX</strong></div>
        <div class="payment-line"><span>A nombre de</span><strong>El Jardinero</strong></div>
        <small>Envía el comprobante por WhatsApp una vez confirmada la cotización.</small>
      </div>
    `;
  }

  return "";
}

function actualizarPanelPago() {
  paymentPanelBox.innerHTML = paymentPanelHTML(citaPagoSelect.value);
}

if (citaPagoSelect) {
  citaPagoSelect.addEventListener("change", actualizarPanelPago);
}


// ================= MOSTRAR CARRITO =================

function render() {
  const cart = getCart();

  items.innerHTML = "";

  empty.classList.toggle("hidden", cart.length > 0);

  confirmar.disabled = cart.length === 0;
  cancelar.disabled = cart.length === 0;


  cart.forEach((item, index) => {

    items.innerHTML += `

      <article class="checkout-item-card">

        <div class="checkout-item-top">

          <div>
            <span class="checkout-type">
              ${item.categoria || "Servicio"}
            </span>

            <h3>${item.nombre}</h3>

            <p>${item.descripcion || ""}</p>
          </div>

          <button
            class="cart-remove"
            data-index="${index}">
            Quitar
          </button>

        </div>

      </article>

    `;

  });


  eventos();
  sumCount.textContent = cart.length;
}


// ================= EVENTOS =================

function eventos() {

  document.querySelectorAll(".cart-remove").forEach(btn => {

    btn.onclick = () => {

      const cart = getCart();

      cart.splice(+btn.dataset.index, 1);

      saveCart(cart);
    };

  });

}


// ================= CANCELAR =================

cancelar.onclick = () => {

  if (!getCart().length) return;

  if (confirm("¿Deseas vaciar tu solicitud?")) {

    localStorage.removeItem(CART_KEY);

    location.href = "index.html#servicios";
  }

};


// ================= CONFIRMAR =================

confirmar.onclick = async () => {

  mensaje.textContent = "";

  const cart = getCart();


  if (!cart.length) {
    mensaje.textContent = "Todavía no has agregado servicios.";
    return;
  }


  const fecha = citaFechaInput.value;
  const hora = citaHoraSelect.value;
  const metodoPago = citaPagoSelect.value;


  if (!fecha || !hora) {

    mensaje.textContent =
      "Selecciona la fecha y el horario de la visita.";

    return;
  }


  if (!metodoPago) {

    mensaje.textContent =
      "Selecciona el método de pago.";

    return;
  }


  if (mapaDisponible && !ubicacionSeleccionada) {

    mensaje.textContent =
      "Marca la ubicación de tu jardín en el mapa.";

    return;
  }


  if (!form.checkValidity()) {

    mensaje.textContent =
      "Completa correctamente tus datos.";

    form.reportValidity();

    return;
  }


  const nombre = $("nombre").value.trim();
  const correo = $("correo").value.trim();
  const telefono = $("telefono").value.trim();


  confirmar.disabled = true;
  confirmar.textContent = "Guardando...";


  try {

    await addDoc(
      collection(db, "cotizaciones"),
      {
        nombre,
        correo,
        telefono,
        ubicacion: ubicacionSeleccionada,

        interes:
          cart.map(i => i.nombre).join(", "),

        servicios: cart,

        fecha,
        hora,
        metodoPago,

        estado: "pendiente",
        origen: "carrito",

        creadoEn:
          serverTimestamp()
      }
    );


    const detalle = cart.map((item, i) => `${i + 1}. ${item.nombre}`).join("\n");


    const mapsLink = ubicacionSeleccionada
      ? `https://www.google.com/maps?q=${ubicacionSeleccionada.lat},${ubicacionSeleccionada.lng}`
      : "no especificada";

    const texto = `
Hola El Jardinero.

Soy ${nombre}.

Quiero solicitar una cotización para:

${detalle}

Fecha de visita: ${fechaBonita(fecha)}
Hora: ${hora}
Método de pago: ${metodoPago}

Ubicación del jardín: ${ubicacionSeleccionada ? ubicacionSeleccionada.direccion : "no especificada"}
Ver en el mapa: ${mapsLink}

Teléfono: ${telefono}
Correo: ${correo}
    `;


    localStorage.removeItem(CART_KEY);


    location.href =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;


  } catch (error) {

    console.error(error);

    mensaje.textContent =
      "No se pudo guardar la solicitud.";

    confirmar.disabled = false;

    confirmar.textContent =
      "Solicitar cotización por WhatsApp";
  }

};


// ================= INICIO =================

render();