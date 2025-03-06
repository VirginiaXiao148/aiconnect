import { NextResponse } from "next/server";
import { db } from "@/app/query/db";
import ollama from "ollama"; // Importamos Ollama

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

        // 📌 **Paso 1: Moderar el contenido antes de responder**
        let moderationResult = "OK";
        try {
            console.log("Verificando contenido con Ollama...");

            const moderationResponse = await ollama.chat({
                model: "llama3",
                messages: [
                    { role: "system", content: "Eres un moderador de contenido. Revisa el siguiente tweet y responde con 'OK' si es apropiado o 'ELIMINAR' si es inapropiado." },
                    { role: "user", content: `Revisa este tweet: "${content}"` }
                ],
            });

            moderationResult = moderationResponse.message.content.trim();
            console.log("Resultado de la moderación:", moderationResult);

            if (moderationResult.toUpperCase() === "ELIMINAR") {
                console.warn("Tweet eliminado por contenido inapropiado:", content);
                return NextResponse.json({ error: "Tweet eliminado por moderación" }, { status: 403 });
            }

        } catch (moderationError) {
            console.error("Error en la moderación:", moderationError);
            // Fallback to allow the tweet if moderation fails
            moderationResult = "OK";
        }

        // 📌 **Paso 2: Generar respuesta con la IA**
        try {
            console.log("Generando respuesta con Ollama...");
            const response = await ollama.chat({
                model: "llama3",
                messages: [{ role: "user", content: `Responde a este tweet: "${content}"` }],
            });

            const botResponse = response.message.content || "No pude generar respuesta.";

            // 📌 **Paso 3: Guardar la respuesta en la base de datos**
            try {
                const createdAt = new Date().toISOString();
                const stmt = db.prepare("INSERT INTO comments (tweetId, content, author, createdAt) VALUES (?, ?, ?, ?)");
                stmt.run(tweetId, botResponse, "AI_Bot", createdAt);
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