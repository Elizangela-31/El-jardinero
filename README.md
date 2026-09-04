# EL JARDINERO — Sitio web con cotización de servicios y Firebase

Proyecto web para un negocio de mantenimiento de jardines: Inicio, Servicios,
Solicitud de cotización (agenda de visita técnica + método de pago
preferido), Contáctanos y Panel de administrador, conectado a **Firebase**
(Firestore + Authentication).

Este proyecto usa un **proyecto de Firebase nuevo y separado** del de
VIDA SPA — no comparten base de datos ni usuarios.

```
el-jardinero/
├── index.html          Inicio + Servicios + Contáctanos
├── carrito.html         Solicitud de cotización: agenda y pago
├── admin.html            Panel de administrador
├── app.js                 Catálogo de servicios, carrito, formulario de contacto
├── carrito.js              Lógica de la cotización (fecha, hora, pago, Firestore)
├── admin.js                 Login y listado de cotizaciones en tiempo real
├── firebase-config.js         Configuración central de Firebase (EDITAR AQUÍ)
├── estilos.css                 Estilos (diseño responsive)
├── logo.png                     Logo real de El Jardinero
└── README.md
```

> ⚠️ El "pago con tarjeta" es una **simulación visual** (no procesa cobros
> reales) y el precio mostrado en cada servicio es **referencial**: el
> monto final se confirma en la visita técnica.

---

## 1. Crear el proyecto en Firebase

1. Entra a **https://console.firebase.google.com**.
2. Clic en **"Agregar proyecto"** → nómbralo `el-jardinero` → continúa →
   **Crear proyecto**.
3. **Compilación → Firestore Database** → **Crear base de datos** → elige
   ubicación → **Iniciar en modo de producción**.
4. En **Firestore → Reglas**, pega esto:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /cotizaciones/{docId} {
         allow create: if true;
         allow read, update, delete: if request.auth != null;
       }
       match /mensajes/{docId} {
         allow create: if true;
         allow read, update, delete: if request.auth != null;
       }
     }
   }
   ```

   Clic en **Publicar**.

5. **Compilación → Authentication** → **Comenzar** → pestaña **Sign-in
   method** → habilita **Correo electrónico/contraseña**.
6. Pestaña **Users** → **Add user** → crea tu usuario administrador
   (correo + clave). Con esa cuenta entrarás a `admin.html`.
7. **⚙️ Configuración del proyecto** → baja hasta **"Tus apps"** → ícono
   `</>` (Web) → apodo `el-jardinero-web` → **Registrar app**.
8. Copia el objeto `firebaseConfig` que te muestra Firebase.

---

## 2. Conectar el proyecto en Visual Studio Code

1. Abre la carpeta `el-jardinero` en VS Code.
2. Abre `firebase-config.js` y reemplaza los valores de ejemplo por los
   que copiaste en el paso 8 (igual que hiciste con VIDA SPA, pero con
   los datos de este proyecto nuevo).
3. Guarda con Ctrl+S.
4. Con la extensión **Live Server** instalada, clic derecho sobre
   `index.html` → **Open with Live Server**.
5. Prueba: agrega un servicio, entra a la cotización, agenda fecha/hora,
   elige método de pago y confirma. Debe crearse un documento en
   Firestore → colección `cotizaciones`.
6. Entra a `admin.html`, inicia sesión y verifica que la solicitud
   aparezca en el panel.

---

## 3. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Proyecto El Jardinero inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/el-jardinero.git
git push -u origin main
```

Crea antes el repositorio vacío `el-jardinero` en GitHub (sin README),
igual que hiciste con `vida-spa`.

---

## 4. Publicar en Hostinger

Igual que VIDA SPA: sube todos los archivos sueltos de esta carpeta a
`public_html` (o a una subcarpeta si vas a alojar varios sitios en el
mismo hosting, ej. `public_html/eljardinero/`), desde **Archivos →
Administrador de archivos** en hPanel, o conectando el repositorio de
GitHub desde **Avanzado → Git**.

Recuerda activar el certificado **SSL gratuito** en **Seguridad → SSL**.

---

## 5. Fotos reales (pendiente)

Las imágenes de servicios y del hero usan placeholders por ahora
(`placehold.co`). Cuando el software esté probado y funcionando, se
pueden reemplazar por fotos reales de jardinería en `app.js` (arreglo
`servicios`) e `index.html` (imagen del hero), igual como se hizo con
VIDA SPA.
