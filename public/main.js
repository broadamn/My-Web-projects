const priceInput = document.getElementById('price');
const from = document.getElementById('from');
const to = document.getElementById('to');
const time = document.getElementById('time');
const submitButton = document.getElementById('submit');
const minp = document.getElementById('min-price');
const maxp = document.getElementById('max-price');

function validateSubmit(event) {
  const obj = event.target;
  if (obj.value < 0 || obj.value === '') {
    obj.style.backgroundColor = '#f35050b2';
    obj.style.border = '2px solid red';
    submitButton.disabled = true;
  } else {
    obj.style.backgroundColor = '#eaeaea';
    obj.style.border = '2px solid black';
    submitButton.disabled = false;
  }
}

function validateTime(event) {
  const obj = event.target;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (obj.value < 0 || obj.value === '' || !timeRegex.test(obj.value)) {
    obj.style.backgroundColor = '#f35050b2';
    obj.style.border = '2px solid red';
    submitButton.disabled = true;
  } else {
    obj.style.backgroundColor = '#eaeaea';
    obj.style.border = '2px solid black';
    submitButton.disabled = false;
  }
}

function validatePrice(event) {
  const obj = event.target;

  if (obj.value === '') {
    obj.style.backgroundColor = '#f35050b2';
    obj.style.border = '2px solid red';
    submitButton.disabled = true;
  } else {
    const value = parseInt(obj.value, 10);
    if (value < 0) {
      obj.style.backgroundColor = '#f35050b2';
      obj.style.border = '2px solid red';
      submitButton.disabled = true;
    } else {
      obj.style.backgroundColor = '#eaeaea';
      obj.style.border = '2px solid black';
      submitButton.disabled = false;
    }
  }
}

from.addEventListener('input', validateSubmit);
to.addEventListener('input', validateSubmit);

if (time != null) {
  time.addEventListener('input', validateTime);
}

if (priceInput != null) {
  priceInput.addEventListener('input', validatePrice);
}

if (minp != null) {
  minp.addEventListener('input', validatePrice);
}
if (maxp != null) {
  maxp.addEventListener('input', validatePrice);
}