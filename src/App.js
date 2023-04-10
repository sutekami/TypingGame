import { useEffect, useRef, useState } from 'react';
import './App.css';
import Game from './Game';
import { io } from 'socket.io-client';

function Home({ userName, setUserName, trueOrFalse, matching, matchingStop }) {
  const [matchingTOF, setMatchingTOF] = useState(true);

  function detectUserName() {
    const userName = document.getElementById('Home-username-text');
    if (!userName.value) {
      alert('ユーザー名を入力してください');
    } else {
      return setUserName(() => userName.value);
    }
  }

  function LogUserName() {
    if (userName) {
      return userName;
    } else {
      return;
    }
  }

  function HomeMatchingButton() {
    function startMatching(){
      if (!userName){
        alert('ユーザー名を登録してください。');
      } else {
        matching();
        setMatchingTOF(matchingTOF => !matchingTOF);
      }
    }

    function cancelMatching(){
      matchingStop();
      setMatchingTOF(matchingTOF => !matchingTOF);
    }

    if (matchingTOF) {
      return (
        <div id="Home-matching">
          <input type="button" value="マッチ開始" onClick={startMatching} />
        </div>
      );
    } else {
      return (
        <div id="Home-matching">
          <input type="button" value="マッチキャンセル" onClick={cancelMatching} />
        </div>
      );
    }
  }

  if (trueOrFalse) {
    return (
      <div id="Home">
        <h1>Typing Game</h1>
        <div id="Home-username">
          <input type="text" placeholder="ユーザー名" id="Home-username-text" />
          <input type="button" value="登録" id="Home-username-button" onClick={detectUserName} />
        </div>
        <HomeMatchingButton />
        <div id="explain">
          自分の好きな名前を入力して登録してください
          <div>現在のユーザー名: <LogUserName /></div>
        </div>
      </div>
    );
  } else {
    return;
  }
}

export default function App() {
  let tokenRef = useRef();
  let socketRef = useRef();
  let roomIdRef = useRef();
  let partnerNameRef = useRef();
  // この下のカウンターは相手のカウンター
  const [strCounter2, setStrCounter2] = useState(0);
  let counterRef2 = useRef(0);
  // この上のカウンターは相手のカウンター
  const [userName, setUserName] = useState(null);
  const [typingStr, setTypingStr] = useState(null);
  const [trueOrFalse, setTrueOrFalse] = useState(true);

  useEffect(() => {
    // ipの取得がわからないので、環境変える都度ローカルアドレスを変える
    socketRef.current = io(`http://192.168.11.15:3001`);

    socketRef.current.on('socket_id', data => {
      tokenRef.current = data;
    });

    socketRef.current.on('room_id', data => {
      roomIdRef.current = data;
    });

    socketRef.current.on('match', data => {
      const room_info = data.room_info;
      (room_info.user1.token === tokenRef.current) ? partnerNameRef.current = room_info.user2.userName
        : partnerNameRef.current = room_info.user1.userName;
      setTypingStr(() => data.typingString);
      setTrueOrFalse(trueOrFalse => !trueOrFalse);
    });

    socketRef.current.on('coloring', () => {
      const span = document.getElementById(`player2_${counterRef2.current}`);
      span.classList.add('beColored');
      counterRef2.current += 1;
    });

    socketRef.current.on('changeString', () => {
      counterRef2.current = 0;
      setStrCounter2(strCounter2 => strCounter2 + 1);
    });

    socketRef.current.on('backHome', () => {
      setStrCounter2(() => 0);
      counterRef2.current = 0;
      setTrueOrFalse(trueOrFalse => !trueOrFalse);
    })

    return () => socketRef.current.disconnect();
  }, []);

  function matching() {
    socketRef.current.emit('matching', {
      token: tokenRef.current,
      userName: userName
    });
  }

  function beColored() {
    socketRef.current.emit('beColored', {
      token: tokenRef.current,
      roomId: roomIdRef.current,
    });
  }

  function changePartnerString() {
    socketRef.current.emit('changePartnerString', {
      token: tokenRef.current,
      roomId: roomIdRef.current,
    })
  }

  function backHome() {
    socketRef.current.emit('backHome', {
      token: tokenRef.current,
      roomId: roomIdRef.current
    });
    setTrueOrFalse(trueOrFalse => !trueOrFalse);
  }

  function matchingStop() {
    socketRef.current.emit('matchingStop', {
      token: tokenRef.current,
      roomId: roomIdRef.current,
    });
    roomIdRef.current = null;
  }

  return (
    <div id="App">
      <Home
        userName={userName}
        setUserName={setUserName}
        trueOrFalse={trueOrFalse}
        matching={matching}
        matchingStop={matchingStop}
      />
      <Game
        trueOrFalse={trueOrFalse}
        userName={userName}
        partnerNameRef={partnerNameRef}
        typingStr={typingStr}
        beColored={beColored}
        strCounter2={strCounter2}
        changePartnerString={changePartnerString}
        backHome={backHome}
      />
    </div>
  );
}