const { Server } = require("socket.io");

// 소켓 서버 생성
const io = new Server("5000", {
  // 접근 제한 추가
  cors: {
    origin: "http://localhost:3000",
  },
});

// 접속한 사용자 아이디를 저장하기 위한 Map 객체
const clients = new Map();

io.sockets.on("connection", (socket) => {
  // 커스텀 구분자인 "message"로 클라이언트에서 오는 메세지 받음
  socket.on("message", (data) => {
    const { target } = data;
    // 있다면 특정 유저한테, 없다면 일반적인 broadcast
    const toUser = clients.get(target);
    target
      ? io.sockets.to(toUser).emit("sMessage", data)
      : socket.broadcast.emit("sMessage", data);
  });

  // 커스텀 구분자인 "login"로 클라이언트에서 오는 메세지 받음
  socket.on("login", (data) => {
    // socket.id : 소켓의 고유 번호
    clients.set(data, socket.id);
    socket.broadcast.emit("sLogin", data);
  });

  socket.on("disconnect", () => {
    console.log("client has disconnected");
  });
});
