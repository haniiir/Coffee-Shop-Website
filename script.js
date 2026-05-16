const navbar = document.getElementById("navbar");
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

const sections = ["home", "about", "skills", "projects", "experience", "education", "contact"];

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

document.querySelectorAll("[data-target]").forEach((el) => {
  el.addEventListener("click", () => {
    const target = el.getAttribute("data-target");
    if (target) {
      scrollToSection(target);
    }
  });
});

function updateNavbarState() {
  if (navbar) {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  let current = "home";

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i]);

    if (section && window.scrollY >= section.offsetTop - 120) {
      current = sections[i];
      break;
    }
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-target") === current);
  });
}

window.addEventListener("scroll", updateNavbarState);
window.addEventListener("load", updateNavbarState);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".skill-fill").forEach((fill) => {
          const width = fill.getAttribute("data-width");
          fill.style.width = width || "0%";
        });
      }
    });
  },
  { threshold: 0.25 }
);

document.querySelectorAll(".skill-card").forEach((card) => {
  skillObserver.observe(card);
});

const CONTACT_EMAIL = "riverahanylynd@gmail.com";
const FORM_SUBMIT_AJAX_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const FORM_SUBMIT_STANDARD_ENDPOINT = `https://formsubmit.co/${CONTACT_EMAIL}`;
const replyToField = document.getElementById("replyToField");
const contactSubmitFrame = document.getElementById("contactSubmitFrame");

function setFormStatus(message, type = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function setSubmitState(isSending) {
  if (!submitBtn) return;

  submitBtn.disabled = isSending;
  submitBtn.innerHTML = isSending
    ? `<span class="submit-text">Sending...</span>`
    : `<span class="submit-icon">➤</span><span class="submit-text">Send Message</span>`;
}

function showSuccessMessage() {
  if (!submitBtn || !contactForm) return;

  submitBtn.classList.add("sent");
  submitBtn.innerHTML = `<span class="submit-text">Message Sent! ✓</span>`;
  setFormStatus("Thank you! Your message has been sent to my email.", "success");
  contactForm.reset();

  setTimeout(() => {
    submitBtn.classList.remove("sent");
    setSubmitState(false);
  }, 3000);
}

function submitThroughHiddenFrame() {
  return new Promise((resolve) => {
    if (!contactForm || !contactSubmitFrame) {
      resolve();
      return;
    }

    let isResolved = false;
    const previousAction = contactForm.getAttribute("action");
    const previousTarget = contactForm.getAttribute("target");
    const previousMethod = contactForm.getAttribute("method");

    const finish = () => {
      if (isResolved) return;
      isResolved = true;
      clearTimeout(fallbackTimer);
      contactSubmitFrame.removeEventListener("load", finish);

      if (previousAction) contactForm.setAttribute("action", previousAction);
      if (previousTarget) contactForm.setAttribute("target", previousTarget);
      if (previousMethod) contactForm.setAttribute("method", previousMethod);

      resolve();
    };

    const fallbackTimer = setTimeout(finish, 4500);
    contactSubmitFrame.addEventListener("load", finish);

    contactForm.setAttribute("action", FORM_SUBMIT_STANDARD_ENDPOINT);
    contactForm.setAttribute("method", "POST");
    contactForm.setAttribute("target", "contactSubmitFrame");

    HTMLFormElement.prototype.submit.call(contactForm);
  });
}

async function submitWithAjax(formData) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(FORM_SUBMIT_AJAX_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("FormSubmit did not accept the AJAX request.");
    }
  } finally {
    clearTimeout(timeout);
  }
}

if (contactForm && submitBtn) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const senderEmail = String(formData.get("email") || "").trim();
    const honeyPot = String(formData.get("_honey") || "").trim();

    if (honeyPot) {
      contactForm.reset();
      return;
    }

    if (replyToField) {
      replyToField.value = senderEmail;
    }

    formData.set("_replyto", senderEmail);

    setSubmitState(true);
    setFormStatus("Sending your message...");

    try {
      await submitWithAjax(formData);
      showSuccessMessage();
    } catch (error) {
      try {
        await submitThroughHiddenFrame();
        showSuccessMessage();
      } catch (frameError) {
        setFormStatus(`Sorry, the message could not be sent. Please email me directly at ${CONTACT_EMAIL}.`, "error");
        setSubmitState(false);
      }
    }
  });
}
