import express from 'express';
import { join } from 'path';
import { appendFile, readFile } from 'fs';
import bodyParser from 'body-parser';

const app = express();

const staticdir = join(process.cwd(), 'public');

app.use(express.static(staticdir));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

let invalidmsg;

function validateTime(time) {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    invalidmsg = 'Bad time format!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

function validatePrice(price) {
  const numregex = /^\d+$/;

  if (!numregex.test(price)) {
    invalidmsg = 'Price should be numeric!';
    console.log(invalidmsg);
    return false;
  }

  const p = parseInt(price, 10);
  if (p < 0) {
    invalidmsg = 'Negative price was given!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

function validateTrain(from, to, day, time, price, type) {
  if (from === '' || to === '' || day === '' || time === '' || price === '' || type === '') {
    invalidmsg = 'Empty input field!';
    console.log(invalidmsg);
    return false;
  }
  if (type !== 'ir' && type !== 'r') {
    invalidmsg = 'Bad type was given';
    console.log(invalidmsg);
    return false;
  }
  const days = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];
  if (!days.includes(day.toLowerCase())) {
    invalidmsg = 'Bad day was given';
    console.log(invalidmsg);
    return false;
  }
  if (!validatePrice(price) || !validateTime(time)) return false;

  return true;
}

app.post('/add_train', (req, resp) => {
  // Beolvasom az adatokat a txt fileból
  readFile('train-info.txt', 'utf-8', (err, data) => {
    if (err) {
      console.log('<train_info.txt> file nem léteztett, de létrehoztuk');
    }

    let lastID = 0;
    if (data != null) {
      const lines = data.trim().split('\n');
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        lastID = parseInt(lastLine.split(' ')[0], 10);
      }
    }

    // generálom az új vonat ID-ját
    const newID = lastID + 1;

    // létrehozok egy új vonat objektumot
    const train = {
      id: newID,
      from: req.body.from,
      to: req.body.to,
      day: req.body.day,
      time: req.body.time,
      price: req.body.price,
      type: req.body.type,
    };

    if (validateTrain(train.from, train.to, train.day, train.time, train.price, train.type) === false) {
      resp.status(400).send(`Bad request! (incorrect input values)\n${invalidmsg}`);
      return;
    }

    //  kiírom az új vonat adatait a fileba
    const trainInfo = `${train.id} ${train.from} ${train.to} ${train.day} ${train.time} ${train.price} ${train.type}\n`;

    appendFile('train-info.txt', trainInfo, (err2) => {
      if (err2) {
        console.log('Hiba a vonat adatainak fileba való írásakor', err2);
        resp.status(500).send('Hiba a vonat adatainak fileba való írásakor');
      } else {
        const respBody = `A szerver megkapta és hozzáadta a vonatot a következő információkkal:
        ID: ${train.id}
        Indulás: ${train.from}
        Célállomás: ${train.to}
        Indulás időpontja: ${train.time}
        Jegy ára: ${train.price} ron
        Vonat típusa: ${train.type}`;
        console.log('Vonat hozzáadva!');
        resp.set('Content-Type', 'text/plain;charset=utf-8');
        resp.end(respBody);
      }
    });
  });
});

function validateSearchData(from, to, minprice, maxprice) {
  if (from === '' || to === '' || minprice === '' || maxprice === '') return false;
  if (!validatePrice(minprice) || !validatePrice(maxprice)) return false;
  const maxp = parseInt(maxprice, 10);
  const minp = parseInt(minprice, 10);
  if (maxp < minp) return false;
  return true;
}

app.post('/search_train', (req, resp) => {
  // Beolvasom az adatokat a txt fileból
  readFile('train-info.txt', 'utf-8', (err, data) => {
    if (err) {
      console.log('<train_info.txt> nem létezik');
      resp.status(405).send('Vonatok állomány nem létezik');
      return;
    }

    let { from } = req.body;
    let { to } = req.body;
    let { minprice } = req.body;
    let { maxprice } = req.body;

    if (validateSearchData(from, to, minprice, maxprice) === false) {
      resp.status(400).send('Bad request! (incorrect input values)');
      return;
    }
    from = from.toLowerCase();
    to = to.toLowerCase();
    minprice = parseInt(minprice, 10);
    maxprice = parseInt(maxprice, 10);

    const lines = data.trim().split('\n');

    let result = '';
    for (let i = 0; i < lines.length; i++) {
      const [, start, dest, , , prices] = lines[i].split(' ');
      const price = parseInt(prices, 10);

      if (start.toLowerCase() === from && dest.toLowerCase() === to && maxprice >= price && minprice <= price) {
        result += `${lines[i]}\n`;
      }
    }

    let respBody;
    if (result !== '') {
      respBody = `A keresés eredménye:\n${result}`;
    } else {
      respBody = 'Nincs a kersettnek megfelelő vonatjárat!';
    }

    resp.set('Content-Type', 'text/plain;charset=utf-8');
    resp.end(respBody);
  });
});

function validateId(id) {
  const numregex = /^\d+$/;

  if (!numregex.test(id)) {
    invalidmsg = 'id should be numeric!';
    console.log(invalidmsg);
    return false;
  }

  const id2 = parseInt(id, 10);
  if (id2 < 0) {
    invalidmsg = 'Negative id was given!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

app.post('/book_ticket', (req, resp) => {
  // Beolvasom az adatokat a txt fileból
  readFile('train-info.txt', 'utf-8', (err, data) => {
    if (err) {
      console.log('<train_info.txt> nem létezik');
      resp.status(405).send('Vonatok állomány nem létezik');
      return;
    }

    let { id } = req.body;

    if (!validateId(id)) {
      resp.status(400).send('Bad request! (incorrect id)');
      return;
    }

    id = parseInt(id, 10);

    let lastID = 0;
    if (data != null) {
      const lines = data.trim().split('\n');
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        lastID = parseInt(lastLine.split(' ')[0], 10);
      }
    }

    let respBody;

    if (id > lastID) {
      resp.set('Content-Type', 'text/plain;charset=utf-8');
      respBody = 'Nem létezik a megadott id-val rendelkező vonatjárat!';
      resp.end(respBody);
      return;
    }
    id = id.toString();
    appendFile('foglalasok.txt', `${id}\n`, (err2) => {
      if (err2) {
        console.log('Hiba a foglalás való írásakor', err2);
        resp.status(500).send('Hiba a foglalás fileba való írásakor');
      } else {
        respBody = 'Foglalás hozzáadva!';
        console.log('Foglalás hozzáadva!');
        resp.set('Content-Type', 'text/plain;charset=utf-8');
        resp.end(respBody);
      }
    });
  });
});

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
