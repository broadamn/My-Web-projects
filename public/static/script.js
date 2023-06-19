const priceInput = document.getElementById('price');
const from = document.getElementById('from');
const to = document.getElementById('to');
const dtime = document.getElementById('dtime');
const atime = document.getElementById('atime');
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

if (dtime != null) {
  dtime.addEventListener('input', validateTime);
}

if (atime != null) {
  atime.addEventListener('input', validateTime);
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

const journeyRows = document.querySelectorAll('.journey-row');

function rowClickHandler() {
  const row = this;
  const cellCount = row.children.length; // colspanhez
  const { journeyId } = row.dataset;
  const additionalInfoRow = row.nextElementSibling;
  const additionalInfoCell = additionalInfoRow.querySelector('.additional-info-cell');
  additionalInfoCell.setAttribute('colspan', cellCount); // colspanelek additional infohoz

  if (additionalInfoRow.classList.contains('hidden')) {
    additionalInfoRow.classList.add('visible');
    additionalInfoRow.classList.remove('hidden');

    fetch(`/journey_details/${journeyId}`)
      .then((response) => response.json())
      .then((data) => {
        const { price, type } = data;
        additionalInfoCell.textContent = `Jegy ára: ${price} Vonat típusa: ${type}`;
      })
      .catch((error) => {
        console.log('Hiba történt a járat információinak listázása során.');
        console.error(error);
      });
  } else {
    additionalInfoRow.classList.add('hidden');
    additionalInfoRow.classList.remove('visible');
    setTimeout(() => {
      additionalInfoCell.textContent = null;
    }, 500);
  }
}

// minden sorhoz hozzaadom az event listenert
journeyRows.forEach((row) => {
  row.addEventListener('click', rowClickHandler);
});

const deleteReservationButtons = document.querySelectorAll('.delete-res-button');
deleteReservationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { reservationId } = button.dataset;
    const reservationRow = button.parentElement.parentElement;

    fetch(`/delete_reservation/${reservationId}`, { method: 'DELETE' })
      .then((response) => {
        if (response.ok) {
          reservationRow.classList.add('hidden');
          setTimeout(() => {
            reservationRow.remove();
            alert('Foglalás sikeresen törölve!');
          }, 500);
        } else {
          console.log(response);
          alert('Hiba történt a foglalás törlése során.');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Hiba történt a foglalás törlése során.');
      });
  });
});

const deleteJourneyButtons = document.querySelectorAll('.delete-journey-button');
deleteJourneyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { journeyId } = button.dataset;
    const journeyRow = button.parentElement.parentElement;
    const additionalInfoRow = journeyRow.nextElementSibling;
    const additionalInfoCell = additionalInfoRow.querySelector('.additional-info-cell');

    fetch(`/delete_journey/${journeyId}`, { method: 'DELETE' })
      .then((response) => {
        if (response.ok) {
          journeyRow.classList.add('hidden');
          additionalInfoRow.classList.add('hidden');
          additionalInfoRow.classList.remove('visible');
          setTimeout(() => {
            additionalInfoCell.textContent = null;
          }, 500);
          setTimeout(() => {
            journeyRow.remove();
            alert('Járat sikeresen törölve!');
          }, 500);
        } else {
          alert('Hiba történt a járat törlése során.');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Hiba történt a járat törlése során.');
      });
  });
});

function toggleAddTrainForm() {
  const addTrainContainer = document.getElementById('add-train-container');
  addTrainContainer.classList.toggle('open');
  const searchTrainContainer = document.getElementById('search-train-container');

  searchTrainContainer.style.marginLeft = addTrainContainer.classList.contains('open') ? '28%' : '50%';

  // if (!addTrainContainer.classList.contains('open')) {
  //   // ha epp megy ki akkor fixed lesz
  //   addTrainContainer.style.position = 'fixed';
  // } else {
  //   setTimeout(() => {
  //     // ha bejott absolute, hogy gorduljon az oldallal
  //     addTrainContainer.style.position = 'absolute';
  //   }, 1000);
  // }
}

const addTrainB = document.getElementById('add-train-button');
if (addTrainB !== null) {
  addTrainB.addEventListener('click', toggleAddTrainForm);
}
