// Navbar scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

// Mobile nav
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Filter tabs
const filterTabs = document.querySelectorAll(".filter-tab");
const cards = document.querySelectorAll(".full-course-card");
const countEl = document.getElementById("courseCount");

if (countEl) {
  countEl.textContent = cards.length;
}

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const filter = tab.dataset.filter;
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.style.display = show ? "flex" : "none";
      if (show) visible++;
    });
    countEl.textContent = visible;
  });
});

// Reveal on scroll
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 60);
      }
    });
  },
  { threshold: 0.08 },
);
reveals.forEach((el) => observer.observe(el));
