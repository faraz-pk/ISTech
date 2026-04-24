// Navbar scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

// Mobile nav
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

// Reveal on scroll
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

// Form validation & submission
const form = document.getElementById("contactForm");
const successEl = document.getElementById("formSuccess");

function validateField(id, errorId, msg) {
  const el = document.getElementById(id);
  const err = document.getElementById(errorId);
  if (!el.value.trim()) {
    err.textContent = msg;
    el.classList.add("error");
    return false;
  }
  err.textContent = "";
  el.classList.remove("error");
  return true;
}

function validateEmail(id, errorId) {
  const el = document.getElementById(id);
  const err = document.getElementById(errorId);
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(el.value.trim())) {
    err.textContent = "Please enter a valid email address.";
    el.classList.add("error");
    return false;
  }
  err.textContent = "";
  el.classList.remove("error");
  return true;
}

// Live validation on blur
document
  .getElementById("firstName")
  .addEventListener("blur", () =>
    validateField("firstName", "firstNameError", "First name is required."),
  );
document
  .getElementById("lastName")
  .addEventListener("blur", () =>
    validateField("lastName", "lastNameError", "Last name is required."),
  );
// Removed email validation
document
  .getElementById("subject")
  .addEventListener("blur", () =>
    validateField("subject", "subjectError", "Please select a subject."),
  );
document
  .getElementById("message")
  .addEventListener("blur", () =>
    validateField("message", "messageError", "Message is required."),
  );

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Check authentication
  if (!AuthManager.getToken()) {
    NotificationManager.show("Please log in to submit the contact form.", "warning");
    setTimeout(() => window.location.href = "login.html", 2000);
    return;
  }

  const v1 = validateField(
    "firstName",
    "firstNameError",
    "First name is required.",
  );
  const v2 = validateField(
    "lastName",
    "lastNameError",
    "Last name is required.",
  );
  // Removed email validation
  const v3 = validateField(
    "subject",
    "subjectError",
    "Please select a subject.",
  );
  const v4 = validateField("message", "messageError", "Message is required.");

  if (!v1 || !v2 || !v3 || !v4) return;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const user = AuthManager.getUser();
  const email = user ? user.email : '';
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  // Send subject separately so backend formats subject and message cleanly.
  const payload = {
    name: `${firstName} ${lastName}`.trim(),
    email,
    subject,
    message,
  };

  const btn = document.getElementById("submitBtn");
  const btnText = btn.querySelector("span");
  const originalText = btnText.textContent;

  btn.disabled = true;
  btnText.textContent = "Sending…";

  try {
    const response = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AuthManager.getToken()}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to send message");
    }

    form.style.display = "none";
    successEl.style.display = "flex";
    document.querySelector(".form-header").style.display = "none";
    NotificationManager.show("Message sent successfully!", "success");
  } catch (error) {
    NotificationManager.show(error.message || "Something went wrong while sending your message.", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = originalText;
  }
});

function resetForm() {
  form.reset();
  form.style.display = "block";
  successEl.style.display = "none";
  document.querySelector(".form-header").style.display = "block";
  const btn = document.getElementById("submitBtn");
  btn.disabled = false;
  btn.querySelector("span").textContent = "Send Message";
}
