// app.js
require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database client
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Route to display the input form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle form submission
app.post('/save', async (req, res) => {
  const { word } = req.body;

  try {
    const query = 'INSERT INTO words (word) VALUES ($1) RETURNING *';
    const values = [word];
    const result = await client.query(query, values);
    console.log('Word saved:', result.rows[0]);
    res.redirect('/display');
  } catch (err) {
    console.error('Error saving word:', err);
    res.status(500).send('Error saving word');
  }
});

// Route to display saved words
app.get('/display', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM words');
    const words = result.rows;
    res.sendFile(path.join(__dirname, 'public', 'display.html'));
  } catch (err) {
    console.error('Error fetching words:', err);
    res.status(500).send('Error fetching words');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});