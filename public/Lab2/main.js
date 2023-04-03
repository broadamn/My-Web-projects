function flipCard(event) {
  const clickedImage = event.target;
  const imgname = clickedImage.src.split('/').pop();
  if (imgname === 'back.png') clickedImage.src = 'front.png';
  else clickedImage.src = 'back.png';
}

function addScoreBoard() {
  const newDiv = document.createElement('div');

  newDiv.textContent = 'Your score:';
  newDiv.setAttribute('id', 'scoreboard');

  newDiv.style.margin = '20px';
  newDiv.style.alignSelf = 'center';

  const container = document.getElementById('container');
  container.appendChild(newDiv);
}

function addPictureDiv() {
  const newDiv = document.createElement('picdiv');
  newDiv.id = 'picdiv';

  const container = document.getElementById('container');
  container.appendChild(newDiv);

  return newDiv;
}

function StartGame(event) {
  event.preventDefault();
  const form = document.getElementById('form1');
  const focim = document.getElementById('focim');
  form.style.display = 'none';
  const container = document.getElementById('container');

  container.className = 'container';

  addScoreBoard();

  focim.style.fontSize = '45px';
  focim.style.color = 'rgba(255, 255, 255, 0.888)';
  focim.style.textShadow = '2px 2px 2px #1d1b1b';
  focim.style.transition = 'font-size 0.5s ease-in-out, color 0.5s ease-in-out';

  document.body.style.backgroundImage = 'url(background2.jpg)';
  document.body.style.transition = 'background-image 0.5s ease-in-out';
  document.body.style.backgroundSize = 'cover';

  const picdiv = addPictureDiv();

  const n = 3;
  for (let i = 0; i < n; i++) {
    const image = document.createElement('img');
    image.src = 'back.png';
    image.className = 'kartya';
    image.addEventListener('click', flipCard);
    picdiv.appendChild(image);
  }
}

const submit = document.getElementById('submit');

submit.addEventListener('click', StartGame);
