const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 70);
  });
}, { threshold: 0.08 });
reveals.forEach(el => observer.observe(el));