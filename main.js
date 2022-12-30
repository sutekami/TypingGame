// タイピングする文章一覧
let strObjArr = ['I have a pen',
'I think that you are so crazy',
'There is always light behind the clouds'];
let str = randomStr();
let strList = '';
let div = document.querySelector('div');
let count = 0; //printStr関数の際に使用するカウンター
printStr(str);

// タイピング機能
let num = 0; // id検索のカウンター
document.addEventListener('keydown', function(e){
    if (strList[num] === e.key){
        let span = document.querySelector(`#str${num}`);
        span.style.color = 'red';
        num++;
        if (num === strList.length){
            num = 0;
            div.innerHTML = '';
            printStr(randomStr());
        }
    }
})

//文字列表示
function printStr(string){
    for (let i = 0; i < string.length; i++){
        if (string[i] === ' '){
            div.append(' ');
        }else{
            let span = document.createElement('span');
            span.innerHTML = string[i];
            span.id = 'str' + count;
            div.append(span);
            count++;
        }
    }

    count = 0;
    strList = string.replace(/\s/g, '').split('');
}

//ランダムに文字列を取ってくる
function randomStr() {
    let index = Math.trunc(Math.random() * strObjArr.length + 1);
    return strObjArr[index - 1];
}

//最後の文字まで打ち終わったら文字を切り替える