import express from 'express';
import {
  deleteReservationbyId,
  getJourneyDetailsById,
  getAllJourneys,
  getBookingsByJourneyId,
  insertReservation,
  insertTrain,
  getAllUsers,
  searchTrain,
} from '../db/db.js';
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

  const insertTrainParams = [train.from, train.to, train.day, train.time, train.price, train.type];

  insertTrain(insertTrainParams)
    .then(() => {
      console.log(
        `Vonat hozzáadva: ${train.from} - ${train.to} ${train.day} ${train.time} ${train.price} ${train.type}\n`,
      );
      resp.redirect('/');
    })
    .catch((errmsg) => {
      console.error(errmsg);
      resp.render('error.ejs', { message: 'Hiba a vonat hozzáadásakor!', problem: `${errmsg}` });
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

  if (minprice === '') minprice = 0;
  else minprice = parseInt(minprice, 10);

  if (maxprice === '') maxprice = Number.MAX_VALUE;
  else maxprice = parseInt(maxprice, 10);

  const searchTrainParams = [from, to, minprice, maxprice];

  searchTrain(searchTrainParams)
    .then((result) => {
      res.render('search_results.ejs', { results: result });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post('/book_ticket/:journey_id', (req, res) => {
  const journeyId = req.params.journey_id;
  const weekNum = req.body.week;
  const userId = req.body.user;

  if (!validateId(journeyId) || !validateId(userId) || !validateId(weekNum)) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  insertReservation([journeyId, userId, weekNum])
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
  getAllJourneys()
    .then((result) => {
      res.render('search_results.ejs', { results: result });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get('/booking_list/:journey_id', (req, res) => {
  const journeyId = req.params.journey_id;

  getBookingsByJourneyId(journeyId)
    .then((results) => {
      getAllUsers().then((users) => {
        res.render('booking_list.ejs', { journeyId, results, users });
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get('/journey_details/:journeyId', (req, res) => {
  const { journeyId } = req.params;

  getJourneyDetailsById(journeyId)
    .then((details) => {
      res.send(details[0]);
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
});

router.delete('/delete_reservation/:reservationId', (req, res) => {
  const { reservationId } = req.params;

  deleteReservationbyId(reservationId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
});

export default router;
