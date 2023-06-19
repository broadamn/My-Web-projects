import dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { initDb } from './public/db/db.js';
import trainRoutes from './public/routes/trainRoutes.js';
import searchRoutes from './public/routes/searchRoutes.js';
import bookingRoutes from './public/routes/bookingRoutes.js';
import authRoutes from './public/routes/authRoutes.js';

dotenv.config();

const app = express();

const staticdir = path.join(process.cwd(), 'public');

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), './public/views'));

app.use(cookieParser());
app.use(express.static(staticdir));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', trainRoutes);
app.use('/', searchRoutes);
app.use('/', bookingRoutes);
app.use('/', authRoutes);

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
