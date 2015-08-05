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
    socket.on("start chat", function() {
      var id, ids, opponent;
      if (!user.busy) {
        user.busy = true;
        opponent = searchOpponent();
        ids = [];
        for (id in FREEUSERS) {
          ids.push(id);
        }
        if (opponent) {
          return createRoom(user, opponent);
        } else {
          return FREEUSERS[socket.id] = user;
        }
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
    user1.connection_established();
    user2.connection_established();
    user1.onmessage(function(msg) {
      user1.message_sent(msg);
      return user2.sendmessage(msg);
    });
    user2.onmessage(function(msg) {
      user2.message_sent(msg);
      return user1.sendmessage(msg);
    });
    user1.ondisconnect(function() {
      return user2.disconnect();
    });
    user2.ondisconnect(function() {
      return user1.disconnect();
    });
    user1.onsysmessage(function(smsg) {
      user2.sendsysmessage(smsg);
      if (smsg.code === 0) {
        user1.removeAllListeners();
        return user2.removeAllListeners();
      }
    });
    user2.onsysmessage(function(smsg) {
      user1.sendsysmessage(smsg);
      if (smsg.code === 0) {
        user2.removeAllListeners();
        return user1.removeAllListeners();
      }
    });
    user1.onstopchat(user2);
    return user2.onstopchat(user1);
  };

  http.listen(3000, function() {
    console.log('listening on *:3000');
  });

}).call(this);
