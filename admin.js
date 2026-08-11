/****************************************************
 * URL DEL GOOGLE APPS SCRIPT
 ****************************************************/

const API_URL =
  "https://script.google.com/macros/s/AKfycbysMvmH_ztqKOVboNTRraouxwNiMYfZoFaaM72iuBr_DfteJ4t73okgcPrD9enB5BLM7g/exec";

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

      const respuesta = confirmacion[3] || "";

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
                        ✓ ${escapeHTML(respuesta)}
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

  if (mensajes.length === 0) {
    mensajesContainer.innerHTML = `
            <p>
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

      card.className = "message-card";

      card.innerHTML = `
                    <strong>
                        ${escapeHTML(nombre)}
                    </strong>

                    <small>
                        ${escapeHTML(fecha)}
                    </small>

                    <p>
                        ${escapeHTML(texto)}
                    </p>
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
  return (
    "https://oscarmartinez17.github.io/" +
    "primera_comunion_saray/" +
    "?nombre=" +
    encodeURIComponent(nombre) +
    "&acompanantes=" +
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

  loading.style.display = mostrar ? "block" : "none";
}

/****************************************************
 * BOTÓN ACTUALIZAR
 ****************************************************/

const refreshButton = document.getElementById("refreshButton");

if (refreshButton) {
  refreshButton.addEventListener("click", cargarDatos);
}

/****************************************************
 * INICIAR
 ****************************************************/

cargarDatos();