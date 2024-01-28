DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'epoch_db') THEN
        CREATE DATABASE epoch_db;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = 'epoch_admin') THEN
        CREATE USER epoch_admin WITH PASSWORD 'Epoch@3';
    END IF;

    ALTER ROLE epoch_admin SET client_encoding TO 'utf8';
    ALTER ROLE epoch_admin SET timezone TO 'UTC';
    GRANT ALL PRIVILEGES ON DATABASE epoch_db TO epoch_admin;
END $$;

CREATE TABLE IF NOT EXISTS media_content (
    media_id SERIAL PRIMARY KEY,
    content_type VARCHAR(20) NOT NULL,
    content_data BYTEA NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_pic INT REFERENCES media_content(media_id),
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
