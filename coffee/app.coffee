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
  console.log 'a user connected'
  users++
  user = new User socket
  setInterval () ->
  	socket.emit "smsg", 
  		code: 5
  		text: "Users: " + users
  , 1000
  socket.on "start chat", () ->
  	opponent = searchOpponent()
  	ids = []
  	for id of FREEUSERS
  		ids.push id
  	console.log ids
  	if opponent
  		createRoom user, opponent
  	else
  		FREEUSERS[socket.id] = user
  socket.on 'disconnect', () ->
  	users--
  	delete FREEUSERS[socket.id]
  return
searchOpponent = () ->
	ids = []
	for id of FREEUSERS
		ids.push id
	if ids.length == 0 then return null
	index = Math.random(0, ids.length - 1, true)
	FREEUSERS[ids[index]]
# 0 - Соединение разорвано
# 1 - Соединение установлено
# 2 - Сообщение отправлено
# 3 - Собеседник набирает сообщение
createRoom = (user1, user2) ->
	delete FREEUSERS[user1.socket.id]
	delete FREEUSERS[user2.socket.id]
	# Messages section
	user1.onmessage (msg) ->
		user1.sendsysmessage 
			code: 2
			text: "Сообщение отправлено"
			msg: msg
		user2.sendmessage msg
	user2.onmessage (msg) ->
		user2.sendsysmessage 
			code: 2
			text: "Сообщение отправлено"
			msg: msg
		user1.sendmessage msg


	# Disconnect section
	user1.socket.on 'disconnect', () ->
		user2.sendsysmessage 
			code: 0
			text: "Соединение разорвано"
	user2.socket.on 'disconnect', () ->
		user1.sendsysmessage 
			code: 0
			text: "Соединение разорвано"


	user1.sendsysmessage 
		code: 1
		text: "Соединение установлено"
	user2.sendsysmessage 
		code: 1
		text: "Соединение установлено"

	user1.onsysmessage (smsg) ->
		 user2.sendsysmessage smsg
		 if smsg.code == 0
		 		user1.socket.removeAllListeners "smsg"
		 		user2.socket.removeAllListeners "smsg"
		 		user1.socket.removeAllListeners "msg"
		 		user2.socket.removeAllListeners "msg"
		 		user1.socket.removeAllListeners "stop chat"
		 		user2.socket.removeAllListeners "stop chat"
	user2.onsysmessage (smsg) ->
		 user1.sendsysmessage smsg
		 if smsg.code == 0
		 		user1.socket.removeAllListeners "smsg"
		 		user2.socket.removeAllListeners "smsg"
		 		user1.socket.removeAllListeners "msg"
		 		user2.socket.removeAllListeners "msg"
		 		user1.socket.removeAllListeners "stop chat"
		 		user2.socket.removeAllListeners "stop chat"
	user1.socket.on "stop chat", () ->
		user1.sendsysmessage 
			code: 0
			text: "Соединение разорвано"
		user2.sendsysmessage 
			code: 0
			text: "Соединение разорвано"
		user1.socket.removeAllListeners "smsg"
		user2.socket.removeAllListeners "smsg"
		user1.socket.removeAllListeners "msg"
		user2.socket.removeAllListeners "msg"
		user1.socket.removeAllListeners "stop chat"
		user2.socket.removeAllListeners "stop chat"
	user2.socket.on "stop chat", () ->
		user1.sendsysmessage 
			code: 0
			text: "Соединение разорвано"
		user2.sendsysmessage 
			code: 0
			text: "Соединение разорвано"
		user1.socket.removeAllListeners "smsg"
		user2.socket.removeAllListeners "smsg"
		user1.socket.removeAllListeners "msg"
		user2.socket.removeAllListeners "msg"
		user1.socket.removeAllListeners "stop chat"
		user2.socket.removeAllListeners "stop chat"

http.listen 3000, ->
  console.log 'listening on *:3000'
  return