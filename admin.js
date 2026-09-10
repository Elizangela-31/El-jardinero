import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const loginSection = document.getElementById("login-section");
const panelSection = document.getElementById("panel-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutButton = document.getElementById("logout-btn");
const solicitudesGrid = document.getElementById("solicitudes-grid");
const panelEmpty = document.getElementById("panel-empty");

let unsubscribeCotizaciones = null;

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const correo = document.getElementById("admin-correo").value.trim();
  const clave = document.getElementById("admin-clave").value;

  try {
    await signInWithEmailAndPassword(auth, correo, clave);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = "Correo o clave incorrectos.";
    loginError.classList.remove("hidden");
  }
});

logoutButton.addEventListener("click", () => {
  signOut(auth);
});

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function whatsappHref(data) {
  const telefonoLimpio = data.telefono.replace(/\D/g, "").replace(/^0/, "");
  const mensaje = `Hola ${data.nombre}, te escribo de El Jardinero por tu cotización de "${data.interes}".`;
  return `https://wa.me/593${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
}

function createSolicitudCard(id, data) {
  const card = document.createElement("article");
  card.className = "solicitud-card";
  if (data.estado === "contactado") {
    card.classList.add("contactado");
  }

  const estado = document.createElement("span");
  estado.className = "badge-estado";
  estado.textContent = data.estado;
  card.appendChild(estado);

  const nombre = document.createElement("h3");
  nombre.textContent = data.nombre;
  card.appendChild(nombre);

  const interes = document.createElement("p");
  interes.className = "solicitud-servicio";
  interes.textContent = data.interes;
  card.appendChild(interes);

  const contacto = document.createElement("p");
  contacto.className = "solicitud-meta";
  contacto.textContent = `${data.correo} · ${data.telefono}`;
  card.appendChild(contacto);

  const total = document.createElement("p");
  total.className = "solicitud-meta";
  total.textContent = `Total estimado: ${money(data.totalEstimado)}`;
  card.appendChild(total);

  (data.servicios || []).forEach((servicio) => {
    const detalle = document.createElement("p");
    detalle.className = "solicitud-meta";
    detalle.textContent = `${servicio.nombre} — ${servicio.ubicacion || "sin ubicación"} · ${servicio.metodoPago || "sin método de pago"}`;
    card.appendChild(detalle);
  });

  const fecha = document.createElement("p");
  fecha.className = "solicitud-fecha";
  fecha.textContent = data.creadoEn ? data.creadoEn.toDate().toLocaleString("es-EC") : "";
  card.appendChild(fecha);

  const actions = document.createElement("div");
  actions.className = "solicitud-actions";

  const whatsappLink = document.createElement("a");
  whatsappLink.className = "btn btn-whatsapp";
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.textContent = "Responder por WhatsApp";
  whatsappLink.href = whatsappHref(data);
  actions.appendChild(whatsappLink);

  const toggleButton = document.createElement("button");
  toggleButton.className = "btn btn-outline";
  toggleButton.type = "button";
  toggleButton.textContent = data.estado === "contactado" ? "Marcar pendiente" : "Marcar contactado";
  toggleButton.addEventListener("click", () => {
    const nuevoEstado = data.estado === "contactado" ? "pendiente" : "contactado";
    updateDoc(doc(db, "cotizaciones", id), { estado: nuevoEstado });
  });
  actions.appendChild(toggleButton);

  card.appendChild(actions);

  return card;
}

function subscribeCotizaciones() {
  const cotizacionesQuery = query(collection(db, "cotizaciones"), orderBy("creadoEn", "desc"));

  unsubscribeCotizaciones = onSnapshot(cotizacionesQuery, (snapshot) => {
    solicitudesGrid.innerHTML = "";
    panelEmpty.classList.toggle("hidden", !snapshot.empty);

    snapshot.forEach((docSnap) => {
      solicitudesGrid.appendChild(createSolicitudCard(docSnap.id, docSnap.data()));
    });
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("hidden");
    panelSection.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    subscribeCotizaciones();
    return;
  }

  loginSection.classList.remove("hidden");
  panelSection.classList.add("hidden");
  logoutButton.classList.add("hidden");

  if (unsubscribeCotizaciones) {
    unsubscribeCotizaciones();
    unsubscribeCotizaciones = null;
  }
});