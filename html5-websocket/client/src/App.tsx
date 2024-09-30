import React, { useEffect, useRef, useState } from 'react';
import logo from './assets/websocket.png';
import './App.css';

type Msg = {
  id: string;
  type: string;
  msg: string;
};

// 웹 소켓을 객체를 초기화하고 연결
const webSocket = new WebSocket('ws://localhost:5000');

function App() {
  const messagesEndRef = useRef<HTMLLIElement>(null);
  const [userId, setUserId] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [msg, setMsg] = useState('');
  // Webchat에 필요한 상태 변수
  const [msgList, setMsgList] = useState<Msg[]>([]);

  const scrollTopBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    // 처음 소켓이 연결되면 실행
    webSocket.onopen = () => {
      console.log('open', webSocket.protocol);
    };

    // 서버에서 온 메세지를 받음
    webSocket.onmessage = (e: MessageEvent) => {
      // 문자열 형태로 메세지가 전송되기 때문에 parse
      const { data, id, type } = JSON.parse(e.data);
      // type : welcome | other
      setMsgList((prev: Msg[]) => [...prev, { id, type, msg: type === 'welcome' ? `${data} joins the chat` : data }]);
    };

    // 소켓 연결 종료
    webSocket.onclose = () => {
      console.log('close');
    };
  }, []);

  useEffect(() => {
    // 자동으로 스크롤 아래로
    scrollTopBottom();
  }, [msgList]);

  // 로그인
  const onSubmitHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const sendData = {
      type: 'id',
      data: userId
    };
    if (webSocket.readyState === webSocket.OPEN) {
      webSocket.send(JSON.stringify(sendData));
      setIsLogin(true);
    } else {
      console.log('연결되지 않은 상태입니다. : ', webSocket.readyState);
    }
  };

  const onChangeUserIdHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  // 메세지 전송
  const onSendSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    const sendDate = {
      type: 'msg',
      data: msg,
      id: userId
    };

    // 내가 보낸 메세지를 다른 사람들에게 모두 전송
    webSocket.send(JSON.stringify(sendDate));
    setMsgList((prev: Msg[]) => [...prev, { id: userId, type: 'me', msg }]);
    setMsg('');
  };

  const onChangeMsgHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  return (
    <div className="app-container">
      <div className="wrap">
        {isLogin ? (
          <div className="chat-box">
            <h3>Login as a "{userId}"</h3>
            <ul className="chat">
              {msgList.map((msg, idx) =>
                msg.type === 'welcome' ? (
                  <li className="welcome">
                    <div className="line" />
                    <div>{msg.msg}</div>
                    <div className="line" />
                  </li>
                ) : (
                  <li
                    className={msg.type}
                    key={`${idx}_li`}
                  >
                    <div className="userId">{msg.id}</div>
                    <div className={msg.type}>{msg.msg}</div>
                  </li>
                )
              )}
              <li ref={messagesEndRef} />
            </ul>
            <form
              className="send-form"
              onSubmit={onSendSubmitHandler}
            >
              <input
                placeholder="Enter your message"
                onChange={onChangeMsgHandler}
                value={msg}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        ) : (
          <div className="login-box">
            <div className="login-title">
              <img
                src={logo}
                width="40px"
                height="40px"
                alt="logo"
              />
              <div>WebChat</div>
            </div>
            <form
              className="login-form"
              onSubmit={onSubmitHandle}
            >
              <input
                placeholder="Enter your ID"
                onChange={onChangeUserIdHandler}
                value={userId}
              />
              <button type="submit">Login</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
