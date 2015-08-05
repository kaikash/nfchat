(function() {
  var Room,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Room = (function() {
    function Room(user11, user21) {
      this.user1 = user11;
      this.user2 = user21;
      this.sendmessage = bind(this.sendmessage, this);
      this.sendsysmessage = bind(this.sendsysmessage, this);
    }

    Room.prototype.sendsysmessage = function(msg) {
      user1.sendsysmessage(msg);
      return user2.sendsysmessage(msg);
    };

    Room.prototype.sendmessage = function(data) {
      return this.socket.emit("msg", data);
    };

    return Room;

  })();

  module.exports.Room = Room;

}).call(this);
