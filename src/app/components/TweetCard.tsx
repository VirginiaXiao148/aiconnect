import React, { useState } from 'react';

interface Comment {
    id: string;
    tweetId: string;
    author: string;
    content: string;
    createdAt: string;
}

interface TweetCardProps {
    id: string;
    username: string;
    content: string;
    date: string;
    likes: number;
    comments: Comment[];
    fetchComments: () => Promise<void>;
    fetchLikes: () => Promise<void>;
}

const TweetCard: React.FC<TweetCardProps> = ({ id, username, content, date, likes, comments, fetchComments, fetchLikes }) => {
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tweetId: id }),
            });

            if (response.ok) {
                fetchLikes();
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
                fetchComments();
                setNewComment('');
            }
        } catch (error) {
            console.error("Error al agregar comentario:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-2 border-cyberpink bg-darkbg p-4 rounded-xl shadow-neon transition-all hover:scale-105">
            {/* Nombre de usuario y fecha */}
            <div className="flex items-center mb-2">
                <h2 className="text-cyberblue text-lg font-bold">@{username}</h2>
                <span className="text-cybergreen text-sm ml-auto">{date}</span>
            </div>

            {/* Contenido del Tweet */}
            <p className="tweet-text">{content}</p>

            {/* Likes */}
            <div className="flex space-x-4 mt-2">
                <button 
                    onClick={handleLike} 
                    className="text-cybergreen hover:text-cyberorange transition-all"
                >
                    👍 {likes}
                </button>
            </div>

            {/* Comentarios */}
            <div className="mt-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="border border-cyberblue bg-transparent text-cyberblue p-1 rounded w-full placeholder-gray-500"
                />
                <button
                    onClick={handleComment}
                    className="bg-cyberpink text-white px-3 py-1 rounded mt-1 disabled:opacity-50 hover:shadow-neon"
                    disabled={loading}
                >
                    {loading ? "Comentando..." : "Comentar"}
                </button>
                <div className="mt-2">
                    {comments.map((comment) => (
                        <p key={comment.id} className="text-cybergreen">💬 {comment.content}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TweetCard;