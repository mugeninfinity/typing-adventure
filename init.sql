-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(255),
    is_admin BOOLEAN DEFAULT false,
    unlocked_achievements TEXT[] DEFAULT '{}',
    assigned_categories TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    money INTEGER DEFAULT 0,
    trainer_level INTEGER DEFAULT 1,
    trainer_experience INTEGER DEFAULT 0
);

-- Cards Table
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255),
    title VARCHAR(255),
    text_content TEXT,
    image VARCHAR(255),
    video VARCHAR(255),
    audio VARCHAR(255),
    reveal_type VARCHAR(50)
);

-- Typing History Table
CREATE TABLE IF NOT EXISTS typing_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    wpm INTEGER,
    accuracy INTEGER,
    time_elapsed NUMERIC(10, 2),
    incorrect_letters TEXT[],
    word_count INTEGER,
    char_count INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    icon TEXT,
    icon_type VARCHAR(50),
    type VARCHAR(255),
    value INTEGER
);

-- Journal Table
CREATE TABLE IF NOT EXISTS journal (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    word_count INTEGER,
    char_count INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255),
    correct_sound VARCHAR(255),
    incorrect_sound VARCHAR(255)
);

-- Mon Types Table
CREATE TABLE IF NOT EXISTS mon_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    evolution_stage VARCHAR(50) NOT NULL,
    evolves_at_level INTEGER,
    next_evolution_id INTEGER REFERENCES mon_types(id) ON DELETE SET NULL
);

-- Mons Table (owned by users)
CREATE TABLE IF NOT EXISTS mons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mon_type_id INTEGER REFERENCES mon_types(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0
);

-- Quests Table
CREATE TABLE IF NOT EXISTS quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(255),
    goal INTEGER,
    reward_money INTEGER,
    reward_xp_multiplier NUMERIC(3, 1)
);

-- User Quests Table
CREATE TABLE IF NOT EXISTS user_quests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    cost INTEGER
);

-- User Rewards Table
CREATE TABLE IF NOT EXISTS user_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reward_id INTEGER REFERENCES rewards(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, denied, redeemed
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mon Types Table (Updated)
CREATE TABLE IF NOT EXISTS mon_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    evolution_stage VARCHAR(50) NOT NULL,
    evolves_at_level INTEGER,
    next_evolution_id INTEGER REFERENCES mon_types(id) ON DELETE SET NULL
);

-- Seed initial data
INSERT INTO
    users (
        email,
        password,
        name,
        is_admin,
        assigned_categories
    )
VALUES
    (
        'user@example.com',
        '$2b$10$sZUb4q3.Yy7FZF2LdII6cOMir6rh1eyWqwjKI.GFsP4miHJjoQUku',
        'User',
        false,
        '{"Science"}'
    ),
    (
        'admin@example.com',
        '$2b$10$LziSX2vG6D2mJfjQQo0XUOhsulWxLSeg6mkvxDh9HHixB5o1Znsyq',
        'Admin',
        true,
        '{}'
    );

INSERT INTO
    cards (
        category,
        title,
        text_content,
        image,
        video,
        audio,
        reveal_type
    )
VALUES
    (
        'Science',
        'A Journey to the Sun',
        'sun',
        'https://placehold.co/600x450/f97316/white?text=The+Sun',
        null,
        'https://cdn.pixabay.com/audio/2022/08/04/audio_2bbe64992d.mp3',
        'puzzle'
    ),
    (
        'Nature',
        'The Whispering Forest',
        'Ancient trees stood tall, their leaves whispering secrets to the wind.',
        'https://placehold.co/600x450/16a34a/white?text=Forest',
        null,
        null,
        'image'
    ),
    (
        'Nature',
        'Ocean Depths',
        'Below the waves, a world of vibrant color and life exists. Coral reefs teem with fish of every shape and size.',
        null,
        'https://www.w3schools.com/html/mov_bbb.mp4',
        null,
        'video'
    );

INSERT INTO
    achievements (id, title, description, icon, icon_type, type, value)
VALUES
    (
        'wpm_50',
        'Speedy Fingers',
        'Reach 50 WPM on any card.',
        '??',
        'emoji',
        'wpm',
        50
    ),
    (
        'acc_98',
        'Perfectionist',
        'Get 98% accuracy or higher.',
        '??',
        'emoji',
        'accuracy',
        98
    ),
    (
        'cards_10',
        'Dedicated Typist',
        'Complete 10 typing cards.',
        '??',
        'emoji',
        'total_cards_completed',
        10
    ),
    (
        'first_card',
        'Getting Started',
        'Complete your first card.',
        '??',
        'emoji',
        'total_cards_completed',
        1
    ),
    (
        'journal_1',
        'First Entry',
        'Write your first journal entry.',
        '??',
        'emoji',
        'journal_entries',
        1
    ),
    (
        'journal_words_100',
        'Budding Author',
        'Write 100 words in your journal.',
        '??',
        'emoji',
        'journal_words',
        100
    );

INSERT INTO
    site_settings (site_name, correct_sound, incorrect_sound)
VALUES
    (
        'Typing Adventure',
        'https://www.soundjay.com/button/sounds/button-16.mp3',
        'https://www.soundjay.com/button/sounds/button-10.mp3'
    );
-- FIX: We no longer specify the IDs when seeding Mon Types. PostgreSQL will generate them.
INSERT INTO mon_types (name, image_url, evolution_stage, evolves_at_level, next_evolution_id) VALUES
('Bulbasaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', 'first', 16, 2),
('Ivysaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png', 'second', 32, 3),
('Venusaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', 'final', null, null),
('Charmander', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', 'first', 16, 5),
('Charmeleon', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png', 'second', 36, 6),
('Charizard', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', 'final', null, null);

-- FIX: We let the database assign the ID for the pre-assigned mon.
INSERT INTO mons (user_id, mon_type_id, level, experience) VALUES
(1, 4, 5, 120);