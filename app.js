(function() {
  var FREEUSERS, User, app, createRoom, express, http, io, searchOpponent;

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

  io.on('connection', function(socket) {
    var user;
    console.log('a user connected');
    user = new User(socket);
    socket.on("start chat", function() {
      var opponent;
      opponent = searchOpponent();
      if (opponent) {
        return createRoom(user, opponent);
      } else {
        return FREEUSERS[socket.id] = user;
      }
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
      console.log(msg);
      return user2.sendmessage(msg);
    });
    return user2.onmessage(function(msg) {
      console.log(msg);
      console.log(user1);
      return user1.sendmessage(msg);
    });
  };

  http.listen(3000, function() {
    console.log('listening on *:3000');
  });

}).call(this);
