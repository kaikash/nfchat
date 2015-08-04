(function() {
  var User,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  User = (function() {
    function User(socket) {
      this.socket = socket;
      this.sendsysmessage = bind(this.sendsysmessage, this);
      this.sendmessage = bind(this.sendmessage, this);
      this.onsysmessage = bind(this.onsysmessage, this);
      this.onmessage = bind(this.onmessage, this);
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
