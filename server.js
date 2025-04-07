const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer((req, res) => {
        return handle(req, res)
    })

    const io = new Server(server)

    io.on('connection', (socket) => {
        console.log('User connected')

        socket.on('message', (msg) => {
            socket.broadcast.emit('message', msg)
        })

        socket.on('disconnect', () => {
            console.log('User disconnected')
        })
    })

    const PORT = process.env.PORT || 3000
    server.listen(PORT, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${PORT}`)
    })
})
