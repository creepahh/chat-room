import React from 'react'

const Page = () => {
  return (
    <div>
        <h1 className="text-3xl font-bold text-center mt-10">Welcome to the Chat Room</h1>
        <p className="text-center mt-4">Please navigate to the chat page to start chatting!</p>
        <div className="flex justify-center mt-8">
            <a href="/chat" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Go to Chat</a>
        </div>
    </div>
  )
}

export default Page
