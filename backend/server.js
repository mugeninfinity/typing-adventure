const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

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

// --- FILE UPLOAD SETUP ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
       cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
 });
 const upload = multer({
    storage: storage
 }).single('media');


// --- MIDDLEWARE ---
app.use(cors({
    origin: 'http://localhost:3052',
    credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_that_should_be_in_an_env_file',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// --- API ROUTES ---
// AUTH
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
            
            req.session.user = userPayload;
            res.json({ success: true, user: userPayload });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out' });
    });
});

app.get('/api/auth/check', (req, res) => {
    if (req.session.user) {
        res.json({ success: true, user: req.session.user });
    } else {
        res.json({ success: false });
    }
});

// USERS
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
    const { email, password, name, is_admin, assigned_categories } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    try {
        const result = await pool.query(
            'INSERT INTO users (email, password, name, is_admin, assigned_categories) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, name, is_admin, assigned_categories]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, is_admin, assigned_categories, password } = req.body;
    
    try {
        let result;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            result = await pool.query(
                'UPDATE users SET email = $1, name = $2, is_admin = $3, assigned_categories = $4, password = $5 WHERE id = $6 RETURNING *',
                [email, name, is_admin, assigned_categories, hashedPassword, id]
            );
        } else {
            result = await pool.query(
                'UPDATE users SET email = $1, name = $2, is_admin = $3, assigned_categories = $4 WHERE id = $5 RETURNING *',
                [email, name, is_admin, assigned_categories, id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

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
    // FIX: Changed "id" to "userId" to match the route parameter
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
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const historyResult = await client.query(
            'INSERT INTO typing_history (user_id, card_id, wpm, accuracy, time_elapsed, incorrect_letters, word_count, char_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, cardId, wpm, accuracy, timeElapsed, incorrectLetters, wordCount, charCount]
        );
        
        const newlyUnlocked = await checkAndAwardAchievements(client, userId, { wpm, accuracy });
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            history: historyResult.rows[0],
            unlockedAchievements: newlyUnlocked
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM achievements');
        const result = await Promise.all(achievements.map(ach => {
            return client.query(
                'INSERT INTO achievements (id, title, description, icon, icon_type, type, value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [ach.id, ach.title, ach.description, ach.icon, ach.icon_type, ach.type, ach.value]
            );
        }));
        await client.query('COMMIT');
        res.status(201).json(result.map(r => r.rows[0]));
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
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
    // FIX: Changed "userId" to "user_id" to match the frontend
    const { user_id, content, wordCount, charCount } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO journal (user_id, content, word_count, char_count) VALUES ($1, $2, $3, $4) RETURNING *',
            // FIX: Pass the correct variable to the query
            [user_id, content, wordCount, charCount]
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
        console.error("Error in GET /api/users/:id/mons:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ADMIN: GET ALL MONS and DELETE MON
app.get('/api/mons', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.id, m.level, m.experience, 
                u.name as user_name, 
                mt.name as mon_name, mt.image_url
            FROM mons m
            JOIN users u ON m.user_id = u.id
            JOIN mon_types mt ON m.mon_type_id = mt.id
            ORDER BY m.id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in GET /api/mons:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/mons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM mons WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error("Error in DELETE /api/mons/:id:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


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
    const monTypesToSave = Array.isArray(req.body) ? req.body : [req.body];
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const savedMonTypes = await Promise.all(monTypesToSave.map(monType => {
            const { name, image_url, evolution_stage, evolves_at_level, next_evolution_id } = monType;
            if (monType.id) {
                // This is an update
                return client.query(
                    'UPDATE mon_types SET name = $1, image_url = $2, evolution_stage = $3, evolves_at_level = $4, next_evolution_id = $5 WHERE id = $6 RETURNING *',
                    [name, image_url, evolution_stage, evolves_at_level || null, next_evolution_id || null, monType.id]
                );
            } else {
                // This is an insert
                return client.query(
                    'INSERT INTO mon_types (name, image_url, evolution_stage, evolves_at_level, next_evolution_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [name, image_url, evolution_stage, evolves_at_level || null, next_evolution_id || null]
                );
            }
        }));

        await client.query('COMMIT');
        res.status(201).json(savedMonTypes.map(r => r.rows[0]));
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error in POST /api/mon-types:", err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

app.put('/api/mon-types/:id', async (req, res) => {
    const { id } = req.params;
    const { name, image_url, evolution_stage, evolves_at_level, next_evolution_id } = req.body;
    try {
        const result = await pool.query(
            'UPDATE mon_types SET name = $1, image_url = $2, evolution_stage = $3, evolves_at_level = $4, next_evolution_id = $5 WHERE id = $6 RETURNING *',
            [name, image_url, evolution_stage, evolves_at_level || null, next_evolution_id || null, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error in PUT /api/mon-types/:id:", err);
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

// --- ACHIEVEMENT CHECKING LOGIC ---
const checkAndAwardAchievements = async (client, userId, latestStats) => {
    const { wpm, accuracy } = latestStats;
    try {
        const achievementsRes = await client.query('SELECT * FROM achievements');
        const allAchievements = achievementsRes.rows;

        const userRes = await client.query('SELECT unlocked_achievements FROM users WHERE id = $1', [userId]);
        const userAchievements = userRes.rows[0].unlocked_achievements;

        const historyRes = await client.query('SELECT * FROM typing_history WHERE user_id = $1', [userId]);
        const journalRes = await client.query('SELECT * FROM journal WHERE user_id = $1', [userId]);
        const userHistory = historyRes.rows;
        const userJournal = journalRes.rows;

        const totalCardsCompleted = userHistory.length;
        const journalEntries = userJournal.length;
        const journalWords = userJournal.reduce((sum, entry) => sum + (entry.word_count || 0), 0);

        const newlyUnlocked = [];

        for (const ach of allAchievements) {
            if (userAchievements.includes(ach.id)) {
                continue;
            }

            let unlocked = false;
            switch (ach.type) {
                case 'wpm':
                    if (wpm >= ach.value) unlocked = true;
                    break;
                case 'accuracy':
                    if (accuracy >= ach.value) unlocked = true;
                    break;
                case 'total_cards_completed':
                    if (totalCardsCompleted >= ach.value) unlocked = true;
                    break;
                case 'journal_entries':
                    if (journalEntries >= ach.value) unlocked = true;
                    break;
                case 'journal_words':
                    if (journalWords >= ach.value) unlocked = true;
                    break;
            }

            if (unlocked) {
                newlyUnlocked.push(ach);
            }
        }

        if (newlyUnlocked.length > 0) {
            const newAchievementsList = [...userAchievements, ...newlyUnlocked.map(a => a.id)];
            await client.query('UPDATE users SET unlocked_achievements = $1 WHERE id = $2', [newAchievementsList, userId]);
        }

        return newlyUnlocked;
    } catch (err) {
        console.error("Error checking achievements:", err);
        return [];
    }
};

// NEW: File Upload Endpoint
app.post('/api/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.status(500).json({ error: err.message });
        } else {
            if(req.file == undefined){
                res.status(400).json({ error: 'No file selected!' });
            } else {
                res.json({
                    success: true,
                    path: `/uploads/${req.file.filename}`
                });
            }
        }
    });
});


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});