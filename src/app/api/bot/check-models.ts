import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function checkModels() {
    try {
        // Opción 1: Listar todos los modelos disponibles
        const models = await openai.models.list();
        console.log("Modelos disponibles:", models.data.map(m => m.id));
        
        // Opción 2: Verificar GPT-4 específicamente
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: "Hola" }],
                max_tokens: 5
            });
            console.log("GPT-4 está disponible:", completion);
        } catch (error) {
            console.error("Error con GPT-4:", error.message);
        }
    } catch (error) {
        console.error("Error al verificar modelos:", error);
    }
}

checkModels();
