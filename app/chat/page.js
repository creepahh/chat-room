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
        <div className="flex flex-col h-screen p-4 bg-gray-100 text-black">
            <h1 className="text-2xl font-bold mb-4">💬 Real-time Chatroom</h1>

            {/* set useename */}
            {!isUsernameSet && (
                <div className="flex flex-col items-center mb-4">
                    <input
                        className="border p-2 mb-2 rounded"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={setUserName}
                    >
                        Set Username
                    </button>
                </div>
            )}

            {/* text display */}
            <div className="flex-1 overflow-y-auto mb-4 border rounded p-2 bg-white">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-2 p-2 bg-blue-500 text-white rounded shadow">
                        <strong>{msg.sender}: </strong>{msg.text}
                    </div>
                ))}
            </div>

            {/* input  */}
            <div className="flex gap-2">
                <input
                    className="flex-1 border p-2 rounded"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    )
}
