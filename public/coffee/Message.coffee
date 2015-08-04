class Message
	constructor: (@text = "", @from = "me", @id, @atachments = []) ->
		if !@id then @id = randomKey(5)
	text: ""
	atachments: []
	from: "me"
	readed: false
	id: ""
window.Message = Message