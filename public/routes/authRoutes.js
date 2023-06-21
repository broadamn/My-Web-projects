import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateLoginData, validateRegistrationData, validatePasswords } from '../middleware/credintalValidator.js';
import { insertUser, checkIfUserExists, getUserPassword, getAdminPassword, updatePassword } from '../db/db.js';
import { authenticateToken, secretKey, isLoggedIn, getUsername } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/loginpage', (req, res) => {
  res.render('login.ejs');
});

router.post('/login', validateLoginData, async (req, res) => {
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

router.post('/register', validateRegistrationData, (req, res) => {
  const { username } = req.body;
  const { password1 } = req.body;
  checkIfUserExists(username).then(async (response) => {
    if (response[0]) {
      // megnezem hogy letezik-e mar az adott fehasznalo
      res.render('login.ejs', { problem: `${username} nevű felhasználó már létezik!` });
    } else {
      const hashedPassword = await bcrypt.hash(password1, 10);
      insertUser([username, hashedPassword])
        .then(() => {
          res.redirect('/loginpage');
        })
        .catch((err) => {
          console.error(err);
          res.render('error.ejs', { message: 'Server hiba!', problem: `${err}` });
        });
    }
  });
});

router.post('/resetpassword', authenticateToken, validatePasswords, async (req, res) => {
  const { oldpassword, newpassword1 } = req.body;

  try {
    const role = isLoggedIn(req);
    const username = getUsername(req);
    let validCredentials = false;

    if (role === 'user') {
      const response = await getUserPassword([username]);
      if (response[0].password !== 0) {
        validCredentials = await bcrypt.compare(oldpassword, response[0].password);
      }
    } else if (role === 'admin') {
      const response = await getAdminPassword([username]);
      if (response[0].password !== 0) {
        validCredentials = await bcrypt.compare(oldpassword, response[0].password);
      }
    }

    if (!validCredentials) {
      res.render('login.ejs', { problem: 'Hibás felhasználónév vagy jelszó' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newpassword1, 10);
    updatePassword([hashedNewPassword, username], role)
      .then(() => {
        res.status(200).render('login.ejs', { problem: 'Jelszó frissítve. A folytatáshoz jelentkezzen be!' });
      })
      .catch((error) => {
        res.render('error.ejs', { message: 'Hiba a jelszó frissítése közben!', problem: `${error}` });
      });
  } catch (error) {
    console.error(error);
    res.status(500);
    res.render('error.ejs', { message: 'Server hiba!', problem: `${error}` });
  }
});

router.get('/resetpasswordpage', authenticateToken, (req, res) => {
  const username = getUsername(req);
  res.render('resetpasswd.ejs', { username });
});

router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

export default router;
