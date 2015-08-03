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
io.on 'connection', (socket) ->
  console.log 'a user connected'
  user = new User socket
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
  	delete FREEUSERS[socket.id]
  return
searchOpponent = () ->
	ids = []
	for id of FREEUSERS
		ids.push id
	if ids.length == 0 then return null
	index = Math.random(0, ids.length - 1, true)
	FREEUSERS[ids[index]]
createRoom = (user1, user2) ->
	delete FREEUSERS[user1.socket.id]
	delete FREEUSERS[user2.socket.id]
	user1.onmessage (msg) ->
		user2.sendmessage msg
	user2.onmessage (msg) ->
		user1.sendmessage msg
	user1.sendmessage "Вы подключились к собеседнику"
	user2.sendmessage "Вы подключились к собеседнику"
http.listen 3000, ->
  console.log 'listening on *:3000'
  return