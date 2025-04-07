'use client'

import { useEffect, useState } from 'react'
import io from 'socket.io-client'

let socket

export default function ChatPage() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [username, setUsername] = useState('')
    const [isUsernameSet, setIsUsernameSet] = useState(false)

    useEffect(() => {
        if (isUsernameSet) {

            socket = io({ path: '/api/socket' })

            socket.on('message', (msg) => {
                setMessages(prev => [...prev, msg])
            })

            return () => {
                socket.disconnect()
            }
        }
    }, [isUsernameSet])

    const setUserName = () => {
        if (!username.trim()) return
        setIsUsernameSet(true)
    }

    const sendMessage = () => {
        if (!input.trim()) return

        const msg = {
            text: input.trim(),
            sender: username,
            id: Date.now()
        }

        setMessages(prev => [...prev, msg]) //local state updated by new msg 
        socket.emit('message', msg)
        setInput('')
    }

    return (
        <div className="flex flex-col h-screen p-4 bg-[#f5f5dc] text-black">
            <h1 className="text-2xl font-bold mb-4 text-center">💬 Real-time Chatroom</h1>

            {/* Set Username */}
            {!isUsernameSet && (
                <div className="flex flex-col items-center mb-4">
                    <input
                        className="border p-2 mb-2 rounded w-64"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                        onClick={setUserName}
                    >
                        Set Username
                    </button>
                </div>
            )}

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto mb-6 border rounded p-4 bg-[#fffaf0] shadow-inner space-y-2">
                {messages.map((msg) => {
                    const isOwnMessage = msg.sender === username;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs px-4 py-2 rounded-lg shadow 
                        ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
                                <strong className="block text-sm">
                                    {isOwnMessage ? 'You' : msg.sender}
                                </strong>
                                <span>{msg.text}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Box */}
            <div className="flex gap-2 mt-auto pt-2">
                <input
                    className="flex-1 border border-gray-400 p-2 rounded shadow"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>

    )
}
