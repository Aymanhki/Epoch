-- #######################################################################################################
-- The following script runs every time the server starts,                                               #
-- DO NOT ADD ANYTHING TO THIS SCRIPT THAT YOU DO NOT WANT TO RUN EVERY TIME THE SERVER STARTS           #
-- #######################################################################################################

CREATE TABLE IF NOT EXISTS media_content
(
    media_id        SERIAL PRIMARY KEY,
    content_type    VARCHAR(20)                         NOT NULL,
    file_name       VARCHAR(255)                        NOT NULL,
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    associated_user INT                                 NULL,
    path            TEXT                                NOT NULL
);

CREATE TABLE IF NOT EXISTS users
(
    user_id        SERIAL PRIMARY KEY,
    name           VARCHAR(100)                            NOT NULL,
    username       VARCHAR(50) UNIQUE                      NOT NULL,
    password       VARCHAR(255)                            NOT NULL,
    bio            TEXT,
    profile_pic    INT REFERENCES media_content (media_id) NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP     NOT NULL,
    background_pic INT REFERENCES media_content (media_id) NULL
);


CREATE TABLE IF NOT EXISTS posts
(
    post_id        SERIAL PRIMARY KEY,
    user_id        INT REFERENCES users (user_id),
    media_id       INT REFERENCES media_content (media_id),
    caption        TEXT,
    created_at     TIMESTAMP     NOT NULL,
    release        TIMESTAMP     NOT NULL,
    favorite_count INT DEFAULT 0 NOT NULL,
    votes_count    INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions
(
    session_id TEXT PRIMARY KEY,
    user_id    INT REFERENCES users (user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS followers
(
    user_id     INT REFERENCES users (user_id),
    follower_id INT REFERENCES users (user_id),
    PRIMARY KEY (user_id, follower_id)
);

CREATE TABLE IF NOT EXISTS following
(
    user_id      INT REFERENCES users (user_id),
    following_id INT REFERENCES users (user_id),
    PRIMARY KEY (user_id, following_id)
);

CREATE TABLE IF NOT EXISTS favorites
(
    user_id INT REFERENCES users (user_id),
    post_id INT REFERENCES posts (post_id),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS votes (
    user_id INT REFERENCES users(user_id),
    post_id INT REFERENCES posts(post_id),
    vote    INT NOT NULL,
    PRIMARY KEY (user_id, post_id, vote)
);

CREATE TABLE IF NOT EXISTS comments (
    comm_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id),
    user_id INT REFERENCES users(user_id),
    comment TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    notif_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    type VARCHAR(20) NOT NULL,
    target_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    target_username VARCHAR(50),
    target_name VARCHAR(100)
);

CREATE OR REPLACE FUNCTION check_notification_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM notifications WHERE user_id = NEW.user_id) > 100 THEN
        -- Delete duplicates within the latest 50 notifications
        DELETE FROM notifications
        WHERE user_id = NEW.user_id
        AND notif_id IN (
            SELECT notif_id
            FROM (
                SELECT notif_id,
                       ROW_NUMBER() OVER (PARTITION BY user_id, type, target_id, target_username, target_name ORDER BY created_at DESC) AS rn
                FROM notifications
                WHERE user_id = NEW.user_id
                ORDER BY created_at DESC
                LIMIT 50
            ) AS sub
            WHERE rn > 1
        );

        -- Delete the oldest notifications if count exceeds 100
        DELETE FROM notifications
        WHERE user_id = NEW.user_id
        AND notif_id IN (
            SELECT notif_id
            FROM notifications
            WHERE user_id = NEW.user_id
            ORDER BY created_at
            LIMIT 50
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER notification_count_trigger
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION check_notification_count();

-- insert into media_content (content_type, file_name, path) values ('image/png', 'default_pfp.png', 'https://storage.googleapis.com/epoch-cloud-storage-media/epoch-media/default_pfp.png');
-- insert into media_content (content_type, file_name, path) values ('image/png', 'default_profile_background.png', 'https://storage.googleapis.com/epoch-cloud-storage-media/epoch-media/default_profile_background.png');
