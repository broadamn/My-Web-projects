import express from 'express';
import {
  getAllJourneys,
  getJourneyDetailsById,
  getBookingsByJourneyId,
  getUsersBookingsByJourneyId,
  searchTrain,
  getAllUsers,
} from '../db/db.js';
import { authenticateToken, isLoggedIn, getUsername } from '../middleware/authToken.js';
import { validateSearchData, getInvalidMessage } from '../validation/validator.js';

const router = express.Router();

router.get('/', (req, res) => {
  const role = isLoggedIn(req);
  const username = getUsername(req);

  getAllJourneys()
    .then((result) => {
      res.render('search_results.ejs', { direct: result, role, username });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).render('error.ejs', { message: 'Server Error', problem: error });
    });
});

router.get('/search_train', (req, res) => {
  let { from, to, minprice, maxprice } = req.query;

  if (validateSearchData(from, to, minprice, maxprice) === false) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  from = `%${from.toLowerCase()}%`;
  to = `%${to.toLowerCase()}%`;

  minprice = minprice === '' ? 0 : parseInt(minprice, 10);
  maxprice = maxprice === '' ? 2147483647 : parseInt(maxprice, 10);

  const searchTrainParams = [from, to, minprice, maxprice];

  searchTrain(searchTrainParams)
    .then((result) => {
      const direct = result[0];
      const oneTransfer = result[1];
      const twoTransfer = result[2];

      const role = isLoggedIn(req);
      const username = getUsername(req);
      res.render('search_results.ejs', { direct, oneTransfer, twoTransfer, role, username });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).render('error.ejs', { message: 'Server Error', problem: error });
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
      res.status(500).send('Server Error');
    });
});

router.get('/booking_list/:journey_id', authenticateToken, (req, res) => {
  const journeyId = req.params.journey_id;
  const { role, username } = req.user;

  switch (role) {
    case 'admin':
      getBookingsByJourneyId(journeyId)
        .then((results) => {
          getAllUsers().then((users) => {
            res.render('booking_list.ejs', { journeyId, results, users, role, username });
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('error.ejs', { message: 'Server Error', problem: error });
        });
      break;
    case 'user':
      getUsersBookingsByJourneyId([req.user.username, journeyId])
        .then((results) => {
          res.render('booking_list.ejs', { journeyId, results, role, username });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).render('error.ejs', { message: 'Server Error', problem: error });
        });
      break;
    default:
      res.redirect('/');
  }
});

export default router;
