import express from 'express';
import { getAllJourneys, getJourneyDetailsById, searchTrain } from '../db/db.js';
import { isLoggedIn, getUsername } from '../middleware/authMiddleware.js';
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
  const { type, day } = req.query;

  if (validateSearchData(from, to, minprice, maxprice, type, day) === false) {
    res.render('error.ejs', { message: 'Bad request! (incorrect input values)', problem: `${getInvalidMessage()}` });
    return;
  }

  from = `%${from.toLowerCase()}%`;
  to = `%${to.toLowerCase()}%`;

  minprice = minprice === '' || typeof minprice === 'undefined' ? 0 : parseInt(minprice, 10);
  maxprice = maxprice === '' || typeof maxprice === 'undefined' ? 2147483647 : parseInt(maxprice, 10);

  const searchTrainParams = [from, to, minprice, maxprice, type, day];

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

export default router;
