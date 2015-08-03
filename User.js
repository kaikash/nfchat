(function() {
  var User,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  User = (function() {
    function User(socket) {
      this.socket = socket;
      this.sendmessage = bind(this.sendmessage, this);
      this.onmessage = bind(this.onmessage, this);
    }

    User.prototype.onmessage = function(callback) {
      return this.socket.on("msg", function(data) {
        console.log(data);
        return callback(data);
      });
    };

    User.prototype.sendmessage = function(data) {
      return this.socket.emit("msg", data);
    };

    return User;

  })();

  module.exports.User = User;

}).call(this);
