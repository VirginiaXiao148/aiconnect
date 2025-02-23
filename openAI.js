import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "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",
});

const completion = openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
        {"role": "user", "content": "write a haiku about ai"},
    ],
});

completion.then((result) => console.log(result.choices[0].message));