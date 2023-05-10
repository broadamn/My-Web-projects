import express from 'express';
import * as path from 'path';
import { appendFile, readFile } from 'fs';
import bodyParser from 'body-parser';
import { initDb, executeQuery } from './public/db/db.js';

const app = express();
// const router = express.Router();

const staticdir = path.join(process.cwd(), 'public');

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), './public/views'));

app.use(express.static(staticdir));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

initDb()
  .then(() => {
    console.log('Adatbázis sikeresen létrehozva!');
  })
  .catch((err) => {
    console.error('Hiba az adatbázis létrehozásakor!', err);
  });

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

function validateType(type) {
  if (type !== 'ir' && type !== 'r') {
    invalidmsg = 'Bad type was given';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

function validateStops(from, to) {
  if (from.includes('|') || to.includes('|')) {
    invalidmsg = "City names cannot include '|' character";
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
  const days = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];
  if (!days.includes(day.toLowerCase())) {
    invalidmsg = 'Bad day was given';
    console.log(invalidmsg);
    return false;
  }
  if (!validateType(type) || !validateStops(from, to)) return false;
  if (!validatePrice(price) || !validateTime(time)) return false;

  return true;
}

app.post('/add_train', (req, resp) => {
  // létrehozok egy új vonat objektumot
  const train = {
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

  const insertTrainQuery =
    'INSERT INTO journey (origin, destination, day, departure_time, price, type) values (?, ?, ?, ?, ?, ?)';
  const insertTrainParams = [train.from, train.to, train.day, train.time, train.price, train.type];

  executeQuery(insertTrainQuery, insertTrainParams)
    .then(() => {
      console.log(
        `Vonat hozzáadva: ${train.from} ${train.to} ${train.day} ${train.time} ${train.price} ${train.type}\n`,
      );
      resp.redirect('/');
    })
    .catch((errmsg) => {
      console.error(errmsg);
    });
});

function validateSearchData(from, to, minprice, maxprice) {
  if (from === '' || to === '' || minprice === '' || maxprice === '') return false;
  if (from.includes('|') || to.includes('|')) return false;
  if (!validatePrice(minprice) || !validatePrice(maxprice)) return false;
  const maxp = parseInt(maxprice, 10);
  const minp = parseInt(minprice, 10);
  if (maxp < minp) return false;
  return true;
}

app.get('/search_train', (req, res) => {
  let { from } = req.query;
  let { to } = req.query;
  let { minprice } = req.query;
  let { maxprice } = req.query;

  if (validateSearchData(from, to, minprice, maxprice) === false) {
    res.status(400).send('Bad request! (incorrect input values)');
    return;
  }
  from = from.toLowerCase();
  to = to.toLowerCase();
  minprice = parseInt(minprice, 10);
  maxprice = parseInt(maxprice, 10);

  const searchTrainQuery = 'SELECT * FROM journey WHERE origin = ? AND destination = ? AND price >= ? AND price <= ?';
  const searchTrainParams = [from, to, minprice, maxprice];

  executeQuery(searchTrainQuery, searchTrainParams)
    .then((result) => {
      res.render('search_results.ejs', { results: result });
    })
    .catch((error) => {
      console.error(error);
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
        lastID = parseInt(lastLine.split('|')[0], 10);
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

app.get('/', (req, res) => {
  // lekérem az összes vonatot az adatbázisból
  const query = 'SELECT * FROM journey';
  executeQuery(query)
    .then((result) => {
      res.render('search_results.ejs', { results: result });
    })
    .catch((error) => {
      console.error(error);
    });
});

app.get('/booking_list/:journey_id', (req, res) => {
  const journeyId = req.params.journey_id;

  const query =
    'SELECT reservation_id, u.user_id, u.name FROM reservation AS r JOIN user AS U on u.user_id = r.user_id WHERE journey_id = ?';
  executeQuery(query, [journeyId])
    .then((results) => {
      executeQuery('SELECT * FROM user').then((users) => {
        res.render('booking_list.ejs', { journeyId, results, users });
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
