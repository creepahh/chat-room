import { Server } from "socket.io"

let io

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("🔌 Starting Socket.IO server...")

        io = new Server(res.socket.server, {
            path: "/api/socket", // Custom path for Socket.io
        })

        res.socket.server.io = io

        io.on("connection", (socket) => {
            console.log("A user connected ✨")

            socket.on("message", (msg) => {
                socket.broadcast.emit("message", msg) // Send to everyone except the sender
            })
        })
    }

    res.end()
}
