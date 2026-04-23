
    // Social placeholder
    document.querySelectorAll('.social-auth-btn').forEach(btn => {
      btn.addEventListener('click', () => alert('Social sign-up coming soon!'));
    });

    // Password toggles
    function setupToggle(btnId, inputId) {
      document.getElementById(btnId).addEventListener('click', function() {
        const pw = document.getElementById(inputId);
        pw.type = pw.type === 'password' ? 'text' : 'password';
        this.textContent = pw.type === 'password' ? '👁' : '🙈';
      });
    }
    setupToggle('pwToggle1', 'signupPassword');
    setupToggle('pwToggle2', 'confirmPassword');

    // Password strength
    document.getElementById('signupPassword').addEventListener('input', function() {
      const val = this.value;
      const bar = document.getElementById('pwBar');
      const lbl = document.getElementById('pwStrengthLabel');
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      const colors = ['', '#e53935', '#ff9800', '#2196f3', '#4caf50'];
      const widths = ['0%', '25%', '50%', '75%', '100%'];

      bar.style.width = widths[score];
      bar.style.background = colors[score];
      lbl.textContent = val ? levels[score] || 'Weak' : 'Enter a password';
    });

    // Step navigation helpers
    function setStep(n) {
      [1, 2, 3].forEach(i => {
        document.getElementById(`step${i}`).classList.toggle('hidden', i !== n);
        document.getElementById(`step${i}dot`).classList.toggle('active', i <= n);
      });
    }

    // Step 1 validation
    document.getElementById('step1Next').addEventListener('click', () => {
      const fn = document.getElementById('firstName');
      const ln = document.getElementById('lastName');
      const em = document.getElementById('signupEmail');
      let ok = true;

      if (!fn.value.trim()) { document.getElementById('firstNameError').textContent = 'Required.'; fn.classList.add('error'); ok = false; }
      else { document.getElementById('firstNameError').textContent = ''; fn.classList.remove('error'); }

      if (!ln.value.trim()) { document.getElementById('lastNameError').textContent = 'Required.'; ln.classList.add('error'); ok = false; }
      else { document.getElementById('lastNameError').textContent = ''; ln.classList.remove('error'); }

      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(em.value.trim())) { document.getElementById('signupEmailError').textContent = 'Valid email required.'; em.classList.add('error'); ok = false; }
      else { document.getElementById('signupEmailError').textContent = ''; em.classList.remove('error'); }

      if (ok) setStep(2);
    });

    document.getElementById('step2Back').addEventListener('click', () => setStep(1));

    // Step 2 validation
    document.getElementById('step2Next').addEventListener('click', () => {
      const pw  = document.getElementById('signupPassword');
      const cpw = document.getElementById('confirmPassword');
      let ok = true;

      if (pw.value.length < 8) { document.getElementById('signupPasswordError').textContent = 'Min. 8 characters.'; pw.classList.add('error'); ok = false; }
      else { document.getElementById('signupPasswordError').textContent = ''; pw.classList.remove('error'); }

      if (cpw.value !== pw.value) { document.getElementById('confirmPasswordError').textContent = 'Passwords do not match.'; cpw.classList.add('error'); ok = false; }
      else { document.getElementById('confirmPasswordError').textContent = ''; cpw.classList.remove('error'); }

      if (ok) setStep(3);
    });

    document.getElementById('step3Back').addEventListener('click', () => setStep(2));

    // Final submit
// Final submit
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const terms = document.getElementById('terms');
  if (!terms.checked) {
    document.getElementById('termsError').textContent = 'You must agree to the terms.';
    return;
  }
  document.getElementById('termsError').textContent = '';

  const btn = document.getElementById('signupBtn');
  const txt = document.getElementById('signupBtnText');
  btn.disabled = true;
  txt.textContent = 'Creating account…';

  try {
    const response = await fetch('http://localhost:5001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        courseInterest: document.getElementById('courseInterest').value,
        learningMode: document.getElementById('learningMode').value,
        phone: document.getElementById('phone').value
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      document.querySelector('.auth-form').classList.add('hidden');
      document.querySelector('.step-indicator').classList.add('hidden');
      document.querySelector('.auth-divider').classList.add('hidden');
      document.querySelector('.social-auth').classList.add('hidden');
      document.querySelector('.auth-form-header').style.display = 'none';
      document.getElementById('signupSuccess').classList.remove('hidden');
    } else {
      alert('Error: ' + data.message);
      btn.disabled = false;
      txt.textContent = 'Create Account';
    }
  } catch (error) {
    alert('Error creating account: ' + error.message);
    btn.disabled = false;
    txt.textContent = 'Create Account';
  }
});