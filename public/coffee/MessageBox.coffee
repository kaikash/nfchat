class MessageBox
	elem: null
	constructor: (@elem) ->
	push: (message) =>
		if message.from == "me"
			fromText = "Я: "
		else
			fromText = "Некто: "
		content = message.text
		readed = if !message.readed then "new" else ""
		$(@elem).append '
			<div class="message-box ' + message.from + ' ' + readed + '">
				<div class="message-from-text">' + fromText + '</div>
				<div class="message-content">' + content + '</div>
			</div>
		'
	readAll: () =>
		$(".message-box").removeClass("new")
	reset: () =>
		$(@elem).html("")
window.MessageBox = MessageBox