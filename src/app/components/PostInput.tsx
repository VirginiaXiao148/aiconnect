import { useState } from "react";

export default function PostInput({ addTweet }) {
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("/api/tweets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, author: author || "Anónimo" }),
        });

        if (response.ok) {
            setContent("");
            setAuthor("");
            addTweet(author || "Anónimo", content);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-black shadow-neon rounded-md">
            <input
                type="text"
                placeholder="Tu nombre (opcional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border border-primary p-2 rounded-md w-full bg-black text-foreground placeholder-secondary"
            />
            <textarea
                placeholder="¿Qué está pasando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border border-primary p-2 rounded-md w-full mt-2 bg-black text-foreground placeholder-secondary"
            />
            <button type="submit" className="w-full p-2 bg-primary text-background rounded-md hover:bg-secondary shadow-neon">
                Tweet
            </button>
        </form>
    );
}