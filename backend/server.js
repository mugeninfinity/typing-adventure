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
                settings: dbUser.settings,
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

app.post('/api/users', async (req, res) => {
    const { email, password, name, is_admin, unlocked_achievements, assigned_categories } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
        const result = await pool.query(
            'INSERT INTO users (email, password, name, is_admin, unlocked_achievements, assigned_categories) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [email, hashedPassword, name, is_admin, unlocked_achievements, assigned_categories]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, is_admin, unlocked_achievements, assigned_categories } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET email = $1, name = $2, is_admin = $3, unlocked_achievements = $4, assigned_categories = $5 WHERE id = $6 RETURNING *',
            [email, name, is_admin, unlocked_achievements, assigned_categories, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
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

app.post('/api/achievements', async (req, res) => {
    const achievements = req.body;
    try {
        await pool.query('DELETE FROM achievements');
        const result = await Promise.all(achievements.map(ach => {
            return pool.query(
                'INSERT INTO achievements (id, title, description, icon, icon_type, type, value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [ach.id, ach.title, ach.description, ach.icon, ach.icon_type, ach.type, ach.value]
            );
        }));
        res.status(201).json(result.map(r => r.rows[0]));
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

app.put('/api/site-settings', async (req, res) => {
    const { site_name, correct_sound, incorrect_sound } = req.body;
    try {
        const result = await pool.query(
            'UPDATE site_settings SET site_name = $1, correct_sound = $2, incorrect_sound = $3 RETURNING *',
            [site_name, correct_sound, incorrect_sound]
        );
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

// MONS
app.get('/api/mons/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM mons WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// QUESTS
app.get('/api/quests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quests');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// REWARDS
app.get('/api/rewards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rewards');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

// ... (keep all existing code up to the end of the achievements routes)

// MON TYPES
app.get('/api/mon-types', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mon_types ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/mon-types', async (req, res) => {
    const { name, image_url, evolution_stage, evolves_at_level } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO mon_types (name, image_url, evolution_stage, evolves_at_level) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, image_url, evolution_stage, evolves_at_level]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/mon-types/:id', async (req, res) => {
    const { id } = req.params;
    const { name, image_url, evolution_stage, evolves_at_level } = req.body;
    try {
        const result = await pool.query(
            'UPDATE mon_types SET name = $1, image_url = $2, evolution_stage = $3, evolves_at_level = $4 WHERE id = $5 RETURNING *',
            [name, image_url, evolution_stage, evolves_at_level, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/mon-types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM mon_types WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ... (the rest of your server.js file)
// ... (keep all existing code up to the end of the mon-types routes)

// QUESTS
app.get('/api/quests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quests ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/quests', async (req, res) => {
    const { title, description, type, goal, reward_money, reward_xp_multiplier } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO quests (title, description, type, goal, reward_money, reward_xp_multiplier) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, type, goal, reward_money, reward_xp_multiplier]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/quests/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, type, goal, reward_money, reward_xp_multiplier } = req.body;
    try {
        const result = await pool.query(
            'UPDATE quests SET title = $1, description = $2, type = $3, goal = $4, reward_money = $5, reward_xp_multiplier = $6 WHERE id = $7 RETURNING *',
            [title, description, type, goal, reward_money, reward_xp_multiplier, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/quests/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM quests WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ... (the rest of your server.js file)
// ... (keep all existing code up to the end of the quests routes)

// REWARDS
app.get('/api/rewards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rewards ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/rewards', async (req, res) => {
    const { name, description, cost } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO rewards (name, description, cost) VALUES ($1, $2, $3) RETURNING *',
            [name, description, cost]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/rewards/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, cost } = req.body;
    try {
        const result = await pool.query(
            'UPDATE rewards SET name = $1, description = $2, cost = $3 WHERE id = $4 RETURNING *',
            [name, description, cost, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/rewards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM rewards WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/user-rewards', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_rewards.*, users.name as user_name, rewards.name as reward_name FROM user_rewards JOIN users ON user_rewards.user_id = users.id JOIN rewards ON user_rewards.reward_id = rewards.id ORDER BY requested_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/user-rewards/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE user_rewards SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ... (the rest of your server.js file)

// ... (keep all existing code up to the end of the cards routes)

// USERS
app.post('/api/auth/login', async (req, res) => {
    // ... (login code remains the same)
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, name, is_admin, unlocked_achievements, assigned_categories FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users', async (req, res) => {
    const { email, password, name, is_admin, unlocked_achievements, assigned_categories } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
        const result = await pool.query(
            'INSERT INTO users (email, password, name, is_admin, unlocked_achievements, assigned_categories) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [email, hashedPassword, name, is_admin, unlocked_achievements, assigned_categories]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, is_admin, unlocked_achievements, assigned_categories } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET email = $1, name = $2, is_admin = $3, unlocked_achievements = $4, assigned_categories = $5 WHERE id = $6 RETURNING *',
            [email, name, is_admin, unlocked_achievements, assigned_categories, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ... (the rest of your server.js file)

// ... (keep all existing code up to the end of the mon-types routes)

// USER'S MONS
app.get('/api/users/:id/mons', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT m.id, m.level, m.experience, mt.name, mt.image_url, mt.evolution_stage, mt.evolves_at_level FROM mons m JOIN mon_types mt ON m.mon_type_id = mt.id WHERE m.user_id = $1 ORDER BY m.id ASC',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ... (the rest of your server.js file)
// ... (keep all existing code up to the end of the rewards routes)

// USER QUESTS
app.get('/api/users/:id/quests', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT uq.*, q.title, q.description, q.type, q.goal, q.reward_money, q.reward_xp_multiplier FROM user_quests uq JOIN quests q ON uq.quest_id = q.id WHERE uq.user_id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/user-quests', async (req, res) => {
    const { user_id, quest_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO user_quests (user_id, quest_id) VALUES ($1, $2) RETURNING *',
            [user_id, quest_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// USER REWARDS
app.post('/api/user-rewards', async (req, res) => {
    const { user_id, reward_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO user_rewards (user_id, reward_id) VALUES ($1, $2) RETURNING *',
            [user_id, reward_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ... (the rest of your server.js file)