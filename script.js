const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const colorButtons = document.querySelectorAll(".color-btn");

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const image = button.dataset.image;
    const alt = button.dataset.alt;

    if (!product || !image) return;

    const targetImage = document.getElementById(`productImage-${product}`);
    if (!targetImage) return;

    targetImage.src = image;
    if (alt) targetImage.alt = alt;

    const siblingButtons = document.querySelectorAll(`.color-btn[data-product="${product}"]`);
    siblingButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.menu;
    if (!target) return;

    menuTabs.forEach((btn) => btn.classList.remove("active"));
    menuPanels.forEach((panel) => panel.classList.remove("active"));

    tab.classList.add("active");
    const activePanel = document.getElementById(`menu-${target}`);
    if (activePanel) {
      activePanel.classList.add("active");
    }
  });
});