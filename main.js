const letters = document.querySelectorAll('.game-board');
const loadingDiv = document.querySelector('.info-bar');
const heading = document.querySelector('.heading')

async function init() {
    const ANSWER_LENGTH = 5
    let currentRow = 0;
    let isLoading = true;
    const maxRow = 6


    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordsplited = word.split("");
    let currentGuess = '';
    let done = false;
    setLoading(false)
    isLoading = false;
    


    function addLetter(letter){
        if (currentGuess.length < ANSWER_LENGTH){
            currentGuess += letter;
        } else{
            currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    function backspace() {
        if (currentGuess.length > 0){
            letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1 ].innerText = "";
            currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        }
    }

    function markInvalidWord(){
        for(let i = 0; i < ANSWER_LENGTH; i++){
            letters[ANSWER_LENGTH * currentRow + i ].classList.add("invalid");
        }
    }

    async function commit() {
        if(currentGuess.length !== ANSWER_LENGTH){
            return;
        } 


        isLoading = true;
        setLoading(isLoading);

        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word:currentGuess})
        })

        const resObj = await res.json();
        const { validWord } = resObj;

        isLoading = false;
        setLoading(isLoading);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        const arrayGuess = currentGuess.split("");
        const map = makeMap(wordsplited);

        for(let i = 0; i < ANSWER_LENGTH; i++){
            if (arrayGuess[i] == wordsplited[i]){
                letters[ANSWER_LENGTH * currentRow + i ].classList.add("correct");
                map[arrayGuess[i]]--;
            } 
        }

        for(let i = 0; i < ANSWER_LENGTH; i++){
            if (arrayGuess[i] == wordsplited[i]){
                //nothing
            } else if(wordsplited.includes(arrayGuess[i]) && map[arrayGuess[i]]){
                letters[ANSWER_LENGTH * currentRow + i ].classList.add("close");
                map[arrayGuess[i]]--;
            } else{
                letters[ANSWER_LENGTH * currentRow + i ].classList.add("wrong");
            }
        }

        currentRow++;

        if(currentGuess === word){
            alert('you win!!!!');
            heading.classList.add("win")
            done = true;
            return;
        } else if (currentRow === maxRow){
            alert('you lose!!!');
            dont = true;
            return
        }

        currentGuess='';
    }
    
    document.addEventListener("keydown", function keyhandle (event){
        if (done||isLoading){
            return
        }

        const action = event.key;

        if (action === 'Enter'){
            commit();
        } else if (action === 'Backspace'){
            backspace();
        } else if (isLetter(action)){
            addLetter(action.toUpperCase())
        } else {

        }
    })

    function setLoading(isLoading){
        loadingDiv.classList.toggle('show',isLoading)
    }

    function makeMap(array){
        const obj = {};
        for (let i = 0; i < ANSWER_LENGTH; i++){
            const letter = array[i]
            if (obj[letter]){
                obj[letter]++;
            } else {
                obj[letter] = 1;
            }
        }
        return obj;
    }
}

init();
