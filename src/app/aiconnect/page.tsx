'use client';

import { useState, useEffect, useMemo } from 'react';
import PostInput from '../components/PostInput';
import TweetCard from '../components/TweetCard';

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');

    const [tweets, setTweets] = useState([]);
    const [likes, setLikes] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Record<string, { id: string, tweetId: string, author: string, content: string, createdAt: string }[]>>({});

    const fetchTweets = async () => {
        try {
            const response = await fetch('/api/tweets');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setTweets(data);
            } else {
                console.error('Expected an array but got:', data);
            }
        } catch (error) {
            console.error('Failed to fetch tweets:', error);
        }
    };

    async function fetchComments(tweetId) {
        try {
            const response = await fetch(`/api/comments?tweetId=${tweetId}`);
            if (!response.ok) throw new Error("Error al obtener comentarios");
    
            const data = await response.json();
            console.log("Comentarios:", data);
    
            setComments(prev => ({
                ...prev,
                [tweetId]: data // Guardar comentarios por tweetId
            }));
        } catch (error) {
            console.error("Error obteniendo comentarios:", error);
        }
    }

    async function fetchLikes(tweetId) {
        try {
            const response = await fetch(`/api/likes?tweetId=${tweetId}`);
            if (!response.ok) throw new Error("Error al obtener likes");
    
            const data = await response.json();
            console.log("Likes:", data);
    
            setLikes((prev) => ({
                ...prev,
                [tweetId]: data // Se asocian los likes con su tweetId
            }));
        } catch (error) {
            console.error("Error obteniendo likes:", error);
        }
    }

    useEffect(() => {
        fetchTweets();
    }, []);

    useEffect(() => {
        tweets.forEach((tweet) => {
            fetchComments(tweet.id); // ✅ Se asegura de cargar comentarios por tweet
            fetchLikes(tweet.id); // ✅ Se asegura de cargar likes por tweet
        });
    }, [tweets]);

    const addTweet = async (username: string, content: string) => {
        try {
            const response = await fetch('/api/tweets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, content }),
            });
    
            if (!response.ok) {
                throw new Error('Error posting tweet');
            }
    
            const newTweet = await response.json();
            console.log("Tweet publicado:", newTweet);
            
            let tweetId;
            if (newTweet && newTweet.tweet && newTweet.tweet.id) {
                tweetId = newTweet.tweet.id;
            } else if (newTweet && newTweet.id) {
                tweetId = newTweet.id;
            }
    
            if (!tweetId) {
                console.error("No se pudo obtener el ID del tweet:", newTweet);
                return;
            }
    
            const tweetContent = newTweet.tweet?.content || content;
            
            const botPayload = {
                tweetId: Number(tweetId),
                content: tweetContent
            };
            
            console.log("Enviando a /api/bot:", JSON.stringify(botPayload));
    
            try {
                const botResponse = await fetch('/api/bot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(botPayload),
                });
                
                const responseText = await botResponse.text();
                console.log(`Respuesta del bot (${botResponse.status}):`, responseText);
                
                if (!botResponse.ok) {
                    throw new Error(`Error del bot: ${botResponse.status} - ${responseText}`);
                }

                fetchComments(tweetId);
                fetchLikes(tweetId);
            } catch (botError) {
                console.error("Error detallado:", botError);
            }

            // Add the new tweet to the state without duplicates
            setTweets((prevTweets) => {
                if (!prevTweets.some(tweet => tweet.id === tweetId)) {
                    return [...prevTweets, newTweet];
                }
                return prevTweets;
            });
        } catch (error) {
            console.error('Failed to post tweet:', error);
        }
    };

    const addComment = async (tweetId, content) => {
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tweetId, content }),
            });
    
            if (!res.ok) {
                throw new Error("Error al agregar comentario");
            }
    
            fetchComments(tweetId); // ✅ ACTUALIZAR COMENTARIOS SOLO SI LA SOLICITUD FUE EXITOSA
        } catch (error) {
            console.error("Error al agregar comentario:", error);
        }
    };
    
    const filteredTweets = useMemo(() => {
        return tweets.filter((tweet) =>
            tweet.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tweets, searchTerm]);

    return (
        <div className="flex flex-col md:flex-row">
            <main className="flex-grow p-4">
                <h1 className="text-2xl font-bold mb-4">AIConnect</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded-md w-full"
                    />
                </div>
                <PostInput addTweet={addTweet} />
                <div className="mt-4">
                    {filteredTweets.map((tweet) => (
                        <TweetCard
                            key={tweet.id}
                            id={tweet.id}
                            username={tweet.username}
                            content={tweet.content}
                            date={tweet.createdAt}
                            likes={likes[tweet.id] || 0}
                            comments={comments[tweet.id] || []}  // ✅ Mostrar comentarios solo si existen
                            fetchComments={() => fetchComments(tweet.id)} // Permitir recarga manual
                            fetchLikes={() => fetchLikes(tweet.id)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}