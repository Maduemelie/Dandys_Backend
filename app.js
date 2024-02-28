const express = require('express');
const authRouter = require('./route/authroute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const allowedOrigins = [
    'https://dandys-auth-app.onrender.com',
    'http://localhost:3000',
    // Add more origins as needed
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );

  // Check if this is a preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200); // Respond with 200 OK for preflight requests
  } else {
    next(); // Move to the next middleware
  }
});

app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Dandy Backend');
});

module.exports = app;
