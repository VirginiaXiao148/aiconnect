import { db } from "@/app/query/db";

// GET - Obtener comentarios de un tweet
export async function GET(req: Request) {
    const url = new URL(req.url);
    const tweetId = url.searchParams.get('tweetId');  // Obtener el tweetId desde la URL
    if (!tweetId) {
        return new Response(JSON.stringify({ error: "Falta tweetId" }), { status: 400 });
    }

    const tweetExists = db.prepare("SELECT id FROM tweets WHERE id = ?").get(tweetId);
    if (!tweetExists) {
        return new Response(JSON.stringify({ error: "El tweet no existe" }), { status: 404 });
    }

    const comments = db.prepare("SELECT * FROM comments WHERE tweetId = ? ORDER BY createdAt DESC").all(tweetId);
    return new Response(JSON.stringify(comments), { status: 200 });
}

// POST - Comentar un tweet
export async function POST(req: Request) {
    try {
        const { tweetId, content, author = "Anónimo" } = await req.json();

        if (!tweetId || !content.trim()) {
            return new Response(JSON.stringify({ error: "Faltan datos o contenido inválido" }), { status: 400 });
        }

        // Verificar si el tweet existe
        const tweetExists = db.prepare("SELECT id FROM tweets WHERE id = ?").get(tweetId);
        if (!tweetExists) {
            return new Response(JSON.stringify({ error: "El tweet no existe" }), { status: 404 });
        }

        // Insertar el comentario
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO comments (tweetId, content, author, createdAt) VALUES (?, ?, ?, ?)")
            .run(tweetId, content, author, createdAt);

        return new Response(JSON.stringify({
            success: true,
            comment: { id: result.lastInsertRowid, tweetId, content, author, createdAt }
        }), { status: 201 });

    } catch (error) {
        console.error("Error al comentar:", error);
        return new Response(JSON.stringify({ error: "Error al comentar" }), { status: 500 });
    }
}