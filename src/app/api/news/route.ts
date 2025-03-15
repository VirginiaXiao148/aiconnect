import { NextResponse } from "next/server";
import { db } from "@/app/query/db";
import ollama from "ollama";

function saveToDatabase(content: string): boolean {
    try {
        const createdAt = new Date().toISOString();
        const stmt = db.prepare("INSERT INTO tweets (content, author, createdAt) VALUES (?, ?, ?)");
        stmt.run(content, "AI_Bot", createdAt);
        console.log("Respuesta insertada en la base de datos");
        return true;
    } catch (error) {
        console.error("Error al insertar en la base de datos:", error);
        return false;
    }
}

export async function generateNews() {
    try {
        console.log('Generando noticias con Ollama...');
        const response = await ollama.chat({
            model: "llama3",
            messages: [
                { role: "system", content: "Eres un periodista tecnológico. Genera una noticia corta y relevante sobre inteligencia artificial, ciberseguridad o avances en software." }
            ],
        });

        const news = response.message.content;
        console.log('Noticia generada:', news);

        if (!news) {
            return NextResponse.json({ error: "No se pudo generar la noticia" }, { status: 500 });
        }

        saveToDatabase(news);

        return NextResponse.json({ success: true, content: news }, { status: 201 });

    } catch (error) {
        console.error("Error generando noticia:", error);
        return NextResponse.json({ error: "Error en la generación de noticias" }, { status: 500 });
    }
}

// Create a new post every 6 hours
setInterval(generateNews, 6 * 60 * 60 * 1000);

// Create a new post every minute
// setInterval(generateNews, 1 * 60 * 1000);

export async function POST() {
    try {
        await generateNews();
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error en la generación de noticias" }, { status: 500 });
    }
}