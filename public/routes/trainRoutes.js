import express from 'express';
import { insertTrain, deleteJourneybyId } from '../db/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateTrain, getInvalidMessage } from '../validation/validator.js';

const router = express.Router();

router.post('/add_train', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(401);
    res.render('login.ejs', { problem: 'Admin jogok szükségesek a folytatáshoz!' });
    return;
  }

  const train = {
    from: req.body.from,
    to: req.body.to,
    day: req.body.day,
    dtime: req.body.dtime,
    atime: req.body.atime,
    price: req.body.price,
    type: req.body.type,
  };

  if (!validateTrain(train.from, train.to, train.day, train.dtime, train.atime, train.price, train.type)) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  const insertTrainParams = [train.from, train.to, train.day, train.dtime, train.atime, train.price, train.type];

  insertTrain(insertTrainParams)
    .then(() => {
      console.log(
        `Vonat hozzáadva: ${train.from} - ${train.to} ${train.day} ${train.dtime} ${train.atime} ${train.price} ${train.type}`,
      );
      res.redirect('/');
    })
    .catch((errmsg) => {
      console.error(errmsg);
      res.render('error.ejs', { message: 'Hiba a vonat hozzáadása során!', problem: `${errmsg}` });
    });
});

router.delete('/delete_journey/:journeyId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(401);
    res.render('login.ejs', { problem: 'Admin jogok szükségesek ehhez a művelethez!' });
    return;
  }

  const { journeyId } = req.params;

  deleteJourneybyId(journeyId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
});

export default router;
