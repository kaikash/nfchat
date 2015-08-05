(function() {
  var User,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  User = (function() {
    function User(socket) {
      this.socket = socket;
      this.sendsysmessage = bind(this.sendsysmessage, this);
      this.sendmessage = bind(this.sendmessage, this);
      this.message_sent = bind(this.message_sent, this);
      this.connection_established = bind(this.connection_established, this);
      this.disconnect = bind(this.disconnect, this);
      this.stopchat = bind(this.stopchat, this);
      this.onstopchat = bind(this.onstopchat, this);
      this.ondisconnect = bind(this.ondisconnect, this);
      this.onsysmessage = bind(this.onsysmessage, this);
      this.onmessage = bind(this.onmessage, this);
      this.busy = false;
    }

    User.prototype.onmessage = function(callback) {
      return this.socket.on("msg", function(data) {
        return callback(data);
      });
    };

    User.prototype.onsysmessage = function(callback) {
      return this.socket.on("smsg", function(data) {
        return callback(data);
      });
    };

    User.prototype.ondisconnect = function(callback) {
      return this.socket.on('disconnect', function() {
        return callback();
      });
    };

    User.prototype.removeAllListeners = function() {
      this.socket.removeAllListeners("msg");
      this.socket.removeAllListeners("smsg");
      return this.socket.removeAllListeners("stop chat");
    };

    User.prototype.onstopchat = function(opponent) {
      return this.socket.on('stop chat', (function(_this) {
        return function() {
          _this.stopchat();
          return opponent.stopchat();
        };
      })(this));
    };

    User.prototype.stopchat = function() {
      this.sendsysmessage({
        code: 0,
        text: "Соединение разорвано"
      });
      this.removeAllListeners();
      return this.busy = false;
    };

    User.prototype.disconnect = function(opponent) {
      return opponent.stopchat();
    };

    User.prototype.connection_established = function() {
      return this.sendsysmessage({
        code: 1,
        text: "Соединение установлено"
      });
    };

    User.prototype.message_sent = function(msg) {
      return this.sendsysmessage({
        code: 2,
        text: "Сообщение отправлено",
        msg: msg
      });
    };

    User.prototype.sendmessage = function(data) {
      return this.socket.emit("msg", data);
    };

    User.prototype.sendsysmessage = function(data) {
      return this.socket.emit("smsg", data);
    };

    return User;

  })();

  module.exports.User = User;

}).call(this);
