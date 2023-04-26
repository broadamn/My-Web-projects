const from = document.getElementById('from');
const to = document.getElementById('to');
const minp = document.getElementById('min-price');
const maxp = document.getElementById('max-price');
const submitButton = document.getElementById('search-button');

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

from.addEventListener('input', validateSubmit);
to.addEventListener('input', validateSubmit);
if (minp != null) {
  minp.addEventListener('input', validateSubmit);
}
if (maxp != null){
  maxp.addEventListener('input', validateSubmit);
}
