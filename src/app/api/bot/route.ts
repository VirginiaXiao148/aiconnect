import { NextResponse } from "next/server";
import ollama from "ollama";
import { db } from "@/app/query/db";

// Inicializar OpenAI
/* const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}); */

export async function POST(req: Request) {
    try {
        let body;
        try {
            body = await req.json();
            console.log("Recibido en /api/bot:", body);
        } catch (jsonError) {
            console.error("Error al parsear JSON:", jsonError);
            return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
        }

        const { tweetId, content } = body;

        if (!tweetId || !content) {
            console.error("Error: Falta tweetId o content");
            return NextResponse.json({ error: "Faltan datos", received: body }, { status: 400 });
        }

        try {
            console.log("Intentando llamar a OpenAI con:", content);
        
            const response = await ollama.chat({
                model: "llama3",
                messages: [{ role: "user", content: `Responde a este tweet: "${content}"` }],
            });
        
            console.log("Respuesta de OpenAI recibida:", response);
            const botResponse = response.message.content || "No pude generar respuesta.";
        
            try {
                const stmt = db.prepare("INSERT INTO comments (tweetId, content, author) VALUES (?, ?, ?)");
                stmt.run(tweetId, botResponse, "AI_Bot");
                console.log("Insertado en DB correctamente");
            } catch (dbError) {
                console.error("Error al insertar en la base de datos:", dbError);
                return NextResponse.json({ error: "Error de base de datos", details: dbError.message }, { status: 500 });
            }
        
            return NextResponse.json({ success: true, botResponse }, { status: 201 });
        
        } catch (ollamaError) {
            console.error("Error con Ollama:", ollamaError);
            return NextResponse.json({
                error: "Error con Ollama",
                details: ollamaError.message
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error("Error general en /api/bot:", error);
        return NextResponse.json({ error: "Error al generar respuesta", details: error.message }, { status: 500 });
    }
}




