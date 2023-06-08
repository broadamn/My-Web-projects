const config = {
  HOST: 'localhost',
  USER: 'root',
  PASSWORD: 'mypasswd',
  DB: 'trains',
  port: 3307,
  connectionLimit: 10,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export default config;
