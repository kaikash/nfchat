(function() {
  var CONFIG, MSGBOX, changeSound, connected, newMsgCount, printTimeout, readAllMessages, sendMessage, startChat, stopChat, title;

  window.CONFIG = {};

  if (localStorage.getItem("config")) {
    CONFIG = JSON.parse(localStorage.getItem("config"));
  } else {
    CONFIG = {
      sound: true,
      vibration: true,
      notifications: false
    };
    localStorage.setItem("config", JSON.stringify(CONFIG));
  }

  CONFIG.update = function() {
    return localStorage.setItem("config", JSON.stringify(CONFIG));
  };

  if (navigator.vibrate !== void 0) {
    document.querySelector("#vibrationSwitch").disabled = false;
    document.querySelector("#vibrationSwitch").checked = CONFIG.vibration;
  }

  console.log(window.Notification);

  if (window.Notification !== void 0) {
    document.querySelector("#notificationsSwitch").disabled = false;
    document.querySelector("#notificationsSwitch").checked = CONFIG.notifications;
  }

  changeSound = function(sound) {
    if (sound) {
      document.querySelector("#disableSoundBtn").style.display = "";
      document.querySelector("#enableSoundBtn").style.display = "none";
      document.querySelector("#soundSwitch").checked = sound;
      CONFIG.sound = sound;
      return CONFIG.update();
    } else {
      document.querySelector("#disableSoundBtn").style.display = "none";
      document.querySelector("#enableSoundBtn").style.display = "";
      document.querySelector("#soundSwitch").checked = sound;
      CONFIG.sound = sound;
      return CONFIG.update();
    }
  };

  changeSound(CONFIG.sound);

  document.querySelector("#disableSoundBtn").addEventListener("click", function() {
    return changeSound(false);
  });

  document.querySelector("#enableSoundBtn").addEventListener("click", function() {
    return changeSound(true);
  });

  document.querySelector("#soundSwitch").addEventListener("change", function() {
    return changeSound(this.checked);
  });

  document.querySelector("#vibrationSwitch").addEventListener("change", function() {
    CONFIG.vibration = this.checked;
    return CONFIG.update();
  });

  document.querySelector("#notificationsSwitch").addEventListener("change", function() {
    if (this.checked) {
      Notification.requestPermission(function(perm) {
        if (perm === "granted") {
          CONFIG.notifications = true;
          return CONFIG.update();
        } else {
          document.querySelector("#notificationsSwitch").checked = false;
          CONFIG.notifications = false;
          return CONFIG.update();
        }
      });
    } else {
      CONFIG.notifications = false;
      CONFIG.update();
    }
    return CONFIG.update();
  });

  $(window).swipe({
    allowPageScroll: "vertical",
    swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
      if (direction === "right") {
        return $(".mdl-layout__drawer-button").click();
      } else if (direction === "left") {
        return $(".mdl-layout__obfuscator").click();
      }
    }
  });

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

  title = document.querySelector("title").innerHTML;

  printTimeout = null;

  setInterval(function() {
    if (document.querySelector("title").innerHTML === title && newMsgCount > 0 && !window.active) {
      return document.querySelector("title").innerHTML = newMsgCount.toString() + (newMsgCount === 1 ? " новое сообщение" : newMsgCount > 1 && newMsgCount < 5 ? " новых сообщения" : " новых сообщений");
    } else {
      return document.querySelector("title").innerHTML = title;
    }
  }, 1000);

  document.querySelector("textarea").addEventListener("keydown", function(e) {
    socket.emit("smsg", {
      code: 3,
      text: "Собеседник набирает сообщение"
    });
    if (e.keyCode === 13 && !e.shiftKey) {
      sendMessage();
      return e.preventDefault();
    }
  });

  document.querySelector("#send").addEventListener("click", function() {
    return sendMessage();
  });

  newMsgCount = 0;

  socket.on("msg", function(data) {
    MSGBOX.push(new Message(data, "stranger", data.id));
    if (CONFIG.vibration) {
      navigator.vibrate(300);
    }
    if (CONFIG.sound) {
      (new Audio("/sounds/inmsg.mp3")).play();
    }
    if (CONFIG.notifications) {
      new Notification("Новое сообщение | NFCHAT", {
        body: data
      });
    }
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
      clearTimeout(printTimeout);
      document.querySelector("#startChat").style.display = "";
      document.querySelector("#stopChat").style.display = "none";
      document.querySelector("#send").disabled = true;
      document.querySelector("#sysmsg").innerHTML = "Соединение разорвано";
      if (CONFIG.vibration) {
        navigator.vibrate(300);
      }
      if (CONFIG.sound) {
        return (new Audio("/sounds/disconnect.mp3")).play();
      }
    } else if (data.code === 1) {
      connected = true;
      document.querySelector("#startChat").style.display = "none";
      document.querySelector("#stopChat").style.display = "";
      document.querySelector("#send").disabled = false;
      document.querySelector("#sysmsg").innerHTML = "Соединение установлено";
      document.querySelector("textarea").focus();
      if (CONFIG.vibration) {
        navigator.vibrate(300);
      }
      if (CONFIG.sound) {
        return (new Audio("/sounds/connect.mp3")).play();
      }
    } else if (data.code === 2) {
      MSGBOX.push(new Message(data.msg, "me", data.id, data.atachment));
      if (CONFIG.vibration) {
        navigator.vibrate(300);
      }
      if (CONFIG.sound) {
        return (new Audio("/sounds/outmsg.mp3")).play();
      }
    } else if (data.code === 3) {
      clearTimeout(printTimeout);
      printTimeout = setTimeout(function() {
        return document.querySelector("#sysmsg").innerHTML = "";
      }, 2000);
      return document.querySelector("#sysmsg").innerHTML = "Собеседник печатает";
    } else if (data.code === 4) {
      return MSGBOX.readAll();
    } else if (data.code === 5) {
      $("#usersNum").text(data.content);
      return $("#usersTooltip").text("В данный момент на сайте " + $("#usersNum").text() + ($("#usersNum").text()[$("#usersNum").text().length - 1] / 1 === 1 ? " пользователь" : $("#usersNum").text()[$("#usersNum").text().length - 1] / 1 > 1 && $("#usersNum").text()[$("#usersNum").text().length - 1] / 1 < 5 ? " пользователя" : " пользователей"));
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

  sendMessage = function() {
    var msg;
    document.querySelector("textarea").focus();
    msg = document.querySelector("textarea").value;
    if (msg.length > 0) {
      socket.emit("msg", msg);
      return document.querySelector("textarea").value = "";
    }
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
