import { NextResponse } from "next/server";
import { db } from "@/app/query/db";

export async function POST(req: Request) {
    try {
        const { content, author = "Anónimo" } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "El contenido es obligatorio" }, { status: 400 });
        }

        const createdAt = new Date().toISOString();
        const insert = db.prepare("INSERT INTO tweets (content, author, createdAt) VALUES (?, ?, ?)");
        const result = insert.run(content, author, createdAt);

        console.log("Tweet creado en BD:", { id: result.lastInsertRowid, content, author, createdAt });

        return NextResponse.json({
            success: true,
            tweet: { id: result.lastInsertRowid, content, author, createdAt },
        }, { status: 201 });

    } catch (error) {
        console.error("Error en /api/tweets:", error);
        return NextResponse.json({ error: "Error al publicar tweet" }, { status: 500 });
    }
}

// GET - Obtener tweets
export async function GET() {
    try {
        const tweets = db.prepare("SELECT * FROM tweets ORDER BY createdAt DESC").all();
        return new Response(JSON.stringify(tweets), { status: 200 });
    } catch (error) {
        console.error("Error obteniendo tweets:", error);
        return new Response(JSON.stringify({ error: "Error al obtener tweets" }), { status: 500 });
    }
}