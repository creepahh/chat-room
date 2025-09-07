import { Server } from "socket.io"
import { createClient } from 'webdav'
import { v4 as uuidv4 } from 'uuid'

let io

const client = createClient(
  process.env.NEXTCLOUD_URL,
  {
    username: process.env.NEXTCLOUD_USER,
    password: process.env.NEXTCLOUD_PASS
  }
)

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("🔌 Starting Socket.IO server...")

        io = new Server(res.socket.server, {
            path: "/api/socket", 
        })

        res.socket.server.io = io

        io.on("connection", async (socket) => {
            console.log("A user connected ✨")
            socket.emit("message", { 
                sender: "System", 
                text: "Welcome to the chat!", 
                id: Date.now(), 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            })

            // Optionally: Load and emit previous messages
            try {
                const files = await client.getDirectoryContents('/chat/')
                for (const file of files) {
                    if (file.type === 'file' && file.basename.endsWith('.json')) {
                        const msg = await client.getFileContents(file.filename, { format: "text" })
                        socket.emit("message", JSON.parse(msg))
                    }
                }
            } catch (err) {
                console.error('Error fetching previous messages:', err);
            }

            // Broadcast incoming messages to all users
            socket.on("message", async (msg) => {
                try {
                    // Ensure /chat/ directory exists
                    try { 
                        await client.createDirectory('/chat/')
                    } catch (e) {
                        // Ignore if directory already exists (status code 409 means conflict)
                        if (e.statusCode !== 409) {
                            console.error("Error creating directory:", e)
                        }
                    }

                    // Save message to WebDAV
                    const filename = `/chat/msg-${Date.now()}-${uuidv4()}.json`
                    await client.putFileContents(filename, JSON.stringify(msg))
                } catch (err) {
                    console.error("WebDAV error:", err)
                }
                socket.broadcast.emit("message", msg)  // Send to everyone except the sender
            })

            // Typing indicator
            socket.on("typing", () => {
                socket.broadcast.emit("typing")
            })
        })
    }

    res.end()
}
