
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL, // Use the full connection string from .env
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create the database if it doesn't exist
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`Database "${process.env.DB_NAME}" created or already exists.`);
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`Database "${process.env.DB_NAME}" already exists.`);
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }

  // Connect to the new database and create the table
  const newClient = new Client({
    connectionString: process.env.DATABASE_URL.replace('postgres', process.env.DB_NAME), // Adjust the connection string for the new database
  });

  try {
    await newClient.connect();
    console.log(`Connected to database "${process.env.DB_NAME}"`);

    // Create the table if it doesn't exist
    await newClient.query(`
      CREATE TABLE IF NOT EXISTS words (
        id SERIAL PRIMARY KEY,
        word TEXT NOT NULL
      )
    `);
    console.log('Table "words" created or already exists.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await newClient.end();
  }
}

setupDatabase();
