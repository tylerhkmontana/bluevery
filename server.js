const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require("socket.io")(server)


var connectedUsers = []

app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const port = process.env.PORT || 8080
server.listen(port, () => console.log(`Sever running on port ${port}`))

io.on('connection', (socket) => {
  console.log(`user: ${socket.id} connected`)
  
  socket.emit('welcome', {
    msg: "Welcome to Blue-very!",
    id: socket.id
  })

  // When this user connected
  socket.on('join', user => {
    connectedUsers.push(user)
    io.emit('userlist', connectedUsers)
    socket.broadcast.emit('user enter', user)
  })

  socket.on('all client', obj => {
    if(obj.msg[0] === '#') {
      var targetId = obj.msg.split(" ")[0].slice(1)
      connectedUsers.find(obj => obj.id === targetId) ? 
        socket.to(targetId).emit('private message', { msg: obj.msg.slice(obj.msg.indexOf(" ")), user: obj.userInfo }) : 
        io.emit('all server', { msg: obj.msg, user: obj.userInfo })
    } else {
      io.emit('all server', {msg: obj.msg, user: obj.userInfo })
    }
  })

  socket.on('disconnect', () => {
    const index = connectedUsers.findIndex(user => user.id === socket.id)
    if (index !== -1) {
      var leaveUser = connectedUsers.splice(index, 1)[0];
    }

    socket.broadcast.emit('user leave', leaveUser)
  })
})
