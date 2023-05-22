const priceInput = document.getElementById('price');
const from = document.getElementById('from');
const to = document.getElementById('to');
const time = document.getElementById('time');
const submitButton = document.getElementById('submit');
const minp = document.getElementById('min-price');
const maxp = document.getElementById('max-price');
const id = document.getElementById('id');

function validateSubmit(event) {
  const obj = event.target;
  if (obj.value < 0 || obj.value === '' || obj.value.includes('|')) {
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

function validateNum(event) {
  const obj = event.target;
  const numregex = /^\d+$/;

  if (obj.value === '' || !numregex.test(obj.value)) {
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

if (from != null && to != null) {
  from.addEventListener('input', validateSubmit);
  to.addEventListener('input', validateSubmit);
}

if (time != null) {
  time.addEventListener('input', validateTime);
}

if (priceInput != null) {
  priceInput.addEventListener('input', validateNum);
}

if (minp != null) {
  minp.addEventListener('input', validateNum);
}
if (maxp != null) {
  maxp.addEventListener('input', validateNum);
}

if (id != null) {
  id.addEventListener('input', validateNum);
}

function fetchJourneyInfo(journeyId) {
  const infoElement = document.getElementById(`info-${journeyId}`);

  fetch(`/journey_info/${journeyId}`)
    .then((response) => response.text())
    .then((data) => {
      infoElement.innerHTML = data;
    })
    .catch((error) => {
      console.error(error);
    });
}
