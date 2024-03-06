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
    connectedUsers.innerHTML += `<p class="user-on"><span style="color: ${user.color};">${user.name}</span>#${user.id}</p>`
  })
})

// a user connected
socket.on('user enter', user => {
  allChat.innerHTML += `<p><span id="server-span">server</span> <span id="user-span" style="background-color:${user.color};">${user.name}</span>#${user.id} has joined</p>`
})

socket.on('user leave', obj => {
  allChat.innerHTML += `<p><span id="server-span">server</span> <span id="user-span" style="background-color:${obj.leaveUser.color};">${obj.leaveUser.name}</span>#${obj.leaveUser.id} has left</p>`
  connectedUsers.innerHTML = ''
  obj.connectedUsers.forEach(user => {
    connectedUsers.innerHTML += `<p class="user-on"><span style="color: ${user.color};">${user.name}</span>#${user.id}</p>`
  })
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
  allChat.scrollTop = allChat.scrollHeight
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

// select user to send private message
connectedUsers.addEventListener('click', (e) => {
  console.log('testing...')
  var eventSource = e.composedPath()[0]
  if(eventSource.className === 'user-on') {
    message.value = eventSource.textContent.slice(eventSource.textContent.indexOf("#")) + " "
    message.focus()
  }
})

// recieve private message
socket.on('private message', obj => {
  privateChat.innerHTML += 
    `<p class="user-on" style="color: rgb(145, 54, 145);">
      <span id="sender-span">from</span> 
      <span style="color: ${obj.sender.color};">${obj.sender.name}</span>#${obj.sender.id}</p>
    <p>:${obj.msg}</p>`
  privateChat.scrollTop = privateChat.scrollHeight
})

// private message sent
socket.on('private message sent', obj => {
  privateChat.innerHTML += 
    `<p style="color: rgb(145, 54, 145);">
      <span id="receiver-span">to</span> 
      <span style="color: ${obj.receiver.color};">${obj.receiver.name}</span>
      #${obj.receiver.id}
    </p>
    <p>:${obj.msg}</p>`
  privateChat.scrollTop = privateChat.scrollHeight
})

privateChat.addEventListener('click', (e) => {
  var eventSource = e.composedPath()[0]
  if(eventSource.className === 'user-on') {
    message.value = eventSource.textContent.slice(eventSource.textContent.indexOf("#")) + " "
    message.focus()
  }
})