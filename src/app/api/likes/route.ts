import { db } from "@/app/query/db";

// GET - Obtener likes de un tweet
export async function GET(req) {
    const url = new URL(req.url);
    const tweetId = url.searchParams.get('tweetId');  // Obtener el tweetId desde la URL
    if (!tweetId) {
        return new Response(JSON.stringify({ error: "Falta tweetId" }), { status: 400 });
    }

    const tweetExists = db.prepare("SELECT id FROM tweets WHERE id = ?").get(tweetId);
    if (!tweetExists) {
        return new Response(JSON.stringify({ error: "El tweet no existe" }), { status: 404 });
    }

    const likes = db.prepare("SELECT * FROM likes WHERE tweetId = ?").all(tweetId);
    return new Response(JSON.stringify(likes), { status: 200 });
}

// POST - Registrar un like para un tweet
export async function POST(req) {
    try {
        const { tweetId, ip } = await req.json();

        if (!tweetId || !ip) {
            return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
        }

        const tweetExists = db.prepare("SELECT id FROM tweets WHERE id = ?").get(tweetId);
        if (!tweetExists) {
            return new Response(JSON.stringify({ error: "El tweet no existe" }), { status: 404 });
        }

        // Verificar si el like ya existe para esta IP
        const likeExists = db.prepare("SELECT 1 FROM likes WHERE tweetId = ? AND ip = ?").get(tweetId, ip);
        if (likeExists) {
            return new Response(JSON.stringify({ error: "Ya has dado like a este tweet" }), { status: 409 });
        }

        const stmt = db.prepare("INSERT INTO likes (tweetId, ip) VALUES (?, ?)");
        stmt.run(tweetId, ip);

        return new Response(JSON.stringify({ message: "Like registrado" }), { status: 201 });
    } catch (error) {
        console.error("Error al registrar like:", error);
        return new Response(JSON.stringify({ error: "Error al registrar like" }), { status: 500 });
    }
}