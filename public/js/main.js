(function() {
  var MSGBOX, connected, newMsgCount, readAllMessages, startChat, stopChat;

  window.socket = io.connect();

  window.randomKey = function(num) {
    return (Math.random() * 10).toString(36).substring(num);
  };

  window.active = true;

  window.addEventListener("blur", function() {
    return window.active = false;
  });

  window.addEventListener("focus", function() {
    window.active = true;
    return readAllMessages();
  });

  document.querySelector("textarea").addEventListener("keypress", function() {
    return socket.emit("smsg", {
      code: 3,
      text: "Собеседник набирает сообщение"
    });
  });

  document.querySelector("textarea").addEventListener("keyup", function(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      socket.emit("msg", this.value);
      return this.value = "";
    }
  });

  document.querySelector("#send").addEventListener("click", function() {
    socket.emit("msg", document.querySelector("textarea").innerHTML);
    return document.querySelector("textarea").innerHTML = "";
  });

  newMsgCount = 0;

  socket.on("msg", function(data) {
    MSGBOX.push(new Message(data, "stranger", data.id));
    if (window.active) {
      return readAllMessages();
    } else {
      return newMsgCount++;
    }
  });

  connected = false;

  socket.on("smsg", function(data) {
    console.log(data.code + " | System: " + data.text);
    if (data.code === 0) {
      connected = false;
      document.querySelector("#startChat").style.display = "";
      document.querySelector("#stopChat").style.display = "none";
      return document.querySelector("#sysmsg").innerHTML = "Соединение разорвано";
    } else if (data.code === 1) {
      connected = true;
      document.querySelector("#startChat").style.display = "none";
      document.querySelector("#stopChat").style.display = "";
      return document.querySelector("#sysmsg").innerHTML = "Соединение установлено";
    } else if (data.code === 2) {
      return MSGBOX.push(new Message(data.msg, "me", data.id, data.atachment));
    } else if (data.code === 3) {
      return document.querySelector("#sysmsg").innerHTML = "Собеседник печатает";
    } else if (data.code === 4) {
      return MSGBOX.readAll();
    }
  });

  MSGBOX = new MessageBox(document.querySelector("#msgbox"));

  readAllMessages = function() {
    newMsgCount = 0;
    MSGBOX.readAll();
    return socket.emit("smsg", {
      code: 4,
      text: "Все сообщения прочитаны"
    });
  };

  stopChat = function() {
    return socket.emit("stop chat", {});
  };

  startChat = function() {
    stopChat();
    document.querySelector("#startChat").style.display = "none";
    document.querySelector("#stopChat").style.display = "none";
    document.querySelector("#sysmsg").innerHTML = "Ожидание собеседника";
    MSGBOX.reset();
    return socket.emit("start chat", {});
  };

  document.querySelector("#startChat").onclick = startChat;

  document.querySelector("#stopChat").onclick = stopChat;

}).call(this);
