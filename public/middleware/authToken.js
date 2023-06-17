import jwt from 'jsonwebtoken';

export const secretKey = 'web-projekt-secret-key';
export function authenticateToken(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    res.render('login.ejs', { problem: 'A folytatáshoz jelentkezzen be!' });
    return;
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403);
      res.render('login.ejs', { problem: 'A folytatáshoz jelentkezzen be!' });
      return;
    }

    req.user = decoded;
    next();
  });
}

export function isLoggedIn(req) {
  const token = req.cookies.jwt;

  if (!token) {
    return false; // felhasznalo nincs bejelentkezve
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.role;
  } catch (err) {
    return false; // invalid vagy lejart token
  }
}

export function getUsername(req) {
  const token = req.cookies.jwt;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.username;
  } catch (err) {
    return null;
  }
}
