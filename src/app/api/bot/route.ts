import { NextResponse } from "next/server";
import { db } from "@/app/query/db";
import ollama from "ollama";

async function moderateContent(content: string): Promise<boolean> {
    try {
        console.log("Verificando contenido con Ollama...");

        const moderationResponse = await ollama.chat({
            model: "llama3",
            messages: [
                { role: "system", content: "Eres un moderador de contenido. Responde con 'OK' si es apropiado o 'ELIMINAR' si es inapropiado." },
                { role: "user", content: `Revisa este tweet: "${content}"` }
            ],
        });

        const result = moderationResponse.message.content.trim().toUpperCase();
        console.log("Resultado de la moderación:", result);

        return result !== "ELIMINAR";
    } catch (error) {
        console.error("Error en la moderación:", error);
        return false; // Mejor ser conservador y bloquear en caso de error
    }
}

async function generateResponse(content: string): Promise<string | null> {
    try {
        console.log("Generando respuesta con Ollama...");
        const response = await ollama.chat({
            model: "llama3",
            messages: [
                { role: "system", content: "Eres un experto en tecnología. Responde a los tweets con información técnica relevante." },
                { role: "user", content: `Responde a este tweet: "${content}"` }
            ],
        });

        return response.message.content || null;
    } catch (error) {
        console.error("Error generando respuesta con Ollama:", error);
        return null;
    }
}

function saveToDatabase(tweetId: string, botResponse: string): boolean {
    try {
        const createdAt = new Date().toISOString();
        const stmt = db.prepare("INSERT INTO comments (tweetId, content, author, createdAt) VALUES (?, ?, ?, ?)");
        stmt.run(tweetId, botResponse, "AI_Bot", createdAt);
        console.log("Respuesta insertada en la base de datos");
        return true;
    } catch (error) {
        console.error("Error al insertar en la base de datos:", error);
        return false;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Recibido en /api/bot:", body);

        const { tweetId, content } = body;
        if (!tweetId || typeof tweetId !== "string" || !content || typeof content !== "string") {
            return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
        }

        if (!(await moderateContent(content))) {
            return NextResponse.json({ error: "Tweet eliminado por moderación" }, { status: 403 });
        }

        const botResponse = await generateResponse(content);
        if (!botResponse) {
            return NextResponse.json({ error: "No se pudo generar respuesta" }, { status: 500 });
        }

        if (!saveToDatabase(tweetId, botResponse)) {
            return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
        }

        return NextResponse.json({ success: true, botResponse }, { status: 201 });

    } catch (error) {
        console.error("Error en /api/bot:", error);
        return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 });
    }
}