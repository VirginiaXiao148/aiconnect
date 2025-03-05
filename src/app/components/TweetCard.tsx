import React, { useState, useEffect } from 'react';

interface TweetCardProps {
    id: string;
    username: string;
    content: string;
    date: string;
    likes: number;
    comments: any[];
    fetchComments: () => Promise<void>;
    fetchLikes: () => Promise<void>;
}

const TweetCard: React.FC<TweetCardProps> = ({ id, username, content, date }) => {
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState<string[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false); // Controla el estado del botón de comentar

    useEffect(() => {
        // Cargar los likes, retweets y comentarios desde la API
        const fetchData = async () => {
            try {
                const [likesRes, commentsRes] = await Promise.all([
                    fetch(`/api/likes?tweetId=${id}`),
                    fetch(`/api/comments?tweetId=${id}`)
                ]);

                if (likesRes.ok) {
                    const likesData = await likesRes.json();
                    setLikes(likesData.likes);
                }

                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData);
                }
            } catch (error) {
                console.error("Error cargando datos del tweet:", error);
            }
        };

        fetchData();
    }, [id]);

    const handleLike = async () => {
        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tweetId: id }),
            });

            if (response.ok) {
                setLikes(likes + 1);
            }
        } catch (error) {
            console.error("Error al dar like:", error);
        }
    };

    const handleComment = async () => {
        if (newComment.trim() === '') return;

        setLoading(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tweetId: id, content: newComment }),
            });

            if (response.ok) {
                setComments([...comments, newComment]);
                setNewComment('');
            }
        } catch (error) {
            console.error("Error al agregar comentario:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 shadow-md bg-white mb-4">
            <div className="flex items-center mb-2">
                <div className="font-bold text-lg">{username}</div>
                <div className="text-gray-500 text-sm ml-auto">{date}</div>
            </div>
            <div className="text-gray-800 mb-2">{content}</div>
            <div className="flex space-x-4 mt-2">
                <button onClick={handleLike} className="text-blue-500">👍 {likes}</button>
            </div>
            <div className="mt-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="border p-1 rounded w-full"
                />
                <button
                    onClick={handleComment}
                    className="bg-blue-500 text-white px-2 py-1 rounded mt-1 disabled:opacity-50"
                    disabled={loading} // Deshabilita el botón si está en proceso de envío
                >
                    {loading ? "Comentando..." : "Comentar"}
                </button>
                <div className="mt-2">
                    {comments.map((comment, index) => (
                        <p key={index} className="text-gray-700">💬 {comment}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TweetCard;