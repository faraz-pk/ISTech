document.addEventListener("DOMContentLoaded", function () {
  // Password toggle
  // Password toggle
  document.getElementById("pwToggle").addEventListener("click", function (e) {
    e.preventDefault();
    const pw = document.getElementById("password");
    pw.type = pw.type === "password" ? "text" : "password";
    this.textContent = pw.type === "password" ? "👁" : "🙈";
  });

  // Show alert function
  function showAlert(message, type = "error") {
    const alertContainer = document.getElementById("alertContainer");
    const alertText = document.getElementById("alertText");
    const alertIcon = document.getElementById("alertIcon");

    alertContainer.className = "alert-container " + type;
    alertText.textContent = message;
    alertIcon.textContent = type === "success" ? "✓" : "⚠️";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      alertContainer.classList.remove("success", "error");
    }, 5000);
  }

  // Clear field errors
  function clearFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId + "Error");
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  // Form submission
  document
    .getElementById("loginForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email");
      const password = document.getElementById("password");
      const emailErr = document.getElementById("emailError");
      const pwErr = document.getElementById("passwordError");

      let valid = true;

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        emailErr.textContent = "Please enter a valid email address.";
        email.classList.add("error");
        valid = false;
      } else {
        emailErr.textContent = "";
        email.classList.remove("error");
      }

      // Password validation
      if (password.value.length < 6) {
        pwErr.textContent = "Password must be at least 6 characters.";
        password.classList.add("error");
        valid = false;
      } else {
        pwErr.textContent = "";
        password.classList.remove("error");
      }

      if (!valid) {
        showAlert("Please fix the errors above", "error");
        return;
      }

      // Disable button and show loading state
      const btn = document.getElementById("loginBtn");
      const txt = document.getElementById("loginBtnText");
      const originalText = txt.textContent;
      btn.disabled = true;
      txt.textContent = "Logging in…";

      try {
        const response = await fetch("http://localhost:5001/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value.trim(),
            password: password.value,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store authentication data
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem(
            "userName",
            `${data.user.firstName} ${data.user.lastName}`,
          );

          showAlert("Login successful! Redirecting...", "success");

          // Redirect after short delay
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } else {
          // Handle specific error cases
          if (response.status === 401) {
            showAlert("Invalid email or password. Please try again.", "error");
            pwErr.textContent = "Invalid credentials";
            password.classList.add("error");
          } else if (response.status === 404) {
            showAlert("Account not found. Please sign up first.", "error");
            emailErr.textContent = "No account with this email";
            email.classList.add("error");
          } else {
            showAlert(
              data.message || "Login failed. Please try again.",
              "error",
            );
          }

          // Reset button
          btn.disabled = false;
          txt.textContent = originalText;
        }
      } catch (error) {
        console.error("Login error:", error);

        if (error instanceof TypeError) {
          showAlert("Network error. Please check your connection.", "error");
        } else {
          showAlert("An unexpected error occurred. Please try again.", "error");
        }

        // Reset button
        btn.disabled = false;
        txt.textContent = originalText;
      }
    });

  // Real-time field validation
  document.getElementById("email").addEventListener("blur", function () {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailErr = document.getElementById("emailError");

    if (this.value && !emailRegex.test(this.value.trim())) {
      emailErr.textContent = "Invalid email format";
      this.classList.add("error");
    } else {
      emailErr.textContent = "";
      this.classList.remove("error");
    }
  });

  document.getElementById("password").addEventListener("input", function () {
    const pwErr = document.getElementById("passwordError");
    if (this.value.length > 0 && this.value.length < 6) {
      pwErr.textContent = "Password too short";
      this.classList.add("error");
    } else {
      pwErr.textContent = "";
      this.classList.remove("error");
    }
  });

  // Social button placeholder
  document.querySelectorAll(".social-auth-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showAlert("Social login coming soon!", "error");
    });
  });
});
