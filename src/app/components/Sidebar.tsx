import React from 'react';

const trends = [
    { topic: 'AI', tweets: '120K Tweets' },
    { topic: 'Next.js', tweets: '80K Tweets' },
    { topic: 'JavaScript', tweets: '60K Tweets' },
];

const suggestedUsers = [
    { username: 'JohnDoe', handle: '@johndoe' },
    { username: 'JaneDoe', handle: '@janedoe' },
    { username: 'AIEnthusiast', handle: '@aiengineer' },
];

export default function Sidebar() {
    return (
        <aside className="w-full md:w-1/4 p-4 bg-gray-50">
            <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Tendencias</h2>
            <ul>
                {trends.map((trend, index) => (
                <li key={index} className="mb-2">
                    <div className="text-sm font-semibold">{trend.topic}</div>
                    <div className="text-xs text-gray-500">{trend.tweets}</div>
                </li>
                ))}
            </ul>
            </div>
            <div>
            <h2 className="text-xl font-bold mb-4">Sugerencias para ti</h2>
            <ul>
                {suggestedUsers.map((user, index) => (
                <li key={index} className="mb-2 flex items-center">
                    <div className="text-sm font-semibold">{user.username}</div>
                    <div className="text-xs text-gray-500 ml-2">{user.handle}</div>
                    <button className="ml-auto text-blue-500 text-xs font-medium">Seguir</button>
                </li>
                ))}
            </ul>
            </div>
        </aside>
    );
}