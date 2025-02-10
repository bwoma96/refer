const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());

const createTableIfNotExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS words (
      id SERIAL PRIMARY KEY,
      word VARCHAR(255) NOT NULL
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Table "words" is ready');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

app.post('/words', async (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).send('Word is required');
  }

  try {
    const result = await pool.query('INSERT INTO words (word) VALUES ($1) RETURNING *', [word]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, async () => {
  await createTableIfNotExists();
  console.log(`Server is running on port ${port}`);
});
