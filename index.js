import express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import { initDb } from './public/db/db.js';
import requestRoutes from './public/routes/requests.js';

const app = express();

const staticdir = path.join(process.cwd(), 'public');

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), './public/views'));

app.use(express.static(staticdir));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', requestRoutes);

initDb()
  .then(() => {
    console.log('Adatbázis sikeresen létrehozva!');
  })
  .catch((err) => {
    console.error('Hiba az adatbázis létrehozásakor!', err);
  });

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
