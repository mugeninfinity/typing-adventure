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

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// USERS
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 OR name = $1', [identifier]);
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
                isAdmin: dbUser.is_admin,
                unlockedAchievements: dbUser.unlocked_achievements,
                assignedCategories: dbUser.assigned_categories,
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

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, name, is_admin, unlocked_achievements, assigned_categories FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CARDS
app.get('/api/cards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cards ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/cards', async (req, res) => {
    const { category, title, text_content, image, video, audio, reveal_type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cards (category, title, text_content, image, video, audio, reveal_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [category, title, text_content, image, video, audio, reveal_type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/cards/:id', async (req, res) => {
    const { id } = req.params;
    const { category, title, text_content, image, video, audio, reveal_type } = req.body;
    try {
        const result = await pool.query(
            'UPDATE cards SET category = $1, title = $2, text_content = $3, image = $4, video = $5, audio = $6, reveal_type = $7 WHERE id = $8 RETURNING *',
            [category, title, text_content, image, video, audio, reveal_type, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
        res.json({ success: true, message: 'Card deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// TYPING HISTORY
app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM typing_history WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/history', async (req, res) => {
    const { userId, cardId, wpm, accuracy, timeElapsed, incorrectLetters, wordCount, charCount } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO typing_history (user_id, card_id, wpm, accuracy, time_elapsed, incorrect_letters, word_count, char_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, cardId, wpm, accuracy, timeElapsed, incorrectLetters, wordCount, charCount]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ACHIEVEMENTS
app.get('/api/achievements', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM achievements');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// JOURNAL
app.get('/api/journal/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM journal WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/journal', async (req, res) => {
    const { userId, content, wordCount, charCount } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO journal (user_id, content, word_count, char_count) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, content, wordCount, charCount]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/journal/:id', async (req, res) => {
    const { id } = req.params;
    const { content, wordCount, charCount } = req.body;
    try {
        const result = await pool.query(
            'UPDATE journal SET content = $1, word_count = $2, char_count = $3 WHERE id = $4 RETURNING *',
            [content, wordCount, charCount, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/journal/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM journal WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// SITE SETTINGS
app.get('/api/site-settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM site_settings LIMIT 1');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE USER SETTINGS
app.put('/api/users/:id/settings', async (req, res) => {
    const { id } = req.params;
    const { settings } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET settings = $1 WHERE id = $2 RETURNING settings',
            [settings, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, settings: result.rows[0].settings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});