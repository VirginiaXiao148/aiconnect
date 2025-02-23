import sqlite from 'better-sqlite3';

const db = sqlite('database/db.sqlite');

export function createTables() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tweets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            author TEXT DEFAULT 'Anónimo',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tweetId INTEGER NOT NULL,
            author TEXT DEFAULT 'Anónimo',
            content TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tweetId) REFERENCES tweets(id) ON DELETE CASCADE
        );
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_comments_tweetId ON comments(tweetId);
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tweetId INTEGER NOT NULL,
            ip TEXT NOT NULL,
            FOREIGN KEY (tweetId) REFERENCES tweets(id) ON DELETE CASCADE,
            UNIQUE (tweetId, ip)
        );
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_likes_tweetId ON likes(tweetId);
    `).run();
}

createTables();
