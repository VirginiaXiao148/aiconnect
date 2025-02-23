import sqlite from 'better-sqlite3';

const db = sqlite('database/db.sqlite');

export { db };

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
            FOREIGN KEY (tweetId) REFERENCES tweets(id)
        );
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tweetId INTEGER NOT NULL,
            ip TEXT NOT NULL,
            FOREIGN KEY (tweetId) REFERENCES tweets(id)
        );
    `).run();
}

createTables(); // Asegurar que las tablas existen al ejecutar

// CRUD Usuarios
export function createUser(name, email, password) {
    return db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, password).lastInsertRowid;
}

export function getUserById(id) {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function updateUser(id, name, email, password) {
    return db.prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?").run(name, email, password, id);
}

export function deleteUser(id) {
    return db.prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function getUsers() {
    return db.prepare("SELECT * FROM users").all();
}

// CRUD Tweets
export function createTweet(content, authorId) {
    return db.prepare("INSERT INTO tweets (content, authorId) VALUES (?, ?)").run(content, authorId).lastInsertRowid;
}

export function getTweetById(id) {
    return db.prepare("SELECT * FROM tweets WHERE id = ?").get(id);
}

export function deleteTweet(id) {
    return db.prepare("DELETE FROM tweets WHERE id = ?").run(id);
}

export function getTweets() {
    return db.prepare("SELECT * FROM tweets").all();
}

// CRUD Comentarios
export function createComment(content, authorId, tweetId) {
    return db.prepare("INSERT INTO comments (content, authorId, tweetId) VALUES (?, ?, ?)").run(content, authorId, tweetId).lastInsertRowid;
}

export function getTweetComments(tweetId) {
    return db.prepare("SELECT c.*, u.name as authorName FROM comments c JOIN users u ON c.authorId = u.id WHERE tweetId = ?").all(tweetId);
}

export function updateComment(commentId, content) {
    return db.prepare("UPDATE comments SET content = ? WHERE id = ?").run(content, commentId);
}

export function deleteComment(id) {
    return db.prepare("DELETE FROM comments WHERE id =?").run(id);
}

// CRUD Likes
export function createLike(tweetId, authorId) {
    return db.prepare("INSERT INTO likes (tweetId, authorId) VALUES (?, ?)").run(tweetId, authorId);
}

export function deleteLike(tweetId, authorId) {
    return db.prepare("DELETE FROM likes WHERE tweetId = ? AND authorId = ?").run(tweetId, authorId);
}

// CRUD Notificaciones
export function createNotification(recipientId, type, tweetId, content) {
    return db.prepare("INSERT INTO notifications (recipientId, type, tweetId, content) VALUES (?, ?, ?, ?)").run(recipientId, type, tweetId, content).lastInsertRowid;
}

export function markNotificationAsRead(id) {
    return db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?").run(id);
}

export function getNotifications() {
    return db.prepare("SELECT * FROM notifications").all();
}

export function deleteNotification(id) {
    return db.prepare("DELETE FROM notifications WHERE id = ?").run(id);
}
