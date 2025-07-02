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
    bio TEXT,
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
 ('Bible', 'Noah’s Ark', 'Noah builds a big ark.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Noahs_Ark.jpg/320px-Noahs_Ark.jpg', null, null, 'image'),
    ('Bible', 'Adam and Eve', 'Adam and Eve live in Eden.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Adam_and_Eve.jpg/320px-Adam_and_Eve.jpg', null, null, 'puzzle'),
    ('Bible', 'David’s Victory', 'David kills Goliath with a stone.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/David_and_Goliath.jpg/320px-David_and_Goliath.jpg', null, null, 'image'),
    ('Bible', 'Jonah’s Fish', 'Jonah meets a big fish.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Jonah_and_the_Whale.jpg/320px-Jonah_and_the_Whale.jpg', null, null, 'puzzle'),
    ('Bible', 'Jesus on Water', 'Jesus walks on the water.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jesus_Walking_on_Water.jpg/320px-Jesus_Walking_on_Water.jpg', null, null, 'image'),
    ('Bible', 'Wise Men’s Gifts', 'Wise men bring gifts to Jesus.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Adoration_of_the_Magi.jpg/320px-Adoration_of_the_Magi.jpg', null, null, 'puzzle'),
    ('Bible', 'Peter’s Mistake', 'Peter denies Jesus three times.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Denial_of_Peter.jpg/320px-Denial_of_Peter.jpg', null, null, 'image'),
    ('Bible', 'Jesus Rises', 'Jesus rises from the dead.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Resurrection_of_Christ.jpg/320px-Resurrection_of_Christ.jpg', null, null, 'puzzle'),
    ('Bible', 'Honor Parents', 'Honor your father and mother.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Moses_with_the_Ten_Commandments.jpg/320px-Moses_with_the_Ten_Commandments.jpg', null, null, 'image'),
    ('Bible', 'No Stealing', 'Do not steal from others.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Moses_with_the_Ten_Commandments.jpg/320px-Moses_with_the_Ten_Commandments.jpg', null, null, 'puzzle'),
    ('Bible', 'Love Neighbor', 'Love your neighbor as yourself.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Moses_with_the_Ten_Commandments.jpg/320px-Moses_with_the_Ten_Commandments.jpg', null, null, 'image'),
    ('Bible', 'No Lies', 'Do not tell lies.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Moses_with_the_Ten_Commandments.jpg/320px-Moses_with_the_Ten_Commandments.jpg', null, null, 'puzzle'),
    ('Bible', 'Poor in Spirit', 'Blessed are the poor in spirit.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sermon_on_the_Mount.jpg/320px-Sermon_on_the_Mount.jpg', null, null, 'image'),
    ('Bible', 'Those Who Mourn', 'Blessed are those who mourn.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sermon_on_the_Mount.jpg/320px-Sermon_on_the_Mount.jpg', null, null, 'puzzle'),
    ('Bible', 'The Meek', 'Blessed are the meek.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sermon_on_the_Mount.jpg/320px-Sermon_on_the_Mount.jpg', null, null, 'image'),
    ('Bible', 'Seek Righteousness', 'Blessed are those who seek righteousness.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sermon_on_the_Mount.jpg/320px-Sermon_on_the_Mount.jpg', null, null, 'puzzle'),
    ('Bible', 'Kind Love', 'Love is kind and patient.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Fruit_of_the_Spirit.jpg/320px-Fruit_of_the_Spirit.jpg', null, null, 'image'),
    ('Bible', 'Joyful Heart', 'Joy comes from knowing God.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Fruit_of_the_Spirit.jpg/320px-Fruit_of_the_Spirit.jpg', null, null, 'puzzle'),
    ('Bible', 'Calm Peace', 'Peace is like a calm lake.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Fruit_of_the_Spirit.jpg/320px-Fruit_of_the_Spirit.jpg', null, null, 'image'),
    ('Bible', 'Patient Waiting', 'Patience is waiting without complaining.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Fruit_of_the_Spirit.jpg/320px-Fruit_of_the_Spirit.jpg', null, null, 'puzzle'),
    ('Anime', 'Inuyasha’s Sword', 'Inuyasha fights with his sword.', 'https://wikia.nocookie.net/inuyasha/images/4/4b/Inuyasha_with_Tetsusaiga.jpg', null, null, 'image'),
    ('Anime', 'Kagome’s Arrow', 'Kagome uses a sacred arrow.', 'https://static.wikia.nocookie.net/inuyasha/images/8/8e/Kagome_with_bow.jpg/revision/latest?cb=20100323194715', null, null, 'puzzle'),
    ('Anime', 'Shippo’s Fox', 'Shippo is a fox demon.', 'https://static.wikia.nocookie.net/inuyasha/images/2/2f/Shippo.jpg/revision/latest?cb=20100323194718', null, null, 'image'),
    ('Anime', 'Miroku’s Wind', 'Miroku has a wind tunnel.', 'https://static.wikia.nocookie.net/inuyasha/images/6/6c/Miroku_wind_tunnel.jpg/revision/latest?cb=20100323194721', null, null, 'puzzle'),
    ('Anime', 'Naruto’s Star', 'Naruto throws a ninja star.', 'https://static.wikia.nocookie.net/naruto/images/5/5b/Naruto_shuriken.jpg/revision/latest?cb=20150123194712', null, null, 'image'),
    ('Anime', 'Sasuke’s Fire', 'Sasuke uses fire jutsu.', 'https://static.wikia.nocookie.net/naruto/images/7/7e/Sasuke_fireball.jpg/revision/latest?cb=20150123194715', null, null, 'puzzle'),
    ('Anime', 'Sakura’s Healing', 'Sakura is a medic ninja.', 'https://static.wikia.nocookie.net/naruto/images/9/9a/Sakura_healing.jpg/revision/latest?cb=20150123194718', null, null, 'image'),
    ('Anime', 'Kakashi’s Book', 'Kakashi reads his book.', 'https://static.wikia.nocookie.net/naruto/images/3/3c/Kakashi_reading.jpg/revision/latest?cb=20150123194721', null, null, 'puzzle'),
    ('Anime', 'Goku’s Power', 'Goku powers up for battle.', 'https://static.wikia.nocookie.net/dragonball/images/1/1a/Goku_power_up.jpg/revision/latest?cb=20160123194712', null, null, 'image'),
    ('Anime', 'Vegeta’s Pride', 'Vegeta is a Saiyan prince.', 'https://static.wikia.nocookie.net/dragonball/images/4/4b/Vegeta_prince.jpg/revision/latest?cb=20160123194715', null, null, 'puzzle'),
    ('Anime', 'Bulma’s Gadgets', 'Bulma invents cool machines.', 'https://static.wikia.nocookie.net/dragonball/images/6/6c/Bulma_inventing.jpg/revision/latest?cb=20160123194718', null, null, 'image'),
    ('Anime', 'Piccolo’s Training', 'Piccolo trains Gohan.', 'https://static.wikia.nocookie.net/dragonball/images/8/8e/Piccolo_training.jpg/revision/latest?cb=20160123194721', null, null, 'puzzle'),
    ('Anime', 'Sailor Moon’s Change', 'Usagi becomes Sailor Moon.', 'https://static.wikia.nocookie.net/sailormoon/images/2/2f/Usagi_transforming.jpg/revision/latest?cb=20170123194712', null, null, 'image'),
    ('Anime', 'Luna’s Talk', 'Luna is a talking cat.', 'https://static.wikia.nocookie.net/sailormoon/images/5/5b/Luna_cat.jpg/revision/latest?cb=20170123194715', null, null, 'puzzle'),
    ('Anime', 'Tuxedo’s Help', 'Tuxedo Mask helps Sailor Moon.', 'https://static.wikia.nocookie.net/sailormoon/images/7/7e/Tuxedo_Mask.jpg/revision/latest?cb=20170123194718', null, null, 'image'),
    ('Anime', 'Jupiter’s Plants', 'Sailor Jupiter loves plants.', 'https://static.wikia.nocookie.net/sailormoon/images/9/9a/Sailor_Jupiter.jpg/revision/latest?cb=20170123194721', null, null, 'puzzle'),
    ('Games', 'Kirby’s Inhale', 'Kirby sucks up enemies.', 'https://static.wikia.nocookie.net/kirby/images/1/1a/Kirby_inhaling.jpg/revision/latest?cb=20180123194712', null, null, 'image'),
    ('Games', 'Dedede’s Hammer', 'King Dedede is Kirby’s enemy.', 'https://static.wikia.nocookie.net/kirby/images/4/4b/King_Dedede.jpg/revision/latest?cb=20180123194715', null, null, 'puzzle'),
    ('Games', 'Kirby’s Copy', 'Kirby copies enemy powers.', 'https://static.wikia.nocookie.net/kirby/images/6/6c/Kirby_copy.jpg/revision/latest?cb=20180123194718', null, null, 'image'),
    ('Games', 'Waddle Dee’s Help', 'Waddle Dee helps Kirby.', 'https://static.wikia.nocookie.net/kirby/images/8/8e/Waddle_Dee.jpg/revision/latest?cb=20180123194721', null, null, 'puzzle'),
    ('Games', 'Mario’s Rescue', 'Mario saves Princess Peach.', 'https://static.wikia.nocookie.net/mario/images/2/2f/Mario_rescuing_peach.jpg/revision/latest?cb=20190123194712', null, null, 'image'),
    ('Games', 'Luigi’s Role', 'Luigi is Mario’s brother.', 'https://static.wikia.nocookie.net/mario/images/5/5b/Luigi.jpg/revision/latest?cb=20190123194715', null, null, 'puzzle'),
    ('Games', 'Bowser’s Threat', 'Bowser is the big bad guy.', 'https://static.wikia.nocookie.net/mario/images/7/7e/Bowser.jpg/revision/latest?cb=20190123194718', null, null, 'image'),
    ('Games', 'Yoshi’s Tongue', 'Yoshi eats enemies with his tongue.', 'https://static.wikia.nocookie.net/mario/images/9/9a/Yoshi.jpg/revision/latest?cb=20190123194721', null, null, 'puzzle'),
    ('Games', 'Link’s Tunic', 'Link has a green tunic.', 'https://static.wikia.nocookie.net/zelda/images/1/1a/Link_green_tunic.jpg/revision/latest?cb=20200123194712', null, null, 'image'),
    ('Games', 'Zelda’s Royalty', 'Zelda is the princess of Hyrule.', 'https://static.wikia.nocookie.net/zelda/images/4/4b/Princess_Zelda.jpg/revision/latest?cb=20200123194715', null, null, 'puzzle'),
    ('Games', 'Ganondorf’s Evil', 'Ganondorf is the main villain.', 'https://static.wikia.nocookie.net/zelda/images/6/6c/Ganondorf.jpg/revision/latest?cb=20200123194718', null, null, 'image'),
    ('Games', 'Link’s Sword', 'Link uses the Master Sword.', 'https://static.wikia.nocookie.net/zelda/images/8/8e/Link_master_sword.jpg/revision/latest?cb=20200123194721', null, null, 'puzzle'),
    ('Games', 'Sora’s Keyblade', 'Sora has a key-shaped weapon.', 'https://static.wikia.nocookie.net/kingdomhearts/images/2/2f/Sora_keyblade.jpg/revision/latest?cb=20210123194712', null, null, 'image'),
    ('Games', 'Donald and Goofy', 'Donald and Goofy help Sora.', 'https://static.wikia.nocookie.net/kingdomhearts/images/5/5b/Donald_Goofy.jpg/revision/latest?cb=20210123194715', null, null, 'puzzle'),
    ('Games', 'Riku’s Friendship', 'Riku is Sora’s best friend.', 'https://static.wikia.nocookie.net/kingdomhearts/images/7/7e/Riku.jpg/revision/latest?cb=20210123194718', null, null, 'image'),
    ('Games', 'Kairi’s Home', 'Kairi is from Destiny Islands.', 'https://static.wikia.nocookie.net/kingdomhearts/images/9/9a/Kairi.jpg/revision/latest?cb=20210123194721', null, null, 'puzzle'),
    ('Movies', 'Ponyo’s Fish', 'Ponyo is a goldfish princess.', 'https://static.wikia.nocookie.net/studio-ghibli/images/2/2f/Ponyo_fish.jpg/revision/latest?cb=20220123194712', null, null, 'image'),
    ('Movies', 'Sosuke’s Find', 'Sosuke finds Ponyo in a jar.', 'https://static.wikia.nocookie.net/studio-ghibli/images/5/5b/Sosuke_ponyo.jpg/revision/latest?cb=20220123194715', null, null, 'puzzle'),
    ('Movies', 'Ponyo’s Dream', 'Ponyo wants to be human.', 'https://static.wikia.nocookie.net/studio-ghibli/images/7/7e/Ponyo_human.jpg/revision/latest?cb=20220123194718', null, null, 'image'),
    ('Movies', 'Ocean Goddess', 'Gran Mamare is the ocean goddess.', 'https://static.wikia.nocookie.net/studio-ghibli/images/9/9a/Gran_Mamare.jpg/revision/latest?cb=20220123194721', null, null, 'puzzle'),
    ('Movies', 'Totoro’s Home', 'Totoro lives in the forest.', 'https://static.wikia.nocookie.net/studio-ghibli/images/1/1a/Totoro_forest.jpg/revision/latest?cb=20230123194712', null, null, 'image'),
    ('Movies', 'Totoro’s Friends', 'Satsuki and Mei meet Totoro.', 'https://static.wikia.nocookie.net/studio-ghibli/images/4/4b/Satsuki_Mei_Totoro.jpg/revision/latest?cb=20230123194715', null, null, 'puzzle'),
    ('Movies', 'Totoro’s Kindness', 'Totoro is friends with the girls.', 'https://static.wikia.nocookie.net/studio-ghibli/images/6/6c/Totoro_with_girls.jpg/revision/latest?cb=20230123194718', null, null, 'image'),
    ('Movies', 'Totoro’s Acorn', 'They plant an acorn together.', 'https://static.wikia.nocookie.net/studio-ghibli/images/8/8e/Totoro_acorn.jpg/revision/latest?cb=20230123194721', null, null, 'puzzle'),
    ('Movies', 'Hiccup’s Journey', 'Hiccup is a Viking boy.', 'https://static.wikia.nocookie.net/howtotrainyourdragon/images/2/2f/Hiccup.jpg/revision/latest?cb=20240123194712', null, null, 'image'),
    ('Movies', 'Toothless Dragon', 'Toothless is a Night Fury dragon.', 'https://static.wikia.nocookie.net/howtotrainyourdragon/images/5/5b/Toothless.jpg/revision/latest?cb=20240123194715', null, null, 'puzzle'),
    ('Movies', 'Best Friends', 'They become best friends.', 'https://static.wikia.nocookie.net/howtotrainyourdragon/images/7/7e/Hiccup_Toothless.jpg/revision/latest?cb=20240123194718', null, null, 'image'),
    ('Movies', 'Toothless’s Tail', 'Hiccup makes a tail for Toothless.', 'https://static.wikia.nocookie.net/howtotrainyourdragon/images/9/9a/Hiccup_tail.jpg/revision/latest?cb=20240123194721', null, null, 'puzzle'),
    ('Movies', 'Pooh’s Honey', 'Pooh bear loves honey.', 'https://static.wikia.nocookie.net/winnie-the-pooh/images/1/1a/Winnie_the_Pooh_honey.jpg/revision/latest?cb=20250123194712', null, null, 'image'),
    ('Movies', 'Piglet’s Courage', 'Piglet is very small and brave.', 'https://static.wikia.nocookie.net/winnie-the-pooh/images/4/4b/Piglet.jpg/revision/latest?cb=20250123194715', null, null, 'puzzle'),
    ('Movies', 'Tigger’s Bounce', 'Tigger bounces everywhere.', 'https://static.wikia.nocookie.net/winnie-the-pooh/images/6/6c/Tigger.jpg/revision/latest?cb=20250123194718', null, null, 'image'),
    ('Movies', 'Eeyore’s Mood', 'Eeyore is a gloomy donkey.', 'https://static.wikia.nocookie.net/winnie-the-pooh/images/8/8e/Eeyore.jpg/revision/latest?cb=20250123194721', null, null, 'puzzle'),
    ('Sports', 'Basketball Dribble', 'Players dribble the ball.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Basketball_dribbling.jpg/320px-Basketball_dribbling.jpg', null, null, 'image'),
    ('Sports', 'Basketball Pass', 'They pass to their teammates.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Basketball_passing.jpg/320px-Basketball_passing.jpg', null, null, 'puzzle'),
    ('Sports', 'Basketball Shot', 'Shooting baskets scores points.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Basketball_shooting.jpg/320px-Basketball_shooting.jpg', null, null, 'image'),
    ('Sports', 'Basketball Rebound', 'Rebounding gets the ball back.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Basketball_rebounding.jpg/320px-Basketball_rebounding.jpg', null, null, 'puzzle'),
    ('Sports', 'Basketball Defense', 'Defense stops the other team.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Basketball_defense.jpg/320px-Basketball_defense.jpg', null, null, 'image'),
    ('Sports', 'Basketball Dunk', 'He dunks the ball high.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Basketball_dunk.jpg/320px-Basketball_dunk.jpg', null, null, 'puzzle'),
    ('Sports', 'Basketball Game', 'The team plays basketball together.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Basketball_team.jpg/320px-Basketball_team.jpg', null, null, 'image'),
    ('Sports', 'Basketball Court', 'They run on the court.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Basketball_court.jpg/320px-Basketball_court.jpg', null, null, 'puzzle'),
    ('Sports', 'Basketball Hoop', 'The hoop is very high.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Basketball_hoop.jpg/320px-Basketball_hoop.jpg', null, null, 'image'),
    ('Sports', 'Basketball Coach', 'The coach teaches the players.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Basketball_coach.jpg/320px-Basketball_coach.jpg', null, null, 'puzzle'),
    ('Sports', 'Baseball Pitch', 'Pitchers throw the ball.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Baseball_pitching.jpg/320px-Baseball_pitching.jpg', null, null, 'image'),
    ('Sports', 'Baseball Hit', 'Batters try to hit it.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Baseball_batting.jpg/320px-Baseball_batting.jpg', null, null, 'puzzle'),
    ('Sports', 'Baseball Catch', 'Fielders catch the ball.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Baseball_fielding.jpg/320px-Baseball_fielding.jpg', null, null, 'image'),
    ('Sports', 'Baseball Run', 'Runners go around the bases.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Baseball_running.jpg/320px-Baseball_running.jpg', null, null, 'puzzle'),
    ('Sports', 'Baseball Umpire', 'Umpires call the plays.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Baseball_umpire.jpg/320px-Baseball_umpire.jpg', null, null, 'image'),
    ('Sports', 'Baseball Home Run', 'He hits a home run.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Baseball_home_run.jpg/320px-Baseball_home_run.jpg', null, null, 'puzzle'),
    ('Sports', 'Baseball Team', 'The team plays baseball together.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Baseball_team.jpg/320px-Baseball_team.jpg', null, null, 'image'),
    ('Sports', 'Baseball Glove', 'The glove catches the ball.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Baseball_glove.jpg/320px-Baseball_glove.jpg', null, null, 'puzzle'),
    ('Sports', 'Baseball Bat', 'The bat hits the ball.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Baseball_bat.jpg/320px-Baseball_bat.jpg', null, null, 'image'),
    ('Sports', 'Baseball Field', 'They play on the field.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Baseball_field.jpg/320px-Baseball_field.jpg', null, null, 'puzzle');

INSERT INTO
    achievements (id, title, description, icon, icon_type, type, value)
VALUES
    (
        'wpm_50',
        'Speedy Fingers',
        'Reach 50 WPM on any card.',
        '🚀',
        'emoji',
        'wpm',
        50
    ),
    (
        'acc_98',
        'Perfectionist',
        'Get 98% accuracy or higher.',
        '🎯',
        'emoji',
        'accuracy',
        98
    ),
    (
        'cards_10',
        'Dedicated Typist',
        'Complete 10 typing cards.',
        '💪',
        'emoji',
        'total_cards_completed',
        10
    ),
    (
        'first_card',
        'Getting Started',
        'Complete your first card.',
        '🎉',
        'emoji',
        'total_cards_completed',
        1
    ),
    (
        'journal_1',
        'First Entry',
        'Write your first journal entry.',
        '🙌',
        'emoji',
        'journal_entries',
        1
    ),
    (
        'journal_words_100',
        'Budding Author',
        'Write 100 words in your journal.',
        '📚',
        'emoji',
        'journal_words',
        100
    );

INSERT INTO
    site_settings (site_name, correct_sound, incorrect_sound)
VALUES
    (
        'Typing Adventure',
        'https://cdn.pixabay.com/download/audio/2025/01/20/audio_9afb73ceb5.mp3',
        'https://cdn.pixabay.com/download/audio/2022/03/19/audio_ac351ae1a4.mp3'
    );
-- FIX: We no longer specify the IDs when seeding Mon Types. PostgreSQL will generate them.
-- START COPYING HERE
INSERT INTO mon_types (name, image_url, bio, evolution_stage, evolves_at_level, next_evolution_id) VALUES
('Bulbasaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', 'There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.', 'first', 16, 2),
('Ivysaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png', 'When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.', 'second', 32, 3),
('Venusaur', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', 'The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.', 'final', null, null),
('Charmander', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', 'It has a preference for hot things. When it rains, steam is said to spout from the tip of its tail.', 'first', 16, 5),
('Charmeleon', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png', 'It has a barbaric nature. In battle, it whips its fiery tail around and slashes away with sharp claws.', 'second', 36, 6),
('Charizard', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', 'It spits fire that is hot enough to melt boulders. It may cause forest fires by blowing flames.', 'final', null, null);

-- FIX: We let the database assign the ID for the pre-assigned mon.
INSERT INTO mons (user_id, mon_type_id, level, experience) VALUES
(1, 4, 1, 10);

