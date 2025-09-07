import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to Socket.IO server
const socket = io("/api/socket");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Listen for incoming messages
    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("message");  // Clean up when the component unmounts
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = { user: "You", text: input };
    socket.emit("message", msg);  // Emit the message to the server
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className="p-3 bg-gray-200 rounded text-gray-800">
              <span className="font-bold">{msg.user}:</span> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex mt-4">
          <input
            className="flex-grow border border-gray-300 rounded-l px-4 py-2 focus:outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
