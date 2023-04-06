let cr;
const container = document.getElementById('container');
const form = document.getElementById('form');
const focim = document.getElementById('focim');
let scoreboard;
let picdiv;

function goBack() {
  const meguntB = document.getElementById('meguntB');

  picdiv.style.opacity = '0';
  meguntB.style.opacity = '0';
  scoreboard.style.opacity = '0';

  form.style.display = 'block';

  setTimeout(() => {
    scoreboard.remove();
    picdiv.remove();
    meguntB.remove();
    focim.style.fontSize = '60px';
    focim.style.color = 'rgba(205, 1, 1, 0.778)';
    focim.style.textShadow = '2px 2px 2px #5f0000';

    form.style.opacity = '1';
  }, 500);

  document.body.style.backgroundImage = 'url(background.jpg)';
}

function updateCredit(win) {
  const currency = document.getElementById('currency').value;
  const nickname = document.getElementById('nickname').value;

  let coefficient;

  switch (currency) {
    case 'EUR':
      coefficient = 2;
      break;
    case 'USD':
      coefficient = 3;
      break;
    case 'RON':
      coefficient = 5;
      break;
    default:
      break;
  }

  if (win === 1) cr += coefficient * 5;
  else cr -= coefficient * 5;

  if (cr < coefficient * 5) {
    scoreboard.textContent = 'GAME OVER!';
    setTimeout(() => {
      goBack();
    }, 1500);
  } else scoreboard.textContent = `${nickname}'s credit: ${cr} ${currency}`;
}

function shuffleCards() {
  const cards = picdiv.children;
  const pirosInd = Math.floor(Math.random() * 3);
  for (let i = 0; i < 3; i++) {
    cards[i].id = 'black';
    const card = cards[i];
    card.style.width = '270px';
    card.style.filter = 'brightness(0.65)';
    setTimeout(() => {
      card.style.width = '250px';
      card.style.filter = 'brightness(1)';
    }, 650);
  }

  cards[pirosInd].id = 'piros';
}

function showPic(win) {
  const newdiv = document.createElement('div');
  const pic = document.createElement('img');

  container.appendChild(newdiv);
  newdiv.style.position = 'absolute';
  newdiv.style.top = '200px';

  if (win === 1) {
    pic.src = 'win.png';
  } else {
    pic.src = 'fail.png';
  }

  newdiv.appendChild(pic);

  setTimeout(() => {
    newdiv.remove();
  }, 1000);
}

function flipCard(event) {
  const clickedImage = event.target;
  const cards = document.getElementById('picdiv').children;

  let win;
  if (clickedImage.id === 'piros') {
    clickedImage.src = 'front_piros.png';
    win = 1;
    clickedImage.id = 'black';
  } else {
    clickedImage.src = 'front.png';
    win = 0;
  }
  updateCredit(win);
  showPic(win);

  for (let i = 0; i < 3; i++) {
    cards[i].removeEventListener('click', flipCard);
    setTimeout(() => {
      cards[i].addEventListener('click', flipCard);
    }, 2650); // timer till card is flipped back and cards are shuffled
  }

  setTimeout(() => {
    clickedImage.src = 'back.png';
    shuffleCards();
  }, 2000);
}

function addScoreBoard(nickname, currency) {
  scoreboard = document.createElement('div');
  cr = Number(document.getElementById('penz').value);

  scoreboard.id = 'scoreboard';
  scoreboard.textContent = `${nickname}'s credit: ${cr} ${currency}`;
  scoreboard.style.opacity = '0';

  container.appendChild(scoreboard);
}

function addPictureDiv() {
  picdiv = document.createElement('picdiv');
  picdiv.id = 'picdiv';
  picdiv.style.opacity = '0';
  container.appendChild(picdiv);
}

function addMeguntam() {
  const button = document.createElement('button');
  button.id = 'meguntB';
  button.textContent = 'Meguntam';

  button.style.opacity = '0';

  button.addEventListener('click', () => {
    goBack();
  });
  return button;
}

function StartGame(event) {
  event.preventDefault();
  const nickname = document.getElementById('nickname').value;
  const currency = document.getElementById('currency').value;

  focim.style.fontSize = '50px';
  focim.style.color = 'rgba(255, 255, 255, 0.888)';
  focim.style.textShadow = '2px 2px 2px #1d1b1b';
  document.body.style.backgroundImage = 'url(background2.jpg)';

  form.style.opacity = '0';

  addScoreBoard(nickname, currency);
  addPictureDiv();

  const n = 3;

  for (let i = 0; i < n; i++) {
    const image = document.createElement('img');
    image.src = 'back.png';
    image.className = 'kartya';
    image.addEventListener('click', flipCard);
    picdiv.appendChild(image);
  }

  shuffleCards();

  const meguntB = addMeguntam();
  container.appendChild(meguntB);

  setTimeout(() => {
    form.style.display = 'none';
    picdiv.style.opacity = '1';
    scoreboard.style.opacity = '1';
    meguntB.style.opacity = '1';
  }, 500);
}

const submit = document.getElementById('submit');

submit.addEventListener('click', StartGame);
