var socket = io()
var urlParams = new URLSearchParams(window.location.search)

var userInfo = {
  name: urlParams.get('name'),
  color: urlParams.get('color'),
  id: null
}


const connectedUsers = document.getElementById('connected-users')
const allChat = document.getElementById('all-chat-room')
const privateChat = document.getElementById('private-chat-room')
const send = document.getElementById('send-button')
const message = document.getElementById('message-input')
const profile = document.getElementById('user-profile')
const search = document.getElementById('search-user')


allChat.scrollTop = allChat.scrollHeight
privateChat.scrollTop = privateChat.scrollHeight

// this user connected
socket.on('welcome', obj => {
  allChat.innerHTML = `<p><span id="server-span">server</span> ${obj.msg}</p>`
  userInfo.id = obj.id
  profile.innerHTML = `<span style="color: ${userInfo.color};">${userInfo.name}</span>#${userInfo.id}`
  // send userInfo to server
  socket.emit('join', userInfo)
})

// receive user list
socket.on('userlist', users => {
  connectedUsers.innerHTML = ''
  users.forEach(user => {
    connectedUsers.innerHTML += `<p><span style="color: ${user.color};">${user.name}</span>#${user.id}</p>`
  })
})

// a user connected
socket.on('user enter', user => {
  allChat.innerHTML += `<p><span id="server-span">server</span> <span id="user-span" style="background-color:${user.color};">${user.name}</span>#${user.id} has joined</p>`
})

socket.on('user leave', user => {
  allChat.innerHTML += `<p><span id="server-span">server</span> <span id="user-span" style="background-color:${user.color};">${user.name}</span>#${user.id} has left</p>`
})

//send message
send.addEventListener('click', (e) => {
  socket.emit('all client', { msg: message.value, userInfo })
  message.value = ''
})

message.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') {
    socket.emit('all client', { msg: message.value, userInfo})
    message.value = ''
  }
})

// recieve all-message 
socket.on('all server', obj => {
  obj.user.id === userInfo.id ? 
  allChat.innerHTML += `<p><span style="color: ${obj.user.color}; font-size: 18px;">me:</span> ${obj.msg}</p>` :
  allChat.innerHTML += `<p><span id="user-span" style="background-color: ${obj.user.color};">${obj.user.name}</span> ${obj.msg}</p>`
})

// search user
search.addEventListener('input', function() {
  connectedUsers.childNodes.forEach(el => {
    var user = el.textContent
    if(user.search(new RegExp(this.value + ".*", "i")) === -1) {
      el.style.display = 'none'
    } else {
      el.style.display = 'block'
    }
  })
})

socket.on('private message', obj => {
  privateChat.innerHTML += `<p><span style="color: ${obj.user.color};">${obj.user.name}</span>#${obj.user.id}<br>:${obj.msg}</p>`
})