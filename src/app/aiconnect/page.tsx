'use client';

import { useState, useEffect } from 'react';
import PostInput from '../components/PostInput';
import TweetCard from '../components/TweetCard';

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');

    const [tweets, setTweets] = useState([]);
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);


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

    const fetchComments = async () => {
        const response = await fetch('/api/comments');
        const data = await response.json();
        setComments(data);
    };

    const fetchLikes = async () => {
        const response = await fetch('/api/likes');
        const data = await response.json();
        setLikes(data);
    };

    useEffect(() => {
        fetchTweets();
        fetchComments();
        fetchLikes();
    }, []);

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
            
            // Extraer el ID correctamente según la estructura que muestran los logs
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
    
            // Usar el contenido correcto
            const tweetContent = newTweet.tweet?.content || content;
            
            const botPayload = {
                tweetId: Number(tweetId), // Asegurarse que sea número si tu API lo espera así
                content: tweetContent
            };
            
            console.log("Enviando a /api/bot:", JSON.stringify(botPayload));
    
            // Probar con fetch manualmente para ver el error completo
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

                fetchComments();
                fetchLikes();
            } catch (botError) {
                console.error("Error detallado:", botError);
            }
            
            fetchTweets();
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
    
            fetchComments(); // ✅ ACTUALIZAR COMENTARIOS SOLO SI LA SOLICITUD FUE EXITOSA
        } catch (error) {
            console.error("Error al agregar comentario:", error);
        }
    };
    
    const filteredTweets = tweets.filter((tweet) =>
        tweet.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}