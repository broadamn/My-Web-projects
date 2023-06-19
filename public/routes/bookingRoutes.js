import express from 'express';
import {
  insertReservation,
  deleteReservationbyId,
  getBookingsByJourneyId,
  getUsersBookingsByJourneyId,
  getAllUsers,
} from '../db/db.js';
import { authenticateToken } from '../middleware/authToken.js';
import { validateId, getInvalidMessage } from '../validation/validator.js';

const router = express.Router();

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

export default router;
