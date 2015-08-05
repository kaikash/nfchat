class Room
  constructor: (@user1, @user2) ->
  sendsysmessage: (msg) =>
    user1.sendsysmessage msg
    user2.sendsysmessage msg

  sendmessage: (data) =>
    @socket.emit "msg", data
module.exports.Room = Room