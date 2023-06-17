import express from 'express';
import jwt from 'jsonwebtoken';
import {
  deleteReservationbyId,
  getJourneyDetailsById,
  getAllJourneys,
  getBookingsByJourneyId,
  insertReservation,
  insertTrain,
  getAllUsers,
  searchTrain,
  insertUser,
  checkIfUserExists,
  validateUserCredentials,
  validateAdminCredentials,
  getUsersBookingsByJourneyId,
} from '../db/db.js';
import { authenticateToken, secretKey, isAdminLoggedIn } from '../middleware/authToken.js';
import { validateTrain, validateSearchData, validateId, getInvalidMessage } from '../validation/validator.js';

const router = express.Router();

router.get('/', (req, res) => {
  //  megnezem ha adminkent vagyok-e bejelentkezve
  let admin;
  if (isAdminLoggedIn(req)) {
    admin = true;
  } else {
    admin = false;
  }

  // lekérem az összes vonatot az adatbázisból
  getAllJourneys()
    .then((result) => {
      res.render('search_results.ejs', { direct: result, admin });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post('/add_train', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(401);
    res.render('login.ejs', { problem: 'A folytatáshoz admin jog szügséges!' });
    return;
  }
  // létrehozok egy új vonat objektumot
  const train = {
    from: req.body.from,
    to: req.body.to,
    day: req.body.day,
    dtime: req.body.dtime,
    atime: req.body.atime,
    price: req.body.price,
    type: req.body.type,
  };

  if (validateTrain(train.from, train.to, train.day, train.dtime, train.atime, train.price, train.type) === false) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  const insertTrainParams = [train.from, train.to, train.day, train.dtime, train.atime, train.price, train.type];

  insertTrain(insertTrainParams)
    .then(() => {
      console.log(
        `Vonat hozzáadva: ${train.from} - ${train.to} ${train.day} ${train.dtime} ${train.atime} ${train.price} ${train.type}\n`,
      );
      res.redirect('/');
    })
    .catch((errmsg) => {
      console.error(errmsg);
      res.render('error.ejs', { message: 'Hiba a vonat hozzáadásakor!', problem: `${errmsg}` });
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
      const direct = result[0];
      const oneTransfer = result[1];
      const twoTransfer = result[2];
      console.log(oneTransfer);
      res.render('search_results.ejs', { direct, oneTransfer, twoTransfer });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post('/book_ticket/:journey_id', authenticateToken, (req, res) => {
  const journeyId = req.params.journey_id;
  const weekNum = req.body.week;
  const { role } = req.user;

  let username;

  if (role === 'admin') {
    username = req.body.username;
  } else {
    username = req.user.username;
  }

  if (!validateId(journeyId) || !username === '' || !validateId(weekNum)) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  insertReservation([journeyId, username, weekNum])
    .then(() => {
      res.redirect(`/booking_list/${journeyId}?message=success`);
    })
    .catch((err) => {
      console.error(err);
      res.redirect(`/booking_list/${journeyId}?message=error`);
    });
});

// foglalasok megtekintese egy jaratra
router.get('/booking_list/:journey_id', authenticateToken, (req, res) => {
  const journeyId = req.params.journey_id;
  const { role } = req.user;

  switch (role) {
    case 'admin':
      getBookingsByJourneyId(journeyId)
        .then((results) => {
          getAllUsers().then((users) => {
            res.render('booking_list.ejs', { journeyId, results, users, role });
          });
        })
        .catch((error) => {
          console.error(error);
        });
      break;
    case 'user':
      getUsersBookingsByJourneyId([req.user.username, journeyId])
        .then((results) => {
          res.render('booking_list.ejs', { journeyId, results, role });
        })
        .catch((error) => {
          console.error(error);
        });
      break;
    default:
      break;
  }
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

router.delete('/delete_reservation/:reservationId', authenticateToken, (req, res) => {
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

router.get('/loginpage', (req, res) => {
  res.render('login.ejs');
});

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let validCredentials = false;

    if (role === 'user') {
      const response = await validateUserCredentials([username, password]);
      if (response[0].resp === 1) {
        validCredentials = true;
      }
    } else if (role === 'admin') {
      const response = await validateAdminCredentials([username, password]);
      if (response[0].resp === 1) {
        validCredentials = true;
      }
    }

    if (!validCredentials) {
      res.render('login.ejs', { problem: 'Hibás felhasználónév vagy jelszó' });
    }

    const token = jwt.sign({ username, role }, secretKey, { expiresIn: '1h' });

    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500);
    res.render('error.ejs', { message: 'Server hiba!', problem: `${error}` });
  }
});

router.post('/register', (req, res) => {
  const { username } = req.body;
  const { password1 } = req.body;
  const { password2 } = req.body;
  checkIfUserExists(username).then((response) => {
    if (response[0]) {
      // megnezem hogy letezik-e mar az adott fehasznalo
      res.render('login.ejs', { problem: `${username} nevű felhasználó már létezik!` });
    } // megnezem ha a jelszavak egyeznek-e
    else if (password1 !== password2) {
      res.render('login.ejs', { problem: 'Kérem ugyanazt a jelszót adja meg' });
    } else {
      insertUser([username, password1])
        .then(() => {
          res.redirect('/loginpage');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

export default router;
