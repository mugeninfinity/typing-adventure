const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const saltRounds = 10;

// --- DATABASE CONNECTION ---
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// --- DATABASE INITIALIZATION ---
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name VARCHAR(255),
        isAdmin BOOLEAN DEFAULT false,
        unlockedAchievements TEXT[] DEFAULT '{}',
        assignedCategories TEXT[] DEFAULT '{}'
      );
    `);

    // Create cards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255),
        title VARCHAR(255),
        textContent TEXT,
        image VARCHAR(255),
        video VARCHAR(255),
        audio VARCHAR(255),
        revealType VARCHAR(50)
      );
    `);

    // Check if the users table is empty and seed it
    const userRes = await client.query('SELECT COUNT(*) FROM users');
    if (userRes.rows[0].count === '0') {
        console.log('Users table is empty. Seeding with initial data...');
        const usersToSeed = {
            'user@example.com': { password: 'password123', isAdmin: false, name: 'User', assignedCategories: ['Science'] },
            'admin@example.com': { password: 'admin123', isAdmin: true, name: 'Admin', assignedCategories: [] },
        };

        for (const email in usersToSeed) {
            const user = usersToSeed[email];
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            await client.query(
                'INSERT INTO users (email, password, name, isAdmin, assignedCategories) VALUES ($1, $2, $3, $4, $5)',
                [email, hashedPassword, user.name, user.isAdmin, user.assignedCategories]
            );
        }
        console.log('Initial user data seeded.');
    }

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database', err.stack);
  } finally {
    client.release();
  }
}

initializeDatabase().catch(console.error);


// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());


// --- API ROUTES ---

// Real Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1 OR name = $1', [identifier]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        
        const dbUser = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, dbUser.password);

        if (passwordMatch) {
            const userPayload = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                isAdmin: dbUser.isadmin,
                unlockedAchievements: dbUser.unlockedachievements,
                assignedCategories: dbUser.assignedcategories,
            };
            res.json({ success: true, user: userPayload });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all cards
app.get('/api/cards', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM cards ORDER BY id ASC');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// NEW: DELETE a card by ID
app.delete('/api/cards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
        
        res.json({ success: true, message: 'Card deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
