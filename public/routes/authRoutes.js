import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insertUser, checkIfUserExists, getUserPassword, getAdminPassword } from '../db/db.js';
import { secretKey } from '../middleware/authToken.js';

const router = express.Router();
router.get('/loginpage', (req, res) => {
  res.render('login.ejs');
});

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    let validCredentials = false;

    if (role === 'user') {
      const response = await getUserPassword([username]);
      if (response[0].password !== 0) {
        validCredentials = await bcrypt.compare(password, response[0].password);
      }
    } else if (role === 'admin') {
      const response = await getAdminPassword([username]);
      if (response[0].password !== 0) {
        validCredentials = await bcrypt.compare(password, response[0].password);
      }
    }

    if (!validCredentials) {
      res.render('login.ejs', { problem: 'Hibás felhasználónév vagy jelszó' });
      return;
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
  checkIfUserExists(username).then(async (response) => {
    if (response[0]) {
      // megnezem hogy letezik-e mar az adott fehasznalo
      res.render('login.ejs', { problem: `${username} nevű felhasználó már létezik!` });
    } // megnezem ha a jelszavak egyeznek-e
    else if (password1 !== password2) {
      res.render('login.ejs', { problem: 'Kérem ugyanazt a jelszót adja meg' });
    } else {
      const hashedPassword = await bcrypt.hash(password1, 10);
      insertUser([username, hashedPassword])
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
