const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// logging: file + console
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream })); // persistent log
app.use(morgan('dev')); // console

app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve index.html and static assets

const port = process.env.PORT || 3000;
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'myapp',
  password: process.env.DB_PASS || 'examplepass',
  database: process.env.DB_NAME || 'myappdb',
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

async function initDb() {
  const maxAttempts = 20;
  const delayMs = 3000;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      console.log('DB ready');
      return;
    } catch (err) {
      console.error(`DB attempt ${i} failed: ${err.message}`);
      if (i === maxAttempts) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

// API endpoints under /api
app.get('/api/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM notes');
    res.json({ status: 'ok', notes: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  try {
    const [result] = await pool.query('INSERT INTO notes (text) VALUES (?)', [text]);
    res.status(201).json({ id: result.insertId, text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fallback serve index.html at /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

initDb()
  .then(() => app.listen(port, () => console.log(`App listening on port ${port}`)))
  .catch(err => {
    console.error('DB init failed', err);
    process.exit(1);
  });