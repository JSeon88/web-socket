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

    if (target) {
      const toUser = clients.get(target);
      io.sockets.to(toUser).emit("sMessage", data);
      return;
    }

    const myRooms = Array.from(socket.rooms);
    if (myRooms.length > 1) {
      // 지정된 방에만 데이터 전송
      // broadcast를 붙인 이유는 내가 보낸 메세지는 스스로 받지 않기 위함임.
      socket.broadcast.in(myRooms[1]).emit("sMessage", data);
      return;
    }
    socket.broadcast.emit("sMessage", data);
  });

  // 커스텀 구분자인 "login"로 클라이언트에서 오는 메세지 받음
  socket.on("login", (data) => {
    const { userId, roomNumber } = data;

    // 특정 방으로 접속
    socket.join(roomNumber);
    // socket.id : 소켓의 고유 번호
    clients.set(userId, socket.id);
    socket.broadcast.emit("sLogin", data);
  });

  socket.on("disconnect", () => {
    console.log("client has disconnected");
  });
});
