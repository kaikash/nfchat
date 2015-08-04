(function() {
  var FREEUSERS, User, app, createRoom, express, http, io, searchOpponent, users;

  Math.rand = Math.random;

  Math.random = function(min, max, integer) {
    if (typeof min === 'number') {
      if (integer) {
        return Math.floor(Math.rand() * (max - min) + min);
      } else {
        return Math.rand() * (max - min) + min;
      }
    } else {
      return Math.rand();
    }
  };

  User = require('./User.js').User;

  express = require('express');

  app = express();

  http = require('http').Server(app);

  io = require('socket.io')(http);

  app.use(express["static"](__dirname + "/public"));

  FREEUSERS = [];

  users = 0;

  io.on('connection', function(socket) {
    var user;
    console.log('a user connected');
    users++;
    user = new User(socket);
    setInterval(function() {
      return socket.emit("smsg", {
        code: 5,
        text: "Users: " + users
      });
    }, 1000);
    socket.on("start chat", function() {
      var id, ids, opponent;
      opponent = searchOpponent();
      ids = [];
      for (id in FREEUSERS) {
        ids.push(id);
      }
      console.log(ids);
      if (opponent) {
        return createRoom(user, opponent);
      } else {
        return FREEUSERS[socket.id] = user;
      }
    });
    socket.on('disconnect', function() {
      users--;
      return delete FREEUSERS[socket.id];
    });
  });

  searchOpponent = function() {
    var id, ids, index;
    ids = [];
    for (id in FREEUSERS) {
      ids.push(id);
    }
    if (ids.length === 0) {
      return null;
    }
    index = Math.random(0, ids.length - 1, true);
    return FREEUSERS[ids[index]];
  };

  createRoom = function(user1, user2) {
    delete FREEUSERS[user1.socket.id];
    delete FREEUSERS[user2.socket.id];
    user1.onmessage(function(msg) {
      user1.sendsysmessage({
        code: 2,
        text: "Сообщение отправлено",
        msg: msg
      });
      return user2.sendmessage(msg);
    });
    user2.onmessage(function(msg) {
      user2.sendsysmessage({
        code: 2,
        text: "Сообщение отправлено",
        msg: msg
      });
      return user1.sendmessage(msg);
    });
    user1.socket.on('disconnect', function() {
      return user2.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
    });
    user2.socket.on('disconnect', function() {
      return user1.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
    });
    user1.sendsysmessage({
      code: 1,
      text: "Соединение установлено"
    });
    user2.sendsysmessage({
      code: 1,
      text: "Соединение установлено"
    });
    user1.onsysmessage(function(smsg) {
      user2.sendsysmessage(smsg);
      if (smsg.code === 0) {
        user1.socket.removeAllListeners("smsg");
        user2.socket.removeAllListeners("smsg");
        user1.socket.removeAllListeners("msg");
        user2.socket.removeAllListeners("msg");
        user1.socket.removeAllListeners("stop chat");
        return user2.socket.removeAllListeners("stop chat");
      }
    });
    user2.onsysmessage(function(smsg) {
      user1.sendsysmessage(smsg);
      if (smsg.code === 0) {
        user1.socket.removeAllListeners("smsg");
        user2.socket.removeAllListeners("smsg");
        user1.socket.removeAllListeners("msg");
        user2.socket.removeAllListeners("msg");
        user1.socket.removeAllListeners("stop chat");
        return user2.socket.removeAllListeners("stop chat");
      }
    });
    user1.socket.on("stop chat", function() {
      user1.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
      user2.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
      user1.socket.removeAllListeners("smsg");
      user2.socket.removeAllListeners("smsg");
      user1.socket.removeAllListeners("msg");
      user2.socket.removeAllListeners("msg");
      user1.socket.removeAllListeners("stop chat");
      return user2.socket.removeAllListeners("stop chat");
    });
    return user2.socket.on("stop chat", function() {
      user1.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
      user2.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
      user1.socket.removeAllListeners("smsg");
      user2.socket.removeAllListeners("smsg");
      user1.socket.removeAllListeners("msg");
      user2.socket.removeAllListeners("msg");
      user1.socket.removeAllListeners("stop chat");
      return user2.socket.removeAllListeners("stop chat");
    });
  };

  http.listen(3000, function() {
    console.log('listening on *:3000');
  });

}).call(this);
