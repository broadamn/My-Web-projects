import express from 'express';
import { executeQuery } from '../db/db.js';
import { validateTrain, validateSearchData, validateId, getInvalidMessage } from '../validation/validator.js';

const router = express.Router();

router.post('/add_train', (req, resp) => {
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
    resp.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
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

router.get('/search_train', (req, res) => {
  let { from } = req.query;
  let { to } = req.query;
  let { minprice } = req.query;
  let { maxprice } = req.query;

  if (validateSearchData(from, to, minprice, maxprice) === false) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }
  from = `%${from.toLowerCase()}%`;
  to = `%${to.toLowerCase()}%`;
  minprice = parseInt(minprice, 10);
  maxprice = parseInt(maxprice, 10);

  const searchTrainQuery =
    'SELECT * FROM journey WHERE origin LIKE ? AND destination LIKE ? AND price >= ? AND price <= ?';
  const searchTrainParams = [from, to, minprice, maxprice];

  executeQuery(searchTrainQuery, searchTrainParams)
    .then((result) => {
      res.render('search_results.ejs', { results: result });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post('/book_ticket/:journey_id', (req, res) => {
  const journeyId = req.params.journey_id;
  const userId = req.body.user;

  if (!validateId(journeyId) || !validateId(userId)) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  executeQuery('INSERT INTO RESERVATION (journey_id, user_id) VALUES (?, ?)', [journeyId, userId])
    .then(() => {
      res.redirect(`/booking_list/${journeyId}?message=success`);
    })
    .catch((err) => {
      console.error(err);
      res.redirect(`/booking_list/${journeyId}?message=error`);
    });
});

router.get('/', (req, res) => {
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

router.get('/booking_list/:journey_id', (req, res) => {
  const journeyId = req.params.journey_id;

  const query =
    'SELECT reservation_id, u.user_id, u.name FROM reservation AS r JOIN user AS U on u.user_id = r.user_id WHERE journey_id = ? ORDER BY reservation_id';
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

export default router;
