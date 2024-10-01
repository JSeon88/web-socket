import React, { useEffect, useRef, useState } from 'react';
import logo from './assets/iologo.png';
import './App.css';

import { io } from 'socket.io-client';

type Msg = {
  id: string;
  type: string;
  msg: string;
  target?: string;
};

// socket.io 초기화
// socket.io는 웹 소켓의 구현체가 아니기 때문에 프로토콜(ws://) 없이 연결 가능
const webSocket = io('http://localhost:5000');

function App() {
  const messagesEndRef = useRef<HTMLLIElement>(null);
  const [userId, setUserId] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [msg, setMsg] = useState('');
  // Webchat에 필요한 상태 변수
  const [msgList, setMsgList] = useState<Msg[]>([]);
  // private 채팅을 위한 타겟
  const [privateTarget, setPrivateTarget] = useState<string>('');

  const scrollTopBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /** 서버에서 오는 메세지를 받는 이벤트 리스너 */
  useEffect(() => {
    if (!webSocket) {
      return;
    }

    const sMessageCallback = (data: Msg) => {
      const { msg, id, target } = data;
      setMsgList((prev: Msg[]) => [...prev, { id, type: target ? 'private' : 'other', msg }]);
    };

    webSocket.on('sMessage', sMessageCallback);
    // 이벤트 리스너 해제
    return () => {
      webSocket.off('sMessage', sMessageCallback);
    };
  }, []);

  /** 로그인 할때 아이디를 받는 'sLogin' 이벤트 등록 */
  useEffect(() => {
    if (!webSocket) {
      return;
    }
    const sLoginCallback = (msg: string) => {
      setMsgList((prev) => [
        ...prev,
        {
          msg: `${msg} joins the chat`,
          type: 'welcome',
          id: ''
        }
      ]);
    };
    webSocket.on('sLogin', sLoginCallback);
    return () => {
      webSocket.off('sLogin', sLoginCallback);
    };
  }, []);

  useEffect(() => {
    // 자동으로 스크롤 아래로
    scrollTopBottom();
  }, [msgList]);

  // 로그인
  const onSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    // 로그인 id를 소켓 서버로 전송
    webSocket.emit('login', userId);
    setIsLogin(true);
  };

  const onChangeUserIdHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  // 메세지 전송
  const onSendSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    const sendDate = {
      msg: msg,
      id: userId,
      target: privateTarget
    };
    webSocket.emit('message', sendDate);
    setMsgList((prev: Msg[]) => [...prev, { id: userId, type: 'me', msg }]);
    setMsg('');
  };

  const onChangeMsgHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const onSetPrivateTarget = (e: React.MouseEvent<HTMLLIElement>) => {
    const { id } = (e.target as HTMLLIElement)?.dataset;
    if (id) {
      setPrivateTarget((prev) => (prev === id ? '' : id));
    }
  };

  return (
    <div className="app-container">
      <div className="wrap">
        {isLogin ? (
          // 10
          <div className="chat-box">
            <h3>Login as a "{userId}"</h3>
            <ul className="chat">
              {msgList.map((v, i) =>
                v.type === 'welcome' ? (
                  <li
                    className="welcome"
                    key={`${i}_li`}
                  >
                    <div className="line" />
                    <div>{v.msg}</div>
                    <div className="line" />
                  </li>
                ) : (
                  <li
                    className={v.type}
                    key={`${i}_li`}
                    data-id={v.id}
                    onClick={onSetPrivateTarget}
                  >
                    <div
                      className={v.id === privateTarget ? 'private-user' : userId}
                      data-id={v.id}
                    >
                      {v.id}
                    </div>
                    <div
                      className={v.type}
                      data-id={v.id}
                    >
                      {v.msg}
                    </div>
                  </li>
                )
              )}
              <li ref={messagesEndRef} />
            </ul>
            <form
              className="send-form"
              onSubmit={onSendSubmitHandler}
            >
              {privateTarget && <div className="private-user">{privateTarget}</div>}
              <input
                placeholder="Enter your message"
                onChange={onChangeMsgHandler}
                value={msg}
              />
              <button type="submit">send</button>
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
              <div>IOChat</div>
            </div>
            <form
              className="login-form"
              onSubmit={onSubmitHandler}
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
