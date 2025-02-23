import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testOpenAI() {
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: "Dime un chiste corto" }],
    });

    console.log(response.choices[0].message.content);
}

testOpenAI();