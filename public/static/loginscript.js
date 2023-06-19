function hideProblemMessage() {
  const problemElement = document.querySelector('.problem');
  if (problemElement) {
    setTimeout(() => {
      problemElement.style.display = 'none';
    }, 5000);
  }
}

const passwordInput = document.getElementById('password');
const eye = document.getElementById('eyeicon');
function showPassword() {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eye.src = '../pictures/eye-open.png';
  } else {
    passwordInput.type = 'password';
    eye.src = '../pictures/eye-close.png';
  }
}

eye.addEventListener('click', showPassword);

// meghivom mikor az oldal betoltodik
window.onload = hideProblemMessage;
