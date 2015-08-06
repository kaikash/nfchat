window.CONFIG = {}
if localStorage.getItem("config") then CONFIG = JSON.parse(localStorage.getItem("config"))
else
	CONFIG = 
		sound: on
		vibration: on
		notifications: off
	localStorage.setItem "config", JSON.stringify(CONFIG)
CONFIG.update = () ->
	localStorage.setItem "config", JSON.stringify(CONFIG)
if navigator.vibrate != undefined
	document.querySelector("#vibrationSwitch").disabled = false
	document.querySelector("#vibrationSwitch").checked = CONFIG.vibration
console.log window.Notification
if window.Notification != undefined
	document.querySelector("#notificationsSwitch").disabled = false
	document.querySelector("#notificationsSwitch").checked = CONFIG.notifications

changeSound = (sound) ->
	if sound
		document.querySelector("#disableSoundBtn").style.display = ""
		document.querySelector("#enableSoundBtn").style.display = "none"
		document.querySelector("#soundSwitch").checked = sound
		CONFIG.sound = sound
		do CONFIG.update
	else
		document.querySelector("#disableSoundBtn").style.display = "none"
		document.querySelector("#enableSoundBtn").style.display = ""
		document.querySelector("#soundSwitch").checked = sound
		CONFIG.sound = sound
		do CONFIG.update
changeSound CONFIG.sound
document.querySelector("#disableSoundBtn").addEventListener "click", () ->
	changeSound off
document.querySelector("#enableSoundBtn").addEventListener "click", () ->
	changeSound on
document.querySelector("#soundSwitch").addEventListener "change", () ->
	changeSound this.checked
document.querySelector("#vibrationSwitch").addEventListener "change", () ->
	CONFIG.vibration = this.checked
	CONFIG.update()
document.querySelector("#notificationsSwitch").addEventListener "change", () ->
	if this.checked
		Notification.requestPermission (perm) ->
			if perm == "granted"
				CONFIG.notifications = on
				CONFIG.update()
			else
				document.querySelector("#notificationsSwitch").checked = false
				CONFIG.notifications = off
				CONFIG.update()
	else
		CONFIG.notifications = off
		CONFIG.update()

	CONFIG.update()
$(window).swipe 
	allowPageScroll: "vertical"
	swipe: (event, direction, distance, duration, fingerCount, fingerData) ->
		if direction == "right"
			$(".mdl-layout__drawer-button").click()
		else if direction == "left"
			$(".mdl-layout__obfuscator").click()
window.socket = io.connect()
window.randomKey = (num) ->
	(Math.random()*10).toString(36).substring(num)
window.active = true
window.addEventListener "blur", () ->
	window.active = false
window.addEventListener "focus", () ->
	window.active = true
	readAllMessages()

title = document.querySelector("title").innerHTML
printTimeout = null
setInterval () ->
	if document.querySelector("title").innerHTML == title and newMsgCount > 0 and !window.active
		document.querySelector("title").innerHTML = newMsgCount.toString() + ( if newMsgCount == 1 then " новое сообщение" else if newMsgCount > 1 and newMsgCount < 5 then " новых сообщения" else " новых сообщений")
	else
		document.querySelector("title").innerHTML = title
, 1000
document.querySelector("textarea").addEventListener "keydown", (e) ->
	socket.emit "smsg", 
		code: 3
		text: "Собеседник набирает сообщение"
	if e.keyCode == 13 and !e.shiftKey
		sendMessage()
		e.preventDefault()
document.querySelector("#send").addEventListener "click", () ->
	sendMessage()
newMsgCount = 0

socket.on "msg", (data) ->
	MSGBOX.push new Message data, "stranger", data.id
	if CONFIG.vibration
		navigator.vibrate 300
	if CONFIG.sound
			(new Audio("/sounds/inmsg.mp3")).play()
	if CONFIG.notifications
		new Notification "Новое сообщение | NFCHAT", 
			body: data
	if window.active
		readAllMessages()
	else
		newMsgCount++
connected = false
socket.on "smsg", (data) ->
	console.log "#{data.code} | System: #{data.text}"
	if data.code == 0
		connected = false
		clearTimeout printTimeout
		document.querySelector("#startChat").style.display = ""
		document.querySelector("#stopChat").style.display = "none"
		document.querySelector("#send").disabled = true
		document.querySelector("#sysmsg").innerHTML = "Соединение разорвано"
		if CONFIG.vibration
			navigator.vibrate 300
		if CONFIG.sound
			(new Audio("/sounds/disconnect.mp3")).play()
	else if data.code == 1
		connected = true
		document.querySelector("#startChat").style.display = "none"
		document.querySelector("#stopChat").style.display = ""
		document.querySelector("#send").disabled = false

		document.querySelector("#sysmsg").innerHTML = "Соединение установлено"
		document.querySelector("textarea").focus()
		if CONFIG.vibration
			navigator.vibrate 300
		if CONFIG.sound
			(new Audio("/sounds/connect.mp3")).play()
	else if data.code == 2
		MSGBOX.push new Message data.msg, "me", data.id, data.atachment
		if CONFIG.vibration
			navigator.vibrate 300
		if CONFIG.sound
			(new Audio("/sounds/outmsg.mp3")).play()
	else if data.code == 3
		clearTimeout printTimeout
		printTimeout = setTimeout () ->
			document.querySelector("#sysmsg").innerHTML = ""
		, 2000
		document.querySelector("#sysmsg").innerHTML = "Собеседник печатает"
	else if data.code == 4
		MSGBOX.readAll()
	else if data.code == 5
		$("#usersNum").text data.text.slice(data.text.lastIndexOf(" ")+1)
		$("#usersTooltip").text "В данный момент на сайте " + $("#usersNum").text() + ( if $("#usersNum").text()[$("#usersNum").text().length-1]/1 == 1 then " пользователь" else if $("#usersNum").text()[$("#usersNum").text().length-1]/1 > 1 and $("#usersNum").text()[$("#usersNum").text().length-1]/1 < 5 then " пользователя" else " пользователей")
MSGBOX = new MessageBox document.querySelector("#msgbox")
readAllMessages = () ->
	newMsgCount = 0
	MSGBOX.readAll()
	socket.emit "smsg", 
		code: 4
		text: "Все сообщения прочитаны"
sendMessage = () ->
	document.querySelector("textarea").focus()
	msg = document.querySelector("textarea").value
	if msg.length > 0
		socket.emit "msg", msg
		document.querySelector("textarea").value = ""
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
# window.addEventListener "load", () ->
# 	$(".global-loading").addClass "close"
# 	setTimeout () ->
# 		$(".global-loading").css "display", "none"
# 	, 300
