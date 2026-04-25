// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile nav
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Hero Switch Button
const heroSwitchBtn = document.getElementById('heroSwitchBtn');
const hero = document.getElementById('hero');
const coursesContent = document.getElementById('courses-content');
const servicesContent = document.getElementById('services-content');
const coursesVisual = document.getElementById('courses-visual');
const servicesVisual = document.getElementById('services-visual');

const HERO_MODE_KEY = 'istechHeroMode';
let isCoursesMode = true;

const statElements = {
  courses: {
    stat1: '15+',
    stat2: '2K+',
    stat3: '98%',
    label1: 'Courses',
    label2: 'Students',
    label3: 'Satisfaction'
  },
  services: {
    stat1: '50+',
    stat2: '100+',
    stat3: '99%',
    label1: 'Businesses',
    label2: 'Projects',
    label3: 'Uptime'
  }
};

function applyHeroMode() {
  if (isCoursesMode) {
    // Switch to Courses (Light mode)
    hero.classList.remove('dark-mode');
    coursesContent.classList.add('active');
    servicesContent.classList.remove('active');
    coursesVisual.classList.add('active');
    servicesVisual.classList.remove('active');
    heroSwitchBtn.dataset.category = 'courses';
    heroSwitchBtn.innerHTML = '<span class="switch-icon">⚙️</span><span class="switch-text">Switch to Services</span>';
    
    // Update stats
    document.getElementById('stat-1').textContent = statElements.courses.stat1;
    document.getElementById('stat-2').textContent = statElements.courses.stat2;
    document.getElementById('stat-3').textContent = statElements.courses.stat3;
    document.getElementById('stat-label-1').textContent = statElements.courses.label1;
    document.getElementById('stat-label-2').textContent = statElements.courses.label2;
    document.getElementById('stat-label-3').textContent = statElements.courses.label3;
  } else {
    // Switch to Services (Dark mode)
    hero.classList.add('dark-mode');
    servicesContent.classList.add('active');
    coursesContent.classList.remove('active');
    servicesVisual.classList.add('active');
    coursesVisual.classList.remove('active');
    heroSwitchBtn.dataset.category = 'services';
    heroSwitchBtn.innerHTML = '<span class="switch-icon">📚</span><span class="switch-text">Switch to Courses</span>';
    
    // Update stats
    document.getElementById('stat-1').textContent = statElements.services.stat1;
    document.getElementById('stat-2').textContent = statElements.services.stat2;
    document.getElementById('stat-3').textContent = statElements.services.stat3;
    document.getElementById('stat-label-1').textContent = statElements.services.label1;
    document.getElementById('stat-label-2').textContent = statElements.services.label2;
    document.getElementById('stat-label-3').textContent = statElements.services.label3;
  }

  try {
    localStorage.setItem(HERO_MODE_KEY, isCoursesMode ? 'courses' : 'services');
  } catch (_) {
    // Ignore storage errors and keep runtime behavior.
  }
}

try {
  const savedMode = localStorage.getItem(HERO_MODE_KEY);
  if (savedMode === 'services') {
    isCoursesMode = false;
  }
} catch (_) {
  // Ignore storage read errors and use default mode.
}

applyHeroMode();

heroSwitchBtn.addEventListener('click', () => {
  isCoursesMode = !isCoursesMode;
  applyHeroMode();
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));