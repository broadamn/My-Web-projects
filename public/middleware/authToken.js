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

export function isAdminLoggedIn(req) {
  const token = req.cookies.jwt;

  if (!token) {
    return false; // User is not logged in
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded.role === 'admin';
  } catch (err) {
    return false; // Invalid token or expired
  }
}
