import { useEffect, useRef, useState } from 'react';
import { useKey } from 'rooks';
import './App.css';
import { io } from 'socket.io-client';

function Home({ userName, setUserName, trueOrFalse, matching }) {
  function detectUserName() {
    const userName = document.getElementById('Home-username-text');
    if (!userName.value){
      alert('ユーザー名を入力してください');
    } else {
      return setUserName(() => userName.value);
    }
  }
  
  function matchingAndRemove() {
    if (!userName){
      alert('ユーザー名を登録してください');
    } else {
      matching();
      const div = document.getElementById('Home-matching');
      div.innerHTML = '<span>マッチング中...</span>';
    }
  }

  function LogUserName() {
    if (userName){
      return userName;
    } else {
      return;
    }
  }

  if (trueOrFalse){
    return (
      <div id="Home">
        <h1>Typing Game</h1>
        <div id="Home-username">
          <input type="text" placeholder="ユーザー名" id="Home-username-text" />
          <input type="button" value="登録" id="Home-username-button" onClick={detectUserName} />
        </div>
        <div id="Home-matching">
          <input type="button" value="マッチ開始" id="Home-matching-button" onClick={matchingAndRemove} />
        </div>
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

function Game({ trueOrFalse, userName, partnerNameRef, typingStr, beColored, strCounter2, changePartnerString, backHome }) {
  useKey(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'], e => {
    if (!trueOrFalse) keyDownFunction(e);
  });
  const [strCounter1, setStrCounter1] = useState(0);
  let counterRef1 = useRef(0);
  let counterMaxRef = useRef(0);
  
  function keyDownFunction(e) {
    if (counterRef1.current < counterMaxRef.current){
      const span = document.getElementById(`player1_${counterRef1.current}`);
      
      if (span.innerText === e.key){
        span.classList.add('beColored');
        beColored();
        counterRef1.current += 1
        if (counterRef1.current === counterMaxRef.current && strCounter1 < 2) {
          changePartnerString();
          counterRef1.current = 0;
          setStrCounter1(strCounter1 => strCounter1 += 1);
        } else if (counterRef1.current === counterMaxRef.current && strCounter1 === 2){
          setStrCounter1(strCounter1 => 0);
          counterRef1.current = 0;
          backHome();
        }
      }
    }
  }
  
  function TypingStrAroundedSpan1() {
    const elems = [];

    for (let i = 0; i < typingStr[strCounter1].romaji.length; i++){
      const idName = `player1_${i}`
      elems.push(<span id={idName} key={idName}>{typingStr[strCounter1].romaji[i]}</span>);
    }

    counterMaxRef.current = elems.length;

    return (
      <div>
        {elems}
      </div>
    )
  }

  function TypingStrAroundedSpan2() {
    const elems = [];

    for (let i = 0; i < typingStr[strCounter2].romaji.length; i++){
      const idName = `player2_${i}`
      elems.push(<span id={idName} key={idName}>{typingStr[strCounter2].romaji[i]}</span>);
    }

    return (
      <div>
        {elems}
      </div>
    )
  }

  if (!trueOrFalse){
    return (
      <div id="Game">
        <div id="player1" className="player">
          <div className="playerName">
            {userName}
          </div>
          <div id="typingRomaji1" className="typingRomaji">{typingStr[strCounter1].yomi}</div>
          <div id="typingStr1" className="typingStr"><TypingStrAroundedSpan1 /></div>
        </div>
        <div id="player2" className="player">
          <div className="playerName">
            {partnerNameRef.current}
          </div>
          <div id="typingRomaji2" className="typingRomaji">{typingStr[strCounter2].yomi}</div>
          <div id="typingStr2" className="typingStr"><TypingStrAroundedSpan2 /></div>
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
    socketRef.current = io(`http://10.87.182.76:3001`);

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
      setStrCounter2(strCounter2 => 0);
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

  return (
    <div id="App">
      <Home
        userName={userName}
        setUserName={setUserName}
        trueOrFalse={trueOrFalse}
        matching={matching}
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