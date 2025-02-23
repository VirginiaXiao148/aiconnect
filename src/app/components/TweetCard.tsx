import React, { useState } from 'react';

interface TweetCardProps {
    id: string;
    username: string;
    content: string;
    date: string;
}

const TweetCard: React.FC<TweetCardProps> = ({ id, username, content, date }) => {
    const [likes, setLikes] = useState(0);
    const [retweets, setRetweets] = useState(0);
    const [comments, setComments] = useState<string[]>([]);
    const [newComment, setNewComment] = useState('');

    const handleLike = async () => {
        setLikes(likes + 1);
        await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: id }),
        });
    };

    const handleRetweet = () => setRetweets(retweets + 1);

    const handleComment = async () => {
        if (newComment.trim() !== '') {
            setComments([...comments, newComment]);
            await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tweetId: id, content: newComment }),
            });
            setNewComment('');
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
                <button onClick={handleRetweet} className="text-green-500">🔁 {retweets}</button>
            </div>
            <div className="mt-2">
                <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="border p-1 rounded w-full"
                />
                <button onClick={handleComment} className="bg-blue-500 text-white px-2 py-1 rounded mt-1">Comentar</button>
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