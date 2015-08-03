class User
	constructor: (@socket) ->
	onmessage: (callback) =>
		@socket.on "msg", (data) ->
			console.log data
			callback data

	sendmessage: (data) =>
		@socket.emit "msg", data
module.exports.User = User