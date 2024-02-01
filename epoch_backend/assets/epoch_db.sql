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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);


CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    media_id INT REFERENCES media_content(media_id),
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    release TIMESTAMP
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
-- How to get followers for a given user in Python
-- def get_followers(user_id):
--     cur.execute("SELECT follower_id FROM followers WHERE user_id = %s", (user_id,))
--     followers = [follower[0] for follower in cur.fetchall()]
--     return followers

CREATE TABLE IF NOT EXISTS following (
    user_id INT REFERENCES users(user_id),
    following_id INT REFERENCES users(user_id),
    PRIMARY KEY (user_id, following_id)
);
-- How to get users following by a given user in Python
-- def get_following(user_id):
--     cur.execute("SELECT following_id FROM following WHERE user_id = %s", (user_id,))
--     following = [following_id[0] for following_id in cur.fetchall()]
--     return following


-- INSERT INTO  media_content (content_type, file_name, path) VALUES ('image/png', 'default_pfp.png', '../epoch_backend/assets/epoch_media/default_pfp.png');
