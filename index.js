import dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import bodyParser from 'body-parser';
import { initDb } from './public/db/db.js';
import requestRoutes from './public/routes/requests.js';

dotenv.config();

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

const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
