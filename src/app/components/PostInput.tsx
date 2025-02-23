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
        <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-md">
            <input
                type="text"
                placeholder="Tu nombre (opcional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border p-2 rounded-md w-full"
            />
            <textarea
                placeholder="¿Qué está pasando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border p-2 rounded-md w-full mt-2"
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-400">
                Tweet
            </button>
        </form>
    );
}
