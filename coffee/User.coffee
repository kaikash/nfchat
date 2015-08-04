class User
	constructor: (@socket) ->
	onmessage: (callback) =>
		@socket.on "msg", (data) ->
			callback data
	onsysmessage: (callback) =>
		@socket.on "smsg", (data) ->
			callback data
	sendmessage: (data) =>
		@socket.emit "msg", data
	sendsysmessage: (data) =>
		@socket.emit "smsg", data
module.exports.User = User