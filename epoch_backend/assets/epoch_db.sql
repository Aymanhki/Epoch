-- #######################################################################################################
-- The following script runs every time the server starts,                                               #
-- DO NOT ADD ANYTHING TO THIS SCRIPT THAT YOU DO NOT WANT TO RUN EVERY TIME THE SERVER STARTS           #
-- #######################################################################################################

CREATE TABLE IF NOT EXISTS media_content (
    media_id SERIAL PRIMARY KEY,
    content_type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    associated_user INT NULL,
    path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_pic INT REFERENCES media_content(media_id) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    background_pic INT REFERENCES media_content(media_id) NULL
);

CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    media_id INT REFERENCES media_content(media_id),
    caption TEXT,
    created_at TIMESTAMP NOT NULL,
    release TIMESTAMP NOT NULL,
    favorite_count INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS followers (
    user_id INT REFERENCES users(user_id),
    follower_id INT REFERENCES users(user_id),
    PRIMARY KEY (user_id, follower_id)
);

CREATE TABLE IF NOT EXISTS following (
    user_id INT REFERENCES users(user_id),
    following_id INT REFERENCES users(user_id),
    PRIMARY KEY (user_id, following_id)
);

CREATE TABLE IF NOT EXISTS favorites (
    user_id INT REFERENCES users(user_id),
    post_id INT REFERENCES posts(post_id),
    PRIMARY KEY (user_id, post_id)
);

INSERT INTO media_content (content_type, file_name, path)
SELECT
    'image/png',
    'default_pfp.png',
    'https://storage.googleapis.com/epoch-cloud-storage-media/epoch-media/default_pfp.png'
WHERE NOT EXISTS (
    SELECT 1
    FROM media_content
    WHERE media_id = 1
);

INSERT INTO users (name, username, password, created_at, profile_pic)
SELECT
    'Test User' || i,
    'test' || i,
    'Hkibrahim@3',
    '2024-02-27 07:00:00',
    1
FROM generate_series(1, 5) as i
WHERE NOT EXISTS (
    SELECT 1
    FROM users
    WHERE username = 'test' || i
);

INSERT INTO followers (user_id, follower_id)
SELECT
    u1.user_id,
    u2.user_id
FROM users u1, users u2
WHERE u1.user_id != u2.user_id
    AND NOT EXISTS (
        SELECT 1
        FROM followers
        WHERE user_id = u1.user_id AND follower_id = u2.user_id
    );

INSERT INTO following (user_id, following_id)
SELECT
    u2.user_id,
    u1.user_id
FROM users u1, users u2
WHERE u1.user_id != u2.user_id
    AND NOT EXISTS (
        SELECT 1
        FROM following
        WHERE user_id = u2.user_id AND following_id = u1.user_id
    );

INSERT INTO posts (user_id, media_id, caption, created_at, release)
SELECT
    user_id,
    1,
    'This is a post with #test #hashtags',
    '2024-02-27 07:00:00',
    '2024-02-27 07:00:00'
FROM users
WHERE NOT EXISTS (
    SELECT 1
    FROM posts
    WHERE user_id = users.user_id AND media_id = 1
);

INSERT INTO favorites (user_id, post_id)
SELECT
    f1.user_id,
    p.post_id
FROM followers f1
JOIN posts p ON f1.follower_id = p.user_id
WHERE NOT EXISTS (
    SELECT 1
    FROM favorites
    WHERE user_id = f1.user_id AND post_id = p.post_id
);
