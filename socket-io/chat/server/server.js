const { Server } = require("socket.io");

// 소켓 서버 생성
const io = new Server("5000", {
  // 접근 제한 추가
  cors: {
    origin: "http://localhost:3000",
  },
});

io.sockets.on("connection", (socket) => {
  // 커스텀 구분자인 "message"로 클라이언트에서 오는 메세지 받음
  socket.on("message", (data) => {
    socket.broadcast.emit("sMessage", data);
  });

  // 커스텀 구분자인 "login"로 클라이언트에서 오는 메세지 받음
  socket.on("login", (data) => {
    socket.broadcast.emit("sLogin", data);
  });

  socket.on("disconnect", () => {
    console.log("client has disconnected");
  });
});
