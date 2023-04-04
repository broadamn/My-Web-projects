function flipCard(event) {
  const clickedImage = event.target;
  const imgname = clickedImage.src.split('/').pop();
  if (imgname === 'back.png') clickedImage.src = 'front.png';
  else clickedImage.src = 'back.png';
}

function addScoreBoard(cr, nickname, currency) {
  const scoreboard = document.createElement('div');

  scoreboard.id = 'scoreboard';
  scoreboard.textContent = `${nickname}'s credit: ${cr} ${currency}`;

  const container = document.getElementById('container');
  container.appendChild(scoreboard);
}

function addPictureDiv() {
  const newDiv = document.createElement('picdiv');
  newDiv.id = 'picdiv';
  newDiv.style.transition = 'opacity 0.5s ease-in-out';
  return newDiv;
}

function goBack() {
  const form = document.getElementById('form1');
  const focim = document.getElementById('focim');
  const meguntB = document.getElementById('meguntB');
  const picdiv = document.getElementById('picdiv');
  const scoreboard = document.getElementById('scoreboard');

  picdiv.style.opacity = '0';
  meguntB.style.opacity = '0';
  scoreboard.style.opacity = '0';

  setTimeout(() => {
    scoreboard.remove();
    picdiv.remove();
    meguntB.remove();
    focim.style.fontSize = '60px';
    focim.style.color = 'rgba(205, 1, 1, 0.778)';
    focim.style.textShadow = '2px 2px 2px #5f0000';
    form.style.display = 'block';
  }, 500);

  document.body.style.backgroundImage = 'url(background.jpg)';
}

function addMeguntam() {
  const button = document.createElement('button');
  button.id = 'meguntB';
  button.textContent = 'Meguntam';

  button.addEventListener('click', () => {
    goBack();
  });
  return button;
}

function StartGame(event) {
  event.preventDefault();
  const form = document.getElementById('form1');
  const focim = document.getElementById('focim');
  form.style.display = 'none';

  const container = document.getElementById('container');

  const cr = document.getElementById('penz').value;
  const nickname = document.getElementById('becenev').value;
  const currency = document.getElementById('currency').value;

  addScoreBoard(cr, nickname, currency);

  focim.style.fontSize = '50px';
  focim.style.color = 'rgba(255, 255, 255, 0.888)';
  focim.style.textShadow = '2px 2px 2px #1d1b1b';
  focim.style.transition = 'font-size 0.5s ease-in-out, color 0.5s ease-in-out';

  document.body.style.backgroundImage = 'url(background2.jpg)';

  const picdiv = addPictureDiv();
  container.appendChild(picdiv);

  const n = 3;
  for (let i = 0; i < n; i++) {
    const image = document.createElement('img');
    image.src = 'back.png';
    image.className = 'kartya';
    image.addEventListener('click', flipCard);
    picdiv.appendChild(image);
  }

  const meguntB = addMeguntam();
  container.appendChild(meguntB);
}

const submit = document.getElementById('submit');

submit.addEventListener('click', StartGame);
