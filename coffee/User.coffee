class User
  constructor: (@socket) ->
    @busy = false

  onmessage: (callback) =>
    @socket.on "msg", (data) ->
      callback data

  onsysmessage: (callback) =>
    @socket.on "smsg", (data) ->
      callback data

  ondisconnect: (callback) =>
    @socket.on 'disconnect', () ->
      do callback

  removeAllListeners: () ->
    @socket.removeAllListeners "msg"
    @socket.removeAllListeners "smsg"
    @socket.removeAllListeners "stop chat"

  onstopchat: (opponent) =>
    @socket.on 'stop chat', () =>
      do @stopchat
      do opponent.stopchat

  stopchat: () =>
    console.log 'stopchatat!'
    @sendsysmessage 
      code: 0
      text: "Соединение разорвано"
    do @removeAllListeners
    @busy = false

  disconnect: (opponent) =>
    do @stopchat
    do opponent.stopchat

  connection_established: () =>
    @sendsysmessage 
      code: 1
      text: "Соединение установлено"

  message_sent: (msg) =>
    @sendsysmessage 
      code: 2
      text: "Сообщение отправлено"
      msg: msg

  sendmessage: (data) =>
    @socket.emit "msg", data

  sendsysmessage: (data) =>
    @socket.emit "smsg", data

module.exports.User = User