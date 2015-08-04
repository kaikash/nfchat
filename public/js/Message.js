(function() {
  var Message;

  Message = (function() {
    function Message(text, from, id, atachments) {
      this.text = text != null ? text : "";
      this.from = from != null ? from : "me";
      this.id = id;
      this.atachments = atachments != null ? atachments : [];
      if (!this.id) {
        this.id = randomKey(5);
      }
    }

    Message.prototype.text = "";

    Message.prototype.atachments = [];

    Message.prototype.from = "me";

    Message.prototype.readed = false;

    Message.prototype.id = "";

    return Message;

  })();

  window.Message = Message;

}).call(this);
