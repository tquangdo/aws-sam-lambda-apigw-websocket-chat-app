const websocket_endpoint = "wss://###.execute-api.us-east-1.amazonaws.com/Prod"
const fetch_messages_endpoint = "https://###.execute-api.us-east-1.amazonaws.com/Prod/prod"

var ws = new WebSocket(websocket_endpoint);
function setupWebsocket() {
  ws.onopen = (e) => {
    console.log('Connection opened!');
  }
  ws.onclose = function () {
    ws = null;
    console.log('Connection closed!');
    setTimeout(setupWebsocket, 1000);
  }
  ws.onmessage = function (e) {
    var data = JSON.parse(e.data);
    console.log(data)
    const message_entity = new Message(data.message, data.from, new Date(data.time))
    App.messages.push(message_entity);
    App.sendMessage();
    App.refreshChat();
  }
}
setupWebsocket()

class App {
  static messages = [];
  static sendMessage() {
    let message = document.getElementById("newMessage").value;
    let from = document.getElementById("from").value;
    localStorage.setItem("from", from);
    const message_entity = new Message(message, from)
    App.messages.push(message_entity);
    document.getElementById("newMessage").value = "";
    App.refreshChat();
    ws.send(JSON.stringify(Object.assign({ "action": "sendmessage" }, message_entity)));
  }

  static refreshChat() {
    let div = document.getElementById("chat-content");
    for (
      let index = div.childNodes.length - 1;
      index < App.messages.length;
      index++
    ) {
      const element = App.messages[index];
      let msg = document.createElement("span");

      msg.id = "msg-" + index;
      msg.classList.add("msg");
      msg.innerHTML = "<div class='head'> " + element.from + " </div>";
      msg.innerHTML += "<p class='body'> " + element.message + " </p>";
      msg.innerHTML += "<div class='footer'> " + element.timeStr + " </div>";
      div.appendChild(msg);
    }
  }
}

class Message {
  constructor(msg, from, time = null) {
    this.message = msg;
    if (time === null) { this.time = new Date(Date.now()); }
    else { this.time = time }
    this.timeStr = this.time.toLocaleTimeString();
    this.from = from;
  }
}

let activated = false;
let emojiBtn = document.getElementById("emoji");

let emojiList = [
  "👍",
  "👌",
  "👏",
  "🙏",
  "🆗",
  "🙂",
  "😀",
  "😃",
  "😉",
  "😊",
  "😋",
  "😌",
  "😏",
  "😐",
  "😑",
  "😒",
  "😓",
  "😂",
  "🤣",
  "😅",
  "😆",
  "😜",
  "😹",
  "🚶",
  "👫",
  "👬",
  "👭",
  "😙",
  "😘",
  "🏠",
  "👆",
  "🖕",
  "👋",
  "👎",
  "👈",
  "👉"
];
emojiList.forEach(element => {
  let list = document.getElementById("emoji-list");
  let node = document.createElement("span");
  node.classList.add("emoji");
  node.textContent = element;
  node.onclick = ev => {
    document.getElementById("newMessage").value += node.textContent;
  };
  list.appendChild(node);
});

emojiBtn.onclick = function (evt) {
  console.log("clicked")
  activated = !activated;

  let list = document.getElementById("emoji-list");
  if (activated) {
    list.style.display = "flex";
  } else {
    list.style.display = "none";
  }
};

document.getElementById("from").value =
  localStorage.getItem("from") !== undefined
    ? localStorage.getItem("from")
    : "";
App.messages = new Array();

let div = document.getElementById("chat-content");
for (let index = 0; index < App.messages.length; index++) {
  const element = App.messages[index];
  let msg = document.createElement("span");

  msg.id = "msg-" + index;
  msg.classList.add("msg");
  msg.innerHTML = "<div class='head'> " + element.from + " </div>";
  msg.innerHTML += "<p class='body'> " + element.message + " </p>";
  msg.innerHTML += "<div class='footer'> " + element.timeStr + " </div>";
  div.appendChild(msg);
}

fetch(fetch_messages_endpoint)
  .then(response => response.json())
  .then((data) => {
    data.forEach(item => {
      const message_entity = new Message(item.message, item.from, new Date(item.time))
      App.messages.push(message_entity);
      App.refreshChat();
    })
  });
