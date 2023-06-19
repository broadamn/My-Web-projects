import mysql from 'mysql';
import dbConfig from '../../config/db.config.js';

const pool = mysql.createPool({
  connectionLimit: dbConfig.connectionLimit,
  database: dbConfig.DB,
  host: dbConfig.HOST,
  port: dbConfig.port,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
});

export function initDb() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        connection.release();
        console.log(`Error in database connection: ${err.message}`);
        reject(err);
      } else {
        connection.query(
          `CREATE TABLE IF NOT EXISTS journey (
            journey_id INT AUTO_INCREMENT PRIMARY KEY,
            origin VARCHAR(255) NOT NULL,
            destination VARCHAR(255) NOT NULL,
            departure_time TIME NOT NULL,
            arrival_time TIME NOT NULL,
            day VARCHAR(20),
            price FLOAT NOT NULL,
            type VARCHAR(5) NOT NULL
          );`,
          (err1) => {
            if (err1) {
              console.error(err1);
              reject(err1);
            } else {
              console.log('Járatok tábla rendben!');
            }
          },
        );

        connection.query(
          `CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(255) NOT NULL PRIMARY KEY,
            password VARCHAR(255) NOT NULL
          );`,
          (err2) => {
            if (err2) {
              console.error(err2);
              reject(err2);
            } else {
              console.log('Felhasználók tábla rendben!');
            }
          },
        );

        connection.query(
          `CREATE TABLE IF NOT EXISTS reservation (
            reservation_id INT AUTO_INCREMENT PRIMARY KEY,
            journey_id INT NOT NULL,
            username VARCHAR(255) NOT NULL,
            week_number INT,
            FOREIGN KEY (journey_id) REFERENCES journey(journey_id) ON DELETE CASCADE,
            FOREIGN KEY (username) REFERENCES users(username)
          );`,
          (err3) => {
            if (err3) {
              console.error(err3);
              reject(err3);
            } else {
              console.log('Foglalások tábla rendben!');
            }
          },
        );

        connection.query(
          `CREATE TABLE IF NOT EXISTS admins (
            admin_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
          );`,
          (err4, resp) => {
            if (err4) {
              console.error(err4);
              reject(err4);
            } else {
              console.log('Adminok tábla rendben!\n');
              resolve(resp);
            }
          },
        );

        connection.release();
      }
    });
  });
}

export function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        connection.release();
        console.log(`Error in database connection: ${error.message}`);
        reject(error);
      } else {
        connection.query(query, params, (err, resp) => {
          if (err) {
            reject(err);
          } else {
            resolve(resp);
          }
        });
        connection.release();
      }
    });
  });
}

export function deleteReservationbyId(id) {
  const query = 'DELETE FROM reservation WHERE reservation_id = ?';
  return executeQuery(query, [id]);
}

export function deleteJourneybyId(id) {
  const query = 'DELETE FROM journey WHERE journey_id = ?';
  return executeQuery(query, [id]);
}

export function getJourneyDetailsById(id) {
  const query = 'SELECT * FROM journey WHERE journey_id = ?';
  return executeQuery(query, [id]);
}

export function getAllJourneys() {
  const query = 'SELECT * FROM journey';
  return executeQuery(query);
}
// foglalasok lekerese
export function getBookingsByJourneyId(id) {
  const query =
    'SELECT reservation_id, u.username, week_number FROM reservation AS r JOIN users AS u on u.username = r.username WHERE journey_id = ? ORDER BY reservation_id';
  return executeQuery(query, [id]);
}

export function getUsersBookingsByJourneyId(params) {
  const query =
    'SELECT reservation_id, username, week_number FROM reservation WHERE username = ? AND journey_id = ? ORDER BY reservation_id';
  return executeQuery(query, params);
}

export function insertReservation(params) {
  const query = 'INSERT INTO reservation (journey_id, username, week_number) VALUES (?, ?, ?)';
  return executeQuery(query, params);
}

export function insertTrain(params) {
  const query =
    'INSERT INTO journey (origin, destination, day, departure_time, arrival_time, price, type) values (?, ?, ?, ?, ?, ?, ?)';
  return executeQuery(query, params);
}

export function getAllUsers() {
  const query = 'SELECT * FROM users';
  return executeQuery(query);
}

// export function searchTrain(params) {
//   const query = 'SELECT * FROM journey WHERE origin LIKE ? AND destination LIKE ? AND price >= ? AND price <= ? ';
//   return executeQuery(query, params);
// }

export function searchTrain(params) {
  const query = `
  Call FindTrainOptions(?, ?, ?, ?);
  `;
  return executeQuery(query, params);
}

export function insertUser(params) {
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  return executeQuery(query, params);
}

export function checkIfUserExists(userName) {
  const query = 'SELECT 1 FROM users WHERE username = ?';
  return executeQuery(query, [userName]);
}

export function getUserPassword(params) {
  const query = 'SELECT IFNULL((SELECT password FROM users WHERE username = ?), 0) AS password';
  return executeQuery(query, params);
}

export function getAdminPassword(params) {
  const query = 'SELECT IFNULL((SELECT password FROM admins WHERE username = ?), 0) AS password';
  return executeQuery(query, params);
}
