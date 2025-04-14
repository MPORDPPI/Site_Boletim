const toggleButton = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");
const menuIcon = document.getElementById("menu-icon");
const closeIcon = document.getElementById("close-icon");

toggleButton.addEventListener("click", () => {
  navbar.classList.toggle("active");

  const isOpen = navbar.classList.contains("active");
  menuIcon.style.display = isOpen ? "none" : "inline";
  closeIcon.style.display = isOpen ? "inline" : "none";
});