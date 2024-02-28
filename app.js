const express = require('express');
const authRouter = require('./route/authroute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://dandys-auth-app.onrender.com'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});
app.options('*', (req, res) => {
  res.sendStatus(200);
});
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Dandy Backend');
});

module.exports = app;
