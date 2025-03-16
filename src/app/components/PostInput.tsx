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
            document.getElementById("tweetModal").close();
        }
    };

    return (
        <div className="fixed bottom-5 right-5">
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                onClick={() => document.getElementById("tweetModal").showModal()}
            >
                ➕
            </button>

            <dialog id="tweetModal" className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-4">Nuevo Tweet</h2>
                <input
                    type="text"
                    placeholder="Tu nombre (opcional)"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded-md mb-2"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded-md"
                    placeholder="Escribe tu tweet..."
                ></textarea>
                <div className="mt-4 flex justify-end">
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded-md mr-2"
                        onClick={() => document.getElementById("tweetModal").close()}
                    >
                        Cancelar
                    </button>
                    <button
                        className="bg-green-500 text-white px-3 py-1 rounded-md"
                        onClick={handleSubmit}
                    >
                        Publicar
                    </button>
                </div>
            </dialog>
        </div>
    );
}