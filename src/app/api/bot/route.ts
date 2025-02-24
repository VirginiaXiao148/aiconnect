import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/app/query/db";

// Inicializar OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("Recibido en /api/bot:", body); // 🔍 Verificar datos recibidos

        const { tweetId, content } = body;

        if (!tweetId || !content) {
            console.error("Error: Falta tweetId o content");
            return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
        }

        // Generar respuesta con OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: `Responde a este tweet: "${content}"` }],
        });

        const botResponse = completion.choices[0]?.message?.content || "No pude generar respuesta.";

        // Guardar en la base de datos
        db.prepare("INSERT INTO comments (tweetId, content, author) VALUES (?, ?, ?)")
            .run(tweetId, botResponse, "AI_Bot");

        console.log("Bot respondió:", botResponse); // 🔍 Verificar respuesta

        return NextResponse.json({ success: true, botResponse }, { status: 201 });
    } catch (error) {
        console.error("Error en /api/bot:", error);
        return NextResponse.json({ error: "Error al generar respuesta" }, { status: 500 });
    }
}