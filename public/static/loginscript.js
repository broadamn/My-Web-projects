function hideProblemMessage() {
  const problemElement = document.querySelector('.problem');
  if (problemElement) {
    setTimeout(() => {
      problemElement.style.display = 'none';
    }, 5000);
  }
}

const password = document.getElementById('password');
const password1 = document.getElementById('password1');
const password2 = document.getElementById('password2');
const eye1 = document.getElementById('eyeicon1');
const eye2 = document.getElementById('eyeicon2');
const eye3 = document.getElementById('eyeicon3');

function showPassword(inputElement, eyeIcon) {
  if (inputElement.type === 'password') {
    inputElement.type = 'text';
    eyeIcon.src = '../pictures/eye-open.png';
  } else {
    inputElement.type = 'password';
    eyeIcon.src = '../pictures/eye-close.png';
  }
}

eye1.addEventListener('click', () => {
  showPassword(password, eye1);
});
eye2.addEventListener('click', () => {
  showPassword(password1, eye2);
});
eye3.addEventListener('click', () => {
  showPassword(password2, eye3);
});

// meghivom mikor az oldal betoltodik
window.onload = hideProblemMessage;
