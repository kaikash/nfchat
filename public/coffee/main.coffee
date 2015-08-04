window.socket = io.connect()
window.randomKey = (num) ->
	(Math.random()*10).toString(36).substring(num)
window.active = true
window.addEventListener "blur", () ->
	window.active = false
window.addEventListener "focus", () ->
	window.active = true
	readAllMessages()

document.querySelector("textarea").addEventListener "keypress", () ->
	socket.emit "smsg", 
		code: 3
		text: "Собеседник набирает сообщение"
document.querySelector("textarea").addEventListener "keyup", (e) ->
	if e.keyCode == 13 and !e.shiftKey
		socket.emit "msg", this.value
		this.value = ""
document.querySelector("#send").addEventListener "click", () ->
	socket.emit "msg", document.querySelector("textarea").innerHTML
	document.querySelector("textarea").innerHTML = ""
newMsgCount = 0

socket.on "msg", (data) ->
	MSGBOX.push new Message data, "stranger", data.id
	if window.active
		readAllMessages()
	else
		newMsgCount++
connected = false
socket.on "smsg", (data) ->
	console.log "#{data.code} | System: #{data.text}"
	if data.code == 0
		connected = false
		document.querySelector("#startChat").style.display = ""
		document.querySelector("#stopChat").style.display = "none"
		document.querySelector("#sysmsg").innerHTML = "Соединение разорвано"
	else if data.code == 1
		connected = true
		document.querySelector("#startChat").style.display = "none"
		document.querySelector("#stopChat").style.display = ""
		document.querySelector("#sysmsg").innerHTML = "Соединение установлено"
	else if data.code == 2
		MSGBOX.push new Message data.msg, "me", data.id, data.atachment
	else if data.code == 3
		document.querySelector("#sysmsg").innerHTML = "Собеседник печатает"
	else if data.code == 4
		MSGBOX.readAll()
MSGBOX = new MessageBox document.querySelector("#msgbox")
readAllMessages = () ->
	newMsgCount = 0
	MSGBOX.readAll()
	socket.emit "smsg", 
		code: 4
		text: "Все сообщения прочитаны"
stopChat = () ->
	socket.emit "stop chat", {}
startChat = () ->
	stopChat()
	document.querySelector("#startChat").style.display = "none"
	document.querySelector("#stopChat").style.display = "none"
	document.querySelector("#sysmsg").innerHTML = "Ожидание собеседника"
	MSGBOX.reset()
	socket.emit "start chat", {}
document.querySelector("#startChat").onclick = startChat
document.querySelector("#stopChat").onclick = stopChat
