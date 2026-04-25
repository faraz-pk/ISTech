const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () =>
  navbar.classList.toggle("scrolled", window.scrollY > 20),
);

document
  .getElementById("navToggle")
  .addEventListener("click", () =>
    document.getElementById("navLinks").classList.toggle("open"),
  );

// Billing toggle
let isYearly = false;
const toggle = document.getElementById("billingToggle");
const monthlyLabel = document.getElementById("monthlyLabel");
const yearlyLabel = document.getElementById("yearlyLabel");
const amounts = document.querySelectorAll(".pc-amount");

toggle.addEventListener("click", () => {
  isYearly = !isYearly;
  toggle.classList.toggle("active", isYearly);
  monthlyLabel.classList.toggle("dim", isYearly);
  yearlyLabel.classList.toggle("dim", !isYearly);
  amounts.forEach((el) => {
    el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
  });
});

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting)
        setTimeout(() => e.target.classList.add("visible"), i * 70);
    });
  },
  { threshold: 0.08 },
);
reveals.forEach((el) => observer.observe(el));

// Auth check for pricing buttons
document.querySelectorAll(".pc-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (!AuthManager.getToken()) {
      e.preventDefault();
      NotificationManager.show(
        "Please log in to access pricing plans.",
        "warning",
      );
      setTimeout(() => (window.location.href = "login.html"), 2000);
      return false;
    }
  });
});
