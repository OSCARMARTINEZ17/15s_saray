/* =====================================================
   CONFIGURACIÓN
===================================================== */

const CONFIG = {
  eventDate: "2026-09-12T19:00:00",

  locationUrl: "https://share.google/fcJIMk2EB2hEdWbi9",

  confirmationEndpoint:
    "https://script.google.com/macros/s/AKfycbxxW-n3THaHD6JzgBUh47TBq0J8l1ITP5aV4chy5rYe5UVp-rP62yW2KpX9gQKR_eX5gQ/exec",

  messageEndpoint:
    "https://script.google.com/macros/s/AKfycbxxW-n3THaHD6JzgBUh47TBq0J8l1ITP5aV4chy5rYe5UVp-rP62yW2KpX9gQKR_eX5gQ/exec",
};

const $ = (id) => document.getElementById(id);

/* =====================================================
   ABRIR INVITACIÓN
===================================================== */

const openInvitation = $("openInvitation");

const envelope = $("envelope");

if (openInvitation && envelope) {
  openInvitation.addEventListener("click", () => {
    envelope.style.opacity = "0";

    setTimeout(() => {
      envelope.remove();
    }, 900);

    const audio = $("audio");

    if (audio?.src) {
      audio.play().catch(() => {});
    }
  });
}

/* =====================================================
   CUENTA REGRESIVA
===================================================== */

function updateCountdown() {
  const distance = new Date(CONFIG.eventDate).getTime() - Date.now();

  if (distance <= 0) {
    $("days").textContent = "0";

    $("hours").textContent = "0";

    $("minutes").textContent = "0";

    $("seconds").textContent = "0";

    return;
  }

  $("days").textContent = Math.floor(distance / 86400000);

  $("hours").textContent = Math.floor(distance / 3600000) % 24;

  $("minutes").textContent = Math.floor(distance / 60000) % 60;

  $("seconds").textContent = Math.floor(distance / 1000) % 60;
}

updateCountdown();

setInterval(updateCountdown, 1000);

/* =====================================================
   INVITACIÓN PERSONALIZADA
===================================================== */

const params = new URLSearchParams(window.location.search);

const guestName = params.get("nombre");

const guestPeople = params.get("personas") || "1";

function renderConfirmation() {
  const section = $("confirmacion");

  if (!section) return;

  /*
       Si no existe nombre en la URL
    */

  if (!guestName) {
    section.innerHTML = `

            <h2 class="section-title">
                Confirmación de asistencia
            </h2>

            <div class="confirm-card">

                <p class="inv-text">

                    Queremos contar contigo
                    en la celebración de los
                    15 Años de Saray.

                </p>

                <p class="inv-text">

                    <strong>
                        Esta invitación es personalizada.
                    </strong>

                    <br>

                    El nombre del invitado aparecerá
                    cuando abras tu enlace.

                </p>

            </div>

        `;

    return;
  }

  /*
       Guardamos la respuesta
       en el navegador
    */

  const key = "saray_confirm_" + encodeURIComponent(guestName);

  const previous = localStorage.getItem(key);

  if (previous) {
    section.innerHTML = `

            <h2 class="section-title">

                ${previous === "si" ? "¡Nos vemos!" : "Gracias por avisarnos"}

            </h2>


            <div class="confirm-card">

                <p class="inv-name">

                    ${guestName}

                </p>


                <p class="inv-text">

                    ${
                      previous === "si"
                        ? "Tu asistencia ya está confirmada. Saray te espera con mucho cariño."
                        : "Ya registramos que no podrás acompañarnos. Gracias por avisarnos."
                    }

                </p>

            </div>

        `;

    return;
  }

  section.innerHTML = `

        <h2 class="section-title">

            Confirmación de asistencia

        </h2>


        <div class="confirm-card">

            <p class="inv-name">

                Hola, ${guestName}

            </p>


            <p class="inv-text">

                Esta invitación es para

                <strong>

                    ${guestPeople}

                    ${guestPeople == 1 ? " persona" : " personas"}

                </strong>

                <br>

                ¿Nos acompañas
                en este día tan especial?

            </p>


            <div class="inv-btns">

                <button
                    onclick="confirmarPersonalizado('si')"
                >

                    🤍 Sí, asistiré

                </button>


                <button
                    class="inv-btn-no"
                    onclick="confirmarPersonalizado('no')"
                >

                    No podré asistir

                </button>

            </div>

        </div>

    `;
}

renderConfirmation();

/* =====================================================
   CONFIRMAR ASISTENCIA
===================================================== */

window.confirmarPersonalizado = function (respuesta) {
  const name = guestName || "Invitado";

  const people = guestPeople || "1";

  const key = "saray_confirm_" + encodeURIComponent(name);

  localStorage.setItem(key, respuesta);

  /*
           Enviar a Google Apps Script
        */

  fetch(
    `${CONFIG.confirmationEndpoint}` +
      `?accion=confirmar` +
      `&nombre=${encodeURIComponent(name)}` +
      `&personas=${people}` +
      `&respuesta=${respuesta}` +
      `&para=saray`,
  ).catch(() => {});

  renderConfirmation();
};

/* =====================================================
   CONTADOR DE MENSAJES
===================================================== */

const textarea = $("muro-mensaje");

if (textarea) {
  textarea.addEventListener("input", () => {
    $("muro-chars").textContent = textarea.value.length;
  });
}

/* =====================================================
   ENVIAR MENSAJE
===================================================== */

window.enviarMensaje = function () {
  const name = $("muro-nombre").value.trim();

  const message = $("muro-mensaje").value.trim();

  const status = $("messageStatus");

  if (!name || !message) {
    status.textContent = "Por favor completa tu nombre y mensaje.";

    return;
  }

  /*
           Enviar a Google Apps Script
        */

  fetch(
    `${CONFIG.messageEndpoint}` +
      `?accion=mensaje` +
      `&nombre=${encodeURIComponent(name)}` +
      `&mensaje=${encodeURIComponent(message)}`,
  ).catch(() => {});

  $("muro-nombre").value = "";

  $("muro-mensaje").value = "";

  $("muro-chars").textContent = "0";

  status.textContent = "¡Mensaje enviado! 💌";
};

/* =====================================================
   ANIMACIONES AL HACER SCROLL
===================================================== */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },

  {
    threshold: 0.12,
  },
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => observer.observe(element));