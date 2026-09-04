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
const totalHTML = $("cart-total");
const sumCount = $("sum-count");
const form = $("checkout-form");
const mensaje = $("checkout-message");
const confirmar = $("checkout-btn");
const cancelar = $("cancel-order-btn");
const metodoPagoSelect = $("metodo-pago");
const paymentPanel = $("payment-panel");


// ================= CARRITO =================

const getCart = () =>
  JSON.parse(localStorage.getItem(CART_KEY)) || [];

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  render();
}

const money = n => `$${Number(n || 0).toFixed(2)}`;

function fechaBonita(fecha) {
  if (!fecha) return "Por seleccionar";

  return new Date(`${fecha}T12:00:00`)
    .toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
}

function hoy() {
  return new Date().toISOString().split("T")[0];
}


// ================= ACTUALIZAR ITEM =================

function actualizar(index, campo, valor) {
  const cart = getCart();
  const item = cart[index];

  if (!item) return;

  if (campo === "fecha") item.fecha = valor;
  if (campo === "hora") item.hora = valor;

  saveCart(cart);
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

            <p>${item.descripcion || ""} · ${item.duracion || ""}</p>
          </div>

          <button
            class="cart-remove"
            data-index="${index}">
            Quitar
          </button>

        </div>


        <div class="cart-edit-grid">

          <label class="cart-edit-field">
            <span>Fecha de visita</span>

            <input
              class="cart-date"
              data-index="${index}"
              type="date"
              min="${hoy()}"
              value="${item.fecha || ""}">
          </label>


          <label class="cart-edit-field">
            <span>Horario</span>

            <select
              class="cart-time"
              data-index="${index}">

              <option value="" ${!item.hora ? "selected" : ""}>Seleccione</option>
              <option value="08:00" ${item.hora === "08:00" ? "selected" : ""}>08:00 AM</option>
              <option value="09:00" ${item.hora === "09:00" ? "selected" : ""}>09:00 AM</option>
              <option value="10:00" ${item.hora === "10:00" ? "selected" : ""}>10:00 AM</option>
              <option value="11:00" ${item.hora === "11:00" ? "selected" : ""}>11:00 AM</option>
              <option value="13:00" ${item.hora === "13:00" ? "selected" : ""}>01:00 PM</option>
              <option value="14:00" ${item.hora === "14:00" ? "selected" : ""}>02:00 PM</option>
              <option value="15:00" ${item.hora === "15:00" ? "selected" : ""}>03:00 PM</option>
              <option value="16:00" ${item.hora === "16:00" ? "selected" : ""}>04:00 PM</option>
            </select>
          </label>

        </div>


        <div class="item-schedule-box">
          📅 ${fechaBonita(item.fecha)} · 🕒 ${item.hora ? item.hora : "Por seleccionar"}
        </div>


        <div class="item-total">
          <span>Precio referencial</span>
          <strong>Desde ${money(item.precio)}</strong>
        </div>

      </article>

    `;

  });


  eventos();
  totales(cart);
}


// ================= EVENTOS =================

function eventos() {

  document.querySelectorAll(".cart-date").forEach(input =>
    input.onchange = () =>
      actualizar(+input.dataset.index, "fecha", input.value)
  );


  document.querySelectorAll(".cart-time").forEach(select =>
    select.onchange = () =>
      actualizar(+select.dataset.index, "hora", select.value)
  );


  document.querySelectorAll(".cart-remove").forEach(btn => {

    btn.onclick = () => {

      const cart = getCart();

      cart.splice(+btn.dataset.index, 1);

      saveCart(cart);
    };

  });

}


// ================= TOTALES =================

function totales(cart) {

  const total = cart.reduce((s, item) => s + Number(item.precio || 0), 0);

  sumCount.textContent = cart.length;
  totalHTML.textContent = `Desde ${money(total)}`;
}


// ================= PANEL DE MÉTODO DE PAGO =================

function renderPaymentPanel(metodo) {

  if (!metodo) {
    paymentPanel.classList.add("hidden");
    paymentPanel.innerHTML = "";
    return;
  }

  paymentPanel.classList.remove("hidden");

  if (metodo === "efectivo") {
    paymentPanel.innerHTML = `
      <h4>💵 Pago en efectivo</h4>
      <p>Pagas directamente al equipo el día del trabajo, una vez confirmado el precio final.</p>
      <small>No se requiere ningún dato adicional.</small>
    `;
    return;
  }

  if (metodo === "transferencia") {
    paymentPanel.innerHTML = `
      <h4>🏦 Transferencia bancaria</h4>
      <div class="payment-line"><span>Banco</span><strong>Banco Pichincha</strong></div>
      <div class="payment-line"><span>Cuenta de ahorros</span><strong>N.º 2200XXXXXX</strong></div>
      <div class="payment-line"><span>A nombre de</span><strong>El Jardinero</strong></div>
      <div class="payment-line"><span>RUC</span><strong>1792XXXXXX001</strong></div>
      <small>Envía el comprobante por WhatsApp una vez confirmada la cotización.</small>
    `;
    return;
  }

  if (metodo === "tarjeta") {
    paymentPanel.innerHTML = `
      <h4>💳 Pago con tarjeta</h4>
      <p>Ingresa los datos de tu tarjeta para procesar el pago (simulado).</p>
      <div class="card-mock-grid">
        <input class="full" type="text" placeholder="Número de tarjeta" maxlength="19">
        <input type="text" placeholder="MM/AA" maxlength="5">
        <input type="text" placeholder="CVV" maxlength="3">
      </div>
      <small>Este es un formulario de demostración: no procesa pagos reales.
        Para cobros reales integra una pasarela como Stripe o PayPal.</small>
    `;
    return;
  }
}

metodoPagoSelect.addEventListener("change", () => {
  renderPaymentPanel(metodoPagoSelect.value);
});


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


  if (cart.some(item => !item.fecha || !item.hora)) {

    mensaje.textContent =
      "Selecciona fecha y horario de visita para todos los servicios.";

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
  const direccion = $("direccion").value.trim();
  const metodoPago = metodoPagoSelect.value;

  const totalEstimado =
    cart.reduce((s, item) => s + Number(item.precio || 0), 0);


  confirmar.disabled = true;
  confirmar.textContent = "Guardando...";


  try {

    await addDoc(
      collection(db, "cotizaciones"),
      {
        nombre,
        correo,
        telefono,
        direccion,
        metodoPago,

        interes:
          cart.map(i => i.nombre).join(", "),

        servicios: cart,
        totalEstimado,
        estado: "pendiente",
        origen: "carrito",

        creadoEn:
          serverTimestamp()
      }
    );


    const detalle = cart.map((item, i) => `

${i + 1}. ${item.nombre}
Fecha de visita: ${fechaBonita(item.fecha)}
Hora: ${item.hora}
Precio referencial: ${money(item.precio)}

    `).join("\n");


    const texto = `
Hola El Jardinero.

Soy ${nombre}.

Quiero solicitar una cotización para:

${detalle}

Dirección: ${direccion}
Método de pago preferido: ${metodoPago}

TOTAL ESTIMADO: ${money(totalEstimado)}

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
