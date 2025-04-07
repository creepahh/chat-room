import { Server } from "socket.io"

let io

export default function handler(req, res) {
    if (!res.socket.server.io) {
        console.log("🔌 Starting Socket.IO server...")

        io = new Server(res.socket.server, {
            path: "/api/socket",
        })

        res.socket.server.io = io

        io.on("connection", (socket) => {
            console.log("A user connected ✨")

            socket.on("message", (msg) => {
                socket.broadcast.emit("message", msg) // send to all *except* sender
            })
        })
    }

    res.end()
}
