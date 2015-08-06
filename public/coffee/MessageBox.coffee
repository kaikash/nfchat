class MessageBox
	elem: null
	constructor: (@elem) ->
	push: (message) =>
		if message.from == "me"
			fromText = "Я: "
		else
			fromText = "Некто: "
		content = message.text
		content = content.replace(new RegExp("<", "g"), "&lt;")
		content = content.replace(new RegExp(">", "g"), "&gt;")
		readed = if !message.readed then "new" else ""
		$(@elem).prepend '
			<div class="message-box clearfix ' + message.from + ' ' + readed + '">
				<div class="message-content">' + content + '</div>
			</div>
		'
	readAll: () =>
		$(".message-box").removeClass("new")
	reset: () =>
		$(@elem).html("")
window.MessageBox = MessageBox