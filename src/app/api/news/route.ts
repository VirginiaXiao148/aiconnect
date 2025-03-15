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

// Función para obtener noticias actuales desde una API externa
async function fetchLatestNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?category=technology&apiKey=f39bbb58f7a140b1ae0936e85dd1b19a`);
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
            throw new Error("No se encontraron noticias recientes");
        }

        // Obtener el primer titular relevante
        return data.articles[0].title + " - " + data.articles[0].description;
    } catch (error) {
        console.error("Error obteniendo noticias:", error);
        return null;
    }
}

// Generar una noticia con la IA basada en un titular real
async function generateNews() {
    try {
        console.log("Obteniendo noticia actual...");
        const latestNews = await fetchLatestNews();

        if (!latestNews) {
            console.error("No se pudo obtener una noticia real");
            return;
        }

        console.log("Generando noticia con IA basada en:", latestNews);

        const response = await ollama.chat({
            model: "llama3",
            messages: [
                { role: "system", content: "Eres un periodista de tecnología. Basado en la siguiente noticia, genera un resumen con contexto adicional: " + latestNews }
            ]
        });

        const newsContent = response.message.content.trim();
        console.log("Noticia generada:", newsContent);

        if (!newsContent) {
            throw new Error("No se pudo generar la noticia");
        }

        // Guardar en la base de datos
        saveToDatabase(newsContent);
    } catch (error) {
        console.error("Error generando noticia:", error);
    }
}

// Generar noticias cada 6 horas
setInterval(generateNews, 6 * 60 * 60 * 1000);

export async function POST() {
    try {
        await generateNews();
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error en la generación de noticias" }, { status: 500 });
    }
}