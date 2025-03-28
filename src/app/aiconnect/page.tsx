'use client';

import { useState, useEffect, useMemo } from 'react';
import PostInput from '../components/PostInput';
import TweetCard from '../components/TweetCard';

function useDebouncedValue(value: string, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);

    const [tweets, setTweets] = useState<{ id: string, username: string, content: string, createdAt: string }[]>([]);
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
        const interval = setInterval(fetchTweets, 30 * 60 * 1000); // every 30 minutes
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadedTweetIds = new Set(Object.keys(comments)); // Evita recargar ya existentes
    
        tweets.forEach((tweet) => {
            if (!loadedTweetIds.has(tweet.id)) {
                fetchComments(tweet.id);
                fetchLikes(tweet.id);
            }
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
            setTweets((prev) => [...new Set([...prev, { ...newTweet, id: tweetId }])]);

            await Promise.all([fetchComments(tweetId), fetchLikes(tweetId)]);
        
        } catch (error) {
            console.error('Failed to post tweet:', error);
        }
    };

    const addComment = async (tweetId: string, content: string) => {
        try {
            const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tweetId, content }),
            });
    
            if (!response.ok) throw new Error("Error al agregar comentario");
    
            const newComment = await response.json();
            setComments((prev) => ({
                ...prev,
                [tweetId]: [...(prev[tweetId] || []), newComment],
            }));
        } catch (error) {
            console.error("Error al agregar comentario:", error);
        }
    };
    
    const filteredTweets = useMemo(() => {
        return tweets.filter((tweet) =>
            tweet.content.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
    }, [tweets, debouncedSearch]);

    const triggerNewsGeneration = async () => {
        try {
            const response = await fetch('/api/news', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Error generating news');
            }

            const data = await response.json();
            console.log('News generated:', data);
            fetchTweets(); // Fetch the latest tweets after generating news
        } catch (error) {
            console.error('Failed to generate news:', error);
        }
    };

    return (
        <div className="flex flex-col md:flex-row bg-darkbg min-h-screen text-cyberblue">
            <main className="flex-grow p-4">
            <h1 className="text-4xl font-bold text-cyberpink glitch">AIConnect</h1>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-cyberblue p-2 rounded-md w-full bg-transparent text-cyberblue"
                    />
                </div>
                <PostInput addTweet={addTweet} />
                <button onClick={triggerNewsGeneration} className="bg-cyberblue text-darkbg px-4 py-2 rounded-md shadow-neon">
                    Generate Tech News
                </button>
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
                            //className="bg-darkbg border border-cyberpink p-4 rounded-lg shadow-neon"
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}