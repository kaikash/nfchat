Math.rand = Math.random

Math.random = (min, max, integer) ->
  if typeof min == 'number'
    if integer
      Math.floor Math.rand() * (max - min) + min
    else
      Math.rand() * (max - min) + min
  else
    Math.rand()

User = require('./User.js').User

express = require('express')
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)



app.use express.static(__dirname + "/public")
FREEUSERS = []
users = 0
io.on 'connection', (socket) ->
  console.log 'User connected; socket id: ' + socket.id
  users++
  user = new User socket

  do userCount

  socket.on "start chat", () ->
    unless user.busy
      user.busy = true
      opponent = searchOpponent()
      ids = []
      for id of FREEUSERS
        ids.push id

      if opponent
        createRoom user, opponent
      else
        FREEUSERS[socket.id] = user
  
  socket.on 'disconnect', () ->
    users--
    delete FREEUSERS[socket.id]
    do userCount

searchOpponent = () ->
  ids = []
  for id of FREEUSERS
    ids.push id
  if ids.length == 0 then return null
  index = Math.random(0, ids.length - 1, true)
  FREEUSERS[ids[index]]

userCount = () ->
  io.emit 'smsg',
    code: 5
    content: users

# 0 - Соединение разорвано
# 1 - Соединение установлено
# 2 - Сообщение отправлено
# 3 - Собеседник набирает сообщение
# 4 - Прочитаны, не прочитаны
# 5 - Кол-во пользователей
# 


createRoom = (user1, user2) ->
  delete FREEUSERS[user1.socket.id]
  delete FREEUSERS[user2.socket.id]

  do user1.connection_established
  do user2.connection_established

  # Messages section
  user1.onmessage (msg) ->
    user1.message_sent msg
    user2.sendmessage msg
  user2.onmessage (msg) ->
    user2.message_sent msg
    user1.sendmessage msg

  # Disconnect section
  user1.ondisconnect () ->
    user2.disconnect user1
  user2.ondisconnect () ->
    user1.disconnect user2

  user1.onsysmessage (smsg) ->
    user2.sendsysmessage smsg
    if smsg.code == 0
      do user1.removeAllListeners
      do user2.removeAllListeners  
  user2.onsysmessage (smsg) ->
    user1.sendsysmessage smsg
    if smsg.code == 0
      do user2.removeAllListeners
      do user1.removeAllListeners 

  user1.onstopchat user2
  user2.onstopchat user1

http.listen 3000, ->
  console.log 'listening on *:3000'
  return