(function() {
  var MessageBox,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MessageBox = (function() {
    MessageBox.prototype.elem = null;

    function MessageBox(elem) {
      this.elem = elem;
      this.reset = bind(this.reset, this);
      this.readAll = bind(this.readAll, this);
      this.push = bind(this.push, this);
    }

    MessageBox.prototype.push = function(message) {
      var content, fromText, readed;
      if (message.from === "me") {
        fromText = "Я: ";
      } else {
        fromText = "Некто: ";
      }
      content = message.text;
      content = content.replace(new RegExp("<", "g"), "&lt;");
      content = content.replace(new RegExp(">", "g"), "&gt;");
      readed = !message.readed ? "new" : "";
      return $(this.elem).prepend('<div class="message-box clearfix ' + message.from + ' ' + readed + '"> <div class="message-content">' + content + '</div> </div>');
    };

    MessageBox.prototype.readAll = function() {
      return $(".message-box").removeClass("new");
    };

    MessageBox.prototype.reset = function() {
      return $(this.elem).html("");
    };

    return MessageBox;

  })();

  window.MessageBox = MessageBox;

}).call(this);
