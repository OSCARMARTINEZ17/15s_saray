/****************************************************
 * URL DEL GOOGLE APPS SCRIPT
 ****************************************************/

const API_URL =
  "https://script.google.com/macros/s/AKfycbxxW-n3THaHD6JzgBUh47TBq0J8l1ITP5aV4chy5rYe5UVp-rP62yW2KpX9gQKR_eX5gQ/exec";

/****************************************************
 * ELEMENTOS
 ****************************************************/

const invitadosTable = document.getElementById("invitadosTable");

const confirmacionesTable = document.getElementById("confirmacionesTable");

const mensajesContainer = document.getElementById("mensajesContainer");

const totalInvitados = document.getElementById("totalInvitados");

const totalConfirmados = document.getElementById("totalConfirmados");

const totalPersonas = document.getElementById("totalPersonas");

const totalMensajes = document.getElementById("totalMensajes");

const loading = document.getElementById("loading");

const invitadosCounter = document.getElementById("invitadosCounter");

const confirmacionesCounter = document.getElementById("confirmacionesCounter");

const mensajesCounter = document.getElementById("mensajesCounter");

/****************************************************
 * CARGAR TODO
 ****************************************************/

async function cargarDatos() {
  mostrarLoading(true);

  try {
    const respuesta = await fetch(API_URL + "?action=todo");

    const datos = await respuesta.json();

    console.log("Datos recibidos:", datos);

    if (!datos.success) {
      throw new Error(datos.message || "Error obteniendo datos.");
    }

    mostrarInvitados(datos.invitados || []);

    mostrarConfirmaciones(datos.confirmaciones || []);

    mostrarMensajes(datos.mensajes || []);

    actualizarEstadisticas(datos);
  } catch (error) {
    console.error(error);

    alert("No se pudieron cargar los datos de Google Sheets.");
  }

  mostrarLoading(false);
}

/****************************************************
 * INVITADOS
 ****************************************************/

function mostrarInvitados(invitados) {
  invitadosTable.innerHTML = "";

  if (invitadosCounter) {
    invitadosCounter.textContent = `${invitados.length} registros`;
  }

  if (invitados.length === 0) {
    invitadosTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No hay invitados.
                </td>
            </tr>
            `;

    return;
  }

  invitados.forEach((invitado) => {
    const nombre = invitado[0] || "";

    const acompanantes = invitado[1] || "0";

    const para = invitado[2] || "";

    const linkFormula = invitado[3] || "";

    /*
     * Como Google Sheets devuelve
     * el texto de la fórmula, mostramos
     * un enlace generado directamente.
     */

    const url = crearLink(nombre, acompanantes, para);

    const fila = document.createElement("tr");

    fila.innerHTML = `
                <td>
                    ${escapeHTML(nombre)}
                </td>

                <td>
                    ${escapeHTML(acompanantes)}
                </td>

                <td>
                    ${escapeHTML(para)}
                </td>

                <td>
                    <a
                        href="${url}"
                        target="_blank"
                        class="link-button"
                    >
                        🔗 Ver invitación
                    </a>
                </td>
                `;

    invitadosTable.appendChild(fila);
  });
}

/****************************************************
 * CONFIRMACIONES
 ****************************************************/

function mostrarConfirmaciones(confirmaciones) {
  confirmacionesTable.innerHTML = "";

  if (confirmacionesCounter) {
    confirmacionesCounter.textContent = `${confirmaciones.length} registros`;
  }

  if (confirmaciones.length === 0) {
    confirmacionesTable.innerHTML = `
            <tr>
                <td colspan="4">
                    Todavía no hay confirmaciones.
                </td>
            </tr>
            `;

    return;
  }

  confirmaciones
    .slice()
    .reverse()
    .forEach((confirmacion) => {
      const fecha = confirmacion[0] || "";

      const nombre = confirmacion[1] || "";

      const acompanantes = confirmacion[2] || "0";

      const respuesta = (confirmacion[3] || "").toLowerCase();

      const asistira = respuesta === "si";

      const badge = asistira
        ? `<span class="badge confirmed">✓ Asistirá</span>`
        : `<span class="badge declined">✗ No asistirá</span>`;

      const fila = document.createElement("tr");

      fila.innerHTML = `
                    <td>
                        ${escapeHTML(fecha)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(nombre)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(acompanantes)}
                    </td>

                    <td>
                        ${badge}
                    </td>
                    `;

      confirmacionesTable.appendChild(fila);
    });
}

/****************************************************
 * MENSAJES
 ****************************************************/

function mostrarMensajes(mensajes) {
  mensajesContainer.innerHTML = "";

  if (mensajesCounter) {
    mensajesCounter.textContent = `${mensajes.length} mensajes`;
  }

  if (mensajes.length === 0) {
    mensajesContainer.innerHTML = `
            <p class="empty">
                Todavía no hay mensajes.
            </p>
            `;

    return;
  }

  mensajes
    .slice()
    .reverse()
    .forEach((mensaje) => {
      const fecha = mensaje[0] || "";

      const nombre = mensaje[1] || "Invitado";

      const texto = mensaje[2] || "";

      const card = document.createElement("div");

      card.className = "message";

      card.innerHTML = `
                    <div class="message-name">
                        ${escapeHTML(nombre)}
                    </div>

                    <div class="message-text">
                        ${escapeHTML(texto)}
                    </div>

                    <div class="message-date">
                        ${escapeHTML(fecha)}
                    </div>
                    `;

      mensajesContainer.appendChild(card);
    });
}

/****************************************************
 * ESTADÍSTICAS
 ****************************************************/

function actualizarEstadisticas(datos) {
  const invitados = datos.invitados || [];

  const confirmaciones = datos.confirmaciones || [];

  const mensajes = datos.mensajes || [];

  let personas = 0;

  invitados.forEach((invitado) => {
    const cantidad = parseInt(invitado[1]) || 0;

    personas += cantidad;
  });

  totalInvitados.textContent = invitados.length;

  totalConfirmados.textContent = confirmaciones.length;

  totalPersonas.textContent = personas;

  totalMensajes.textContent = mensajes.length;
}

/****************************************************
 * CREAR LINK
 ****************************************************/

function crearLink(nombre, acompanantes, para) {
  /*
     Importante: el parámetro debe llamarse "personas"
     porque así lo lee script.js en la página pública
     (params.get("personas")). Antes decía "acompanantes"
     y por eso la invitación siempre mostraba "1 persona".
     */

  return (
    "https://oscarmartinez17.github.io/" +
    "primera_comunion_saray/" +
    "?nombre=" +
    encodeURIComponent(nombre) +
    "&personas=" +
    encodeURIComponent(acompanantes) +
    "&para=" +
    encodeURIComponent(para)
  );
}

/****************************************************
 * ESCAPAR HTML
 ****************************************************/

function escapeHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/****************************************************
 * LOADING
 ****************************************************/

function mostrarLoading(mostrar) {
  if (!loading) {
    return;
  }

  loading.classList.toggle("show", mostrar);
}

/****************************************************
 * BOTÓN ACTUALIZAR
 ****************************************************/

const refreshButton = document.getElementById("refreshButton");

if (refreshButton) {
  refreshButton.addEventListener("click", cargarDatos);
}

/****************************************************
 * PESTAÑAS
 ****************************************************/

const tabs = document.querySelectorAll(".tab");

const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));

    panels.forEach((p) => p.classList.remove("active"));

    tab.classList.add("active");

    const panel = document.getElementById("panel-" + tab.dataset.tab);

    if (panel) {
      panel.classList.add("active");
    }
  });
});

/****************************************************
 * INICIAR
 ****************************************************/

cargarDatos();