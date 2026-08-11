/* =====================================================
   GOOGLE APPS SCRIPT
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbysMvmH_ztqKOVboNTRraouxwNiMYfZoFaaM72iuBr_DfteJ4t73okgcPrD9enB5BLM7g/exec";

/* =====================================================
   ELEMENTOS
===================================================== */

const totalInvitados = document.getElementById("totalInvitados");

const totalConfirmados = document.getElementById("totalConfirmados");

const totalNoAsisten = document.getElementById("totalNoAsisten");

const totalPersonas = document.getElementById("totalPersonas");

const invitadosCounter = document.getElementById("invitadosCounter");

const confirmacionesCounter = document.getElementById("confirmacionesCounter");

const mensajesCounter = document.getElementById("mensajesCounter");

const listaInvitados = document.getElementById("listaInvitados");

const listaConfirmaciones = document.getElementById("listaConfirmaciones");

const listaMensajes = document.getElementById("listaMensajes");

const refreshBtn = document.getElementById("refreshBtn");

const notification = document.getElementById("notification");

/* =====================================================
   CARGAR INFORMACIÓN
===================================================== */

async function cargarDatos() {
  try {
    refreshBtn.disabled = true;

    refreshBtn.textContent = "↻ Cargando...";

    const response = await fetch(API_URL + "?action=todo");

    if (!response.ok) {
      throw new Error("Error de conexión con Google.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Google Apps Script devolvió un error.");
    }

    mostrarInvitados(data.invitados || []);

    mostrarConfirmaciones(data.confirmaciones || []);

    mostrarMensajes(data.mensajes || []);

    actualizarEstadisticas(data);

    mostrarNotificacion("Información actualizada");
  } catch (error) {
    console.error(error);

    mostrarError(listaInvitados, error.message);

    mostrarError(listaConfirmaciones, error.message);

    mostrarError(listaMensajes, error.message);
  } finally {
    refreshBtn.disabled = false;

    refreshBtn.textContent = "↻ Actualizar";
  }
}

/* =====================================================
   INVITADOS
===================================================== */

function mostrarInvitados(invitados) {
  invitadosCounter.textContent = `${invitados.length} ${
    invitados.length === 1 ? "invitado" : "invitados"
  }`;

  if (!invitados.length) {
    listaInvitados.innerHTML = `
            <div class="empty">
                No hay invitados registrados.
            </div>
        `;

    return;
  }

  let html = `

        <table>

            <thead>

                <tr>

                    <th>
                        Nombre
                    </th>

                    <th>
                        Acompañantes
                    </th>

                    <th>
                        Para
                    </th>

                    <th>
                        Link
                    </th>

                </tr>

            </thead>

            <tbody>

    `;

  invitados.forEach((invitado) => {
    const nombre = invitado[0] || "";

    const acompanantes = Number(invitado[1]) || 0;

    const para = invitado[2] || "";

    const link = invitado[3] || "";

    html += `

                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(nombre)}
                        </strong>
                    </td>

                    <td>
                        ${acompanantes}
                    </td>

                    <td>
                        ${escapeHTML(para)}
                    </td>

                    <td>

                        ${
                          link
                            ? `
                            <a
                                href="${escapeAttribute(link)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Ver invitación →
                            </a>
                            `
                            : `
                            <span style="color:#aaa">
                                Sin link
                            </span>
                            `
                        }

                    </td>

                </tr>

            `;
  });

  html += `

            </tbody>

        </table>

    `;

  listaInvitados.innerHTML = html;
}

/* =====================================================
   CONFIRMACIONES
===================================================== */

function mostrarConfirmaciones(confirmaciones) {
  confirmacionesCounter.textContent = `${confirmaciones.length} ${
    confirmaciones.length === 1 ? "respuesta" : "respuestas"
  }`;

  if (!confirmaciones.length) {
    listaConfirmaciones.innerHTML = `
            <div class="empty">
                Todavía no hay confirmaciones.
            </div>
        `;

    return;
  }

  let html = `

        <table>

            <thead>

                <tr>

                    <th>
                        Fecha
                    </th>

                    <th>
                        Nombre
                    </th>

                    <th>
                        Acompañantes
                    </th>

                    <th>
                        Respuesta
                    </th>

                </tr>

            </thead>

            <tbody>

    `;

  confirmaciones
    .slice()
    .reverse()
    .forEach((confirmacion) => {
      const fecha = confirmacion[0] || "";

      const nombre = confirmacion[1] || "";

      const acompanantes = Number(confirmacion[2]) || 0;

      const respuesta = confirmacion[3] || "";

      const estado = obtenerEstado(respuesta);

      html += `

                    <tr>

                        <td>
                            ${escapeHTML(fecha)}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(nombre)}
                            </strong>
                        </td>

                        <td>
                            ${acompanantes}
                        </td>

                        <td>

                            <span
                                class="badge ${estado.clase}"
                            >
                                ${estado.icono}
                                ${escapeHTML(estado.texto)}
                            </span>

                        </td>

                    </tr>

                `;
    });

  html += `

            </tbody>

        </table>

    `;

  listaConfirmaciones.innerHTML = html;
}

/* =====================================================
   MENSAJES
===================================================== */

function mostrarMensajes(mensajes) {
  mensajesCounter.textContent = `${mensajes.length} ${
    mensajes.length === 1 ? "mensaje" : "mensajes"
  }`;

  if (!mensajes.length) {
    listaMensajes.innerHTML = `
            <div class="empty">
                Todavía no hay mensajes.
            </div>
        `;

    return;
  }

  let html = "";

  mensajes
    .slice()
    .reverse()
    .forEach((mensaje) => {
      const fecha = mensaje[0] || "";

      const nombre = mensaje[1] || "Invitado";

      const texto = mensaje[2] || "";

      html += `

                    <article class="message">

                        <div class="message-name">

                            ♡
                            ${escapeHTML(nombre)}

                        </div>


                        <div class="message-text">

                            ${escapeHTML(texto)}

                        </div>


                        <div class="message-date">

                            ${escapeHTML(fecha)}

                        </div>

                    </article>

                `;
    });

  listaMensajes.innerHTML = html;
}

/* =====================================================
   ESTADÍSTICAS
===================================================== */

function actualizarEstadisticas(data) {
  const invitados = data.invitados || [];

  const confirmaciones = data.confirmaciones || [];

  totalInvitados.textContent = invitados.length;

  let confirmados = 0;

  let noAsisten = 0;

  let personas = 0;

  confirmaciones.forEach((item) => {
    const respuesta = String(item[3] || "")
      .trim()
      .toLowerCase();

    const acompanantes = Number(item[2]) || 0;

    if (
      respuesta === "sí" ||
      respuesta === "si" ||
      respuesta === "confirmado" ||
      respuesta === "confirmada" ||
      respuesta.includes("confirm")
    ) {
      confirmados++;

      /*
       * Invitado principal
       * + acompañantes
       */

      personas += 1 + acompanantes;
    }

    if (
      respuesta === "no" ||
      respuesta.includes("no asistir") ||
      respuesta.includes("declin")
    ) {
      noAsisten++;
    }
  });

  totalConfirmados.textContent = confirmados;

  totalNoAsisten.textContent = noAsisten;

  totalPersonas.textContent = personas;
}

/* =====================================================
   ESTADO DE CONFIRMACIÓN
===================================================== */

function obtenerEstado(respuesta) {
  const valor = String(respuesta || "")
    .trim()
    .toLowerCase();

  if (valor === "sí" || valor === "si" || valor.includes("confirm")) {
    return {
      clase: "confirmed",

      icono: "✓",

      texto: "Confirmado",
    };
  }

  if (
    valor === "no" ||
    valor.includes("no asistir") ||
    valor.includes("declin")
  ) {
    return {
      clase: "declined",

      icono: "✕",

      texto: "No asistirá",
    };
  }

  return {
    clase: "pending",

    icono: "•",

    texto: respuesta || "Pendiente",
  };
}

/* =====================================================
   PESTAÑAS
===================================================== */

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const panel = tab.dataset.panel;

    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.remove("active");
    });

    document.querySelectorAll(".panel").forEach((item) => {
      item.classList.remove("active");
    });

    tab.classList.add("active");

    const panelElement = document.getElementById("panel-" + panel);

    if (panelElement) {
      panelElement.classList.add("active");
    }
  });
});

/* =====================================================
   BOTÓN ACTUALIZAR
===================================================== */

refreshBtn.addEventListener("click", cargarDatos);

/* =====================================================
   NOTIFICACIÓN
===================================================== */

let notificationTimer;

function mostrarNotificacion(mensaje) {
  notification.textContent = mensaje;

  notification.classList.add("show");

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(() => {
    notification.classList.remove("show");
  }, 2500);
}

/* =====================================================
   ERROR
===================================================== */

function mostrarError(elemento, mensaje) {
  elemento.innerHTML = `

        <div class="empty">

            <strong>
                No se pudieron cargar los datos.
            </strong>

            <br><br>

            ${escapeHTML(mensaje)}

        </div>

    `;
}

/* =====================================================
   SEGURIDAD HTML
===================================================== */

function escapeHTML(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

function escapeAttribute(texto) {
  return String(texto ?? "")
    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* =====================================================
   INICIAR
===================================================== */

cargarDatos();