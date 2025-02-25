'use client';

import { useState, useEffect } from 'react';
import PostInput from '../components/PostInput';
import TweetCard from '../components/TweetCard';

export default function Home() {
    const [tweets, setTweets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        fetchTweets();
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
            console.log("Tweet publicado:", newTweet); // 🔍 Verificar contenido del tweet
            
            // Verifica la estructura exacta del objeto retornado
            //const tweetId = newTweet.id || (newTweet.tweet && newTweet.tweet.id);
            
            // Extraer el ID de forma segura sin depender de una estructura específica
            let tweetId;
            if (typeof newTweet === 'object') {
                // Intenta obtener el ID directamente o de posibles estructuras anidadas
                tweetId = newTweet.id ||
                        (newTweet.tweet && newTweet.tweet.id) ||
                        (newTweet.data && newTweet.data.id);
            }

            if (!tweetId) {
                console.error("No se pudo obtener el ID del tweet:", newTweet);
                return;
            }

            const botPayload = { tweetId, content };
            console.log("Enviando a /api/bot:", botPayload); // 🔍 Aquí `tweetId` es undefined
            console.log("id del tweet:", newTweet.id); // 🔍 Verificar que el id del tweet sea correcto
            console.log('tweetId: ', tweetId); // 🔍 Verificar que el tweetId sea correcto
            console.log("id del tweet: ", newTweet.tweet.id);

            console.log(JSON.stringify(newTweet)); // 🔍 Verificar el formato completo

            await fetch('/api/bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botPayload),
            });

            console.log(JSON.stringify(newTweet)); // 🔍 Verificar el formato completo
    
            fetchTweets();
        } catch (error) {
            console.error('Failed to post tweet:', error);
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