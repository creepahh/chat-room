'use client'

import { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'

let socket

export default function ChatPage() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [username, setUsername] = useState('')
    const [isUsernameSet, setIsUsernameSet] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (isUsernameSet) {
            socket = io({ path: '/api/socket' })

            socket.on('message', (msg) => {
                setMessages(prev => [...prev, msg])
            })

            socket.on('typing', () => {
                setIsTyping(true)
                setTimeout(() => setIsTyping(false), 1000)
            })

            return () => socket.disconnect()
        }
    }, [isUsernameSet])

    useEffect(() => {
        // Scroll to bottom when messages update
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const setUserName = () => {
        if (!username.trim()) return
        setIsUsernameSet(true)
    }

    const sendMessage = () => {
        if (!input.trim()) return

        const msg = {
            text: input.trim(),
            sender: username,
            id: Date.now(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, msg])
        socket.emit('message', msg)
        setInput('')
    }

    const handleTyping = (e) => {
        setInput(e.target.value)
        socket.emit('typing')
    }

    const getInitials = (name) => {
        return name?.slice(0, 1).toUpperCase()
    }

    return (
        <div className="flex flex-col h-screen bg-[#e5ddd5]">
            <header className="bg-blue-600 text-white text-center py-4 font-bold text-xl shadow">
                💬 ChatRoom Thingy
            </header>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => {
                    const isOwn = msg.sender === username
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end`}>
                            {!isOwn && (
                                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center mr-2 text-xs font-semibold">
                                    {getInitials(msg.sender)}
                                </div>
                            )}
                            <div
                                className={`max-w-xs sm:max-w-sm px-4 py-2 rounded-2xl text-sm shadow-md relative ${isOwn
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-200 text-black rounded-bl-none'
                                    }`}
                            >
                                {!isOwn && (
                                    <div className="text-xs font-semibold text-gray-700 mb-1">{msg.sender}</div>
                                )}
                                {msg.text}
                                <div className="text-[10px] opacity-70 mt-1 text-right">
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
                {isTyping && (
                    <div className="text-xs text-gray-500 italic mt-2 ml-2">फलानो is typing...</div>
                )}
            </div>

            {/* Username input */}
            {!isUsernameSet && (
                <div className="p-4 bg-white border-t flex flex-col items-center gap-3 shadow">
                    <input
                        className="border rounded p-2 w-full max-w-sm text-center shadow"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
                        onClick={setUserName}
                    >
                        Join Chat
                    </button>
                </div>
            )}

            {/* Message input */}
            {isUsernameSet && (
                <div className="p-4 bg-white border-t flex gap-2 items-center shadow">
                    <input
                        className="flex-1 border rounded p-3 shadow"
                        value={input}
                        onChange={handleTyping}
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
            )}
        </div>
    )
}
