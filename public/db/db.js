import mysql from 'mysql';

const pool = mysql.createPool({
  connectionLimit: 10,
  database: 'trains',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'mypasswd',
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
            day VARCHAR(20),
            price FLOAT NOT NULL,
            type VARCHAR(5) NOT NULL
          );`,
          (err1) => {
            if (err1) {
              console.error(err1);
              reject(err1);
            } else {
              console.log('Járatok tábla létrehozva!');
            }
          },
        );

        connection.query(
          `CREATE TABLE IF NOT EXISTS user (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL
          );`,
          (err2) => {
            if (err2) {
              console.error(err2);
              reject(err2);
            } else {
              console.log('Felhasználók tábla létrehozva!');
            }
          },
        );

        connection.query(
          `CREATE TABLE IF NOT EXISTS reservation (
            reservation_id INT AUTO_INCREMENT PRIMARY KEY,
            journey_id INT NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (journey_id) REFERENCES journey(journey_id),
            FOREIGN KEY (user_id) REFERENCES user(user_id)
          );`,
          (err3, resp) => {
            if (err3) {
              console.error(err3);
              reject(err3);
            } else {
              console.log('Foglalások tábla létrehozva!\n');
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
