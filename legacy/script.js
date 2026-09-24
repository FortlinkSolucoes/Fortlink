const EMAIL_TO = "contato@fortlinksolucoes.com.br";
const WHATSAPP_NUMBER = "554574008279";

const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

/* MENU MOBILE */

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

/* CARDS DE SERVIÇO */

document.querySelectorAll(".service-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const card = trigger.closest(".service-card");
    const isOpen = card.classList.toggle("open");

    trigger.setAttribute("aria-expanded", String(isOpen));
    trigger.querySelector(".plus").textContent = isOpen ? "-" : "+";
  });
});

/* FORMULÁRIO */

const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const whatsappButton = document.querySelector("#whatsappButton");

/* MONTA MENSAGEM WHATSAPP */

function buildWhatsAppLink(formData) {
  const text = [
    "Olá FortLink Soluções!",
    "",
    `Nome: ${formData.get("nome") || ""}`,
    `Empresa: ${formData.get("empresa") || ""}`,
    "",
    "Mensagem:",
    `${formData.get("mensagem") || ""}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* BOTÃO WHATSAPP */

if (whatsappButton && contactForm) {
  whatsappButton.addEventListener("click", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const whatsappLink = buildWhatsAppLink(formData);

    window.open(whatsappLink, "_blank");
  });
}

/* ENVIO POR E-MAIL */

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    const payload = {
      nome: formData.get("nome"),
      empresa: formData.get("empresa"),
      mensagem: formData.get("mensagem"),
    };

    const emailSubject = "Contato FortLink";

    const emailBody = [
      `Nome: ${payload.nome}`,
      `Empresa: ${payload.empresa}`,
      "",
      "Mensagem:",
      `${payload.mensagem}`,
    ].join("\n");

    const mailtoLink = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    formStatus.textContent = "Abrindo seu cliente de e-mail...";

    window.location.href = mailtoLink;

    contactForm.reset();
  });
}