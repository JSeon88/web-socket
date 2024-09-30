const WebSocket = require("ws");

// 웹 소켓 생성
const wss = new WebSocket.Server({ port: 5000 });

wss.on("connection", (ws) => {
  // ws 모듈은 접속한 사용자에게 동일한 메세지를 출력하기 위한 브로드캐스트라는 메소드가 없음
  const breadCastHandler = (msg) => {
    wss.clients.forEach((client) => {
      // 내가 보낸 메세지를 내가 받지 않기 위해
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  ws.on("message", (res) => {
    const { type, data, id } = JSON.parse(res);
    switch (type) {
      case "id":
        breadCastHandler(JSON.stringify({ type: "welcome", data }));
        break;
      case "msg":
        breadCastHandler(JSON.stringify({ type: "other", data, id }));
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    console.log("client has disconnected");
  });
});
