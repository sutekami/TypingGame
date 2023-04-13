import { useRef, useState } from 'react';
import { useKey } from 'rooks';

function Game({ trueOrFalse, userName, partnerNameRef, typingStr, beColored, strCounter2, changePartnerString, backHome, matchingStop, changeResult, resultTOF, setResultTOF }) {
  useKey(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'], e => {
    if (!trueOrFalse) keyDownFunction(e);
  });
  const [strCounter1, setStrCounter1] = useState(0);
  let counterRef1 = useRef(0);
  let counterMaxRef = useRef(0);

  function keyDownFunction(e) {
    if (counterRef1.current < counterMaxRef.current) {
      const span = document.getElementById(`player1_${counterRef1.current}`);

      if (span.innerText === e.key) {
        span.classList.add('beColored');
        beColored();
        counterRef1.current += 1
        if (counterRef1.current === counterMaxRef.current && strCounter1 < 2) {
          changePartnerString();
          counterRef1.current = 0;
          setStrCounter1(strCounter1 => strCounter1 += 1);
        } else if (counterRef1.current === counterMaxRef.current && strCounter1 === 2) {
          changeResult();
          setResultTOF(resultTOF => !resultTOF);
        }
      }
    }
  }

  function TypingStrAroundedSpan1() {
    const elems = [];

    for (let i = 0; i < typingStr[strCounter1].romaji.length; i++) {
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

    for (let i = 0; i < typingStr[strCounter2].romaji.length; i++) {
      const idName = `player2_${i}`
      elems.push(<span id={idName} key={idName}>{typingStr[strCounter2].romaji[i]}</span>);
    }

    return (
      <div>
        {elems}
      </div>
    )
  }

  function Result() {
    function resultFunction() {
      setStrCounter1(strCounter1 => 0);
      counterRef1.current = 0;
      backHome();
      matchingStop();
      setResultTOF(resultTOF => !resultTOF);
    }

    if (resultTOF) {
      return (
        <div id="result">
          ゲーム終了！
          <input type="button" value="ホームに戻る" onClick={resultFunction} />
        </div>
      );
    }
  }

  if (!trueOrFalse) {
    return (
      <div id="Game">
        <Result />
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

export default Game;