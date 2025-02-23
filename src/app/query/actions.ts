import { openDb } from '../sqlite/sqlite';
import { z } from 'zod';

const userSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    email: z.string(),
    password: z.string(),
    createdAt: z.string().optional()
});

const tweetSchema = z.object({
    id: z.number().optional(),
    content: z.string(),
    authorId: z.string(),
    retweets: z.number().optional(),
});

const commentSchema = z.object({
    id: z.number().optional(),
    content: z.string(),
    authorId: z.string(),
    tweetId: z.string(),
});

const likeSchema = z.object({
    id: z.number().optional(),
    authorId: z.string(),
    tweetId: z.string().optional(),
});

const notificationSchema = z.object({
    id: z.number().optional(),
    recipientId: z.string(),
    type: z.enum(['like', 'retweet', 'comment']),
    tweetId: z.string().optional(),
});

export async function createTables() {
    const db = await openDb();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tweets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            authorId INTEGER NOT NULL,
            retweets INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (authorId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tweetId INTEGER NOT NULL,
            authorId INTEGER NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tweetId) REFERENCES tweets(id),
            FOREIGN KEY (authorId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tweetId INTEGER NOT NULL,
            authorId INTEGER NOT NULL,
            FOREIGN KEY (tweetId) REFERENCES tweets(id),
            FOREIGN KEY (authorId) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipientId INTEGER NOT NULL,
            type TEXT NOT NULL,
            tweetId INTEGER,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (recipientId) REFERENCES users(id),
            FOREIGN KEY (tweetId) REFERENCES tweets(id)
        );
    `);
}

// Llamar a la función para crear las tablas
createTables();

// User CRUD
export async function createUser(user: z.infer<typeof userSchema>) {
    const db = await openDb();
    const validatedUser = userSchema.parse(user);
    await db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [validatedUser.name, validatedUser.email, validatedUser.password]);
}

export async function getUsers() {
    const db = await openDb();
    const result = await db.all(`SELECT * FROM users`);
    return result;
}

export async function updateUser(user: z.infer<typeof userSchema>) {
    const db = await openDb();
    const validatedUser = userSchema.parse(user);
    await db.run(`UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`, [validatedUser.name, validatedUser.email, validatedUser.password, validatedUser.id]);
}

export async function deleteUser(id: number) {
    const db = await openDb();
    await db.run(`DELETE FROM users WHERE id = ?`, [id]);
}

export async function getUserByName(name: string) {
    const db = await openDb();
    const result = await db.get(`SELECT * FROM users WHERE name = ?`, [name]);
    return result;
}

// Tweet CRUD
export async function createTweet(tweet: z.infer<typeof tweetSchema>) {
    const db = await openDb();
    const validatedTweet = tweetSchema.parse(tweet);
    await db.run(`INSERT INTO tweets (content, authorId, retweets) VALUES (?, ?, ?)`, [validatedTweet.content, validatedTweet.authorId, validatedTweet.retweets]);
}

export async function getTweets() {
    const db = await openDb();
    const result = await db.all(`SELECT * FROM tweets`);
    return result;
}

export async function updateTweet(tweet: z.infer<typeof tweetSchema>) {
    const db = await openDb();
    const validatedTweet = tweetSchema.parse(tweet);
    await db.run(`UPDATE tweets SET content = ?, authorId = ?, retweets = ? WHERE id = ?`, [validatedTweet.content, validatedTweet.authorId, validatedTweet.retweets, validatedTweet.id]);
}

export async function deleteTweet(id: number) {
    const db = await openDb();
    await db.run(`DELETE FROM tweets WHERE id = ?`, [id]);
}

// Comment CRUD
export async function createComment(comment: z.infer<typeof commentSchema>) {
    const db = await openDb();
    const validatedComment = commentSchema.parse(comment);
    await db.run(`INSERT INTO comments (content, authorId, tweetId) VALUES (?, ?, ?)`, [validatedComment.content, validatedComment.authorId, validatedComment.tweetId]);
}

export async function getComments() {
    const db = await openDb();
    const result = await db.all(`SELECT * FROM comments`);
    return result;
}

export async function updateComment(comment: z.infer<typeof commentSchema>) {
    const db = await openDb();
    const validatedComment = commentSchema.parse(comment);
    await db.run(`UPDATE comments SET content = ?, authorId = ?, tweetId = ? WHERE id = ?`, [validatedComment.content, validatedComment.authorId, validatedComment.tweetId, validatedComment.id]);
}

export async function deleteComment(id: number) {
    const db = await openDb();
    await db.run(`DELETE FROM comments WHERE id = ?`, [id]);
}

// Like CRUD
export async function createLike(like: z.infer<typeof likeSchema>) {
    const db = await openDb();
    const validatedLike = likeSchema.parse(like);
    await db.run(`INSERT INTO likes (authorId, tweetId) VALUES (?, ?)`, [validatedLike.authorId, validatedLike.tweetId]);
}

export async function getLikes() {
    const db = await openDb();
    const result = await db.all(`SELECT * FROM likes`);
    return result;
}

export async function updateLike(like: z.infer<typeof likeSchema>) {
    const db = await openDb();
    const validatedLike = likeSchema.parse(like);
    await db.run(`UPDATE likes SET authorId = ?, tweetId = ? WHERE id = ?`, [validatedLike.authorId, validatedLike.tweetId, validatedLike.id]);
}

export async function deleteLike(id: number) {
    const db = await openDb();
    await db.run(`DELETE FROM likes WHERE id = ?`, [id]);
}

// Notification CRUD
export async function createNotification(notification: z.infer<typeof notificationSchema>) {
    const db = await openDb();
    const validatedNotification = notificationSchema.parse(notification);
    await db.run(`INSERT INTO notifications (recipientId, type, tweetId) VALUES (?, ?, ?)`, [validatedNotification.recipientId, validatedNotification.type, validatedNotification.tweetId]);
}

export async function getNotifications() {
    const db = await openDb();
    const result = await db.all(`SELECT * FROM notifications`);
    return result;
}

export async function deleteNotification(id: number) {
    const db = await openDb();
    await db.run(`DELETE FROM notifications WHERE id = ?`, [id]);
}