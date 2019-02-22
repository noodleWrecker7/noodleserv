let game;
let wordsList;
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.-";

window.onload = function () {
    let x = new XMLHttpRequest();
    x.open('GET', "extremewords.json", false);
    wordsList = null;
    x.onload = function () {
        wordsList = JSON.parse(this.response);
    };
    x.send();
    game = new HangmanGame();
};

class HangmanGame {

    constructor() {
        this.stage = 0;
        HangmanGame.createKeypad();
        this.chooseWord();
        this.createWordHtml(this.chosenWord);
        document.getElementById("missed-letters").innerText = "";
        document.getElementById("status-message").innerText = "";
        document.getElementById("hangman-image").src = "img/Hangman-0.png";
    }

    chooseWord() {
        let n = Math.floor(Math.random() * wordsList.length);
        this.chosenWord = wordsList[n];
        this.chosenWord = this.chosenWord.replace(" ", "");
        this.wordDiscoveredArray = [];
        for (let i = 0; i < this.chosenWord.length; i++) {
            this.wordDiscoveredArray.push(" ");
        }

    }

    nextStage() {
        this.stage++;
        document.getElementById("hangman-image").src = "img/Hangman-" + this.stage + ".png";
        if (this.stage >= 8) {
            this.gameOver();
        }
    }

    gameOver() {
        for (let i = 0; i < letters.length; i++) {
            document.getElementById("KeyPadButton-" + letters[i]).className = "keyButton used";
            document.getElementById("KeyPadButton-" + letters[i]).onclick = "";
        }
        document.getElementById("status-message").innerText = "YOU LOSE!";
        for (let i = 0; i < this.chosenWord.length; i++) {
            document.getElementById("letter-"+i).innerText = this.chosenWord[i];
        }
    }

    useLetter(button) {
        button.className = "keyButton used";
        button.onclick = ""; // to let the letter not be used twice
        let letter = button.id[13].toLowerCase();
        if (this.chosenWord.includes(letter)) {
            for (let i = 0; i < this.chosenWord.length; i++) {
                if (this.chosenWord[i] == letter) {
                    document.getElementById("letter-" + i).innerText = letter;
                    this.wordDiscoveredArray[i] = letter;
                    this.wordDiscovered = this.wordDiscoveredArray.join("");
                }
            }
        } else {
            if (document.getElementById("missed-letters").innerText != "") {
                document.getElementById("missed-letters").innerText += ", " + letter;
            } else {
                document.getElementById("missed-letters").innerText += letter;
            }
            this.nextStage();
        }
        if (this.wordDiscovered == this.chosenWord) {
            document.getElementById("status-message").innerText = "YOU WIN!"
        }
    }


    createWordHtml() {
        let container = document.getElementById("word-container");
        container.innerHTML = "";
        for (let i = 0; i < this.chosenWord.length; i++) {
            let div = document.createElement("DIV");

            let idAtt = document.createAttribute("id");
            idAtt.value = "letter-" + i;
            div.setAttributeNode(idAtt);

            let classAtt = document.createAttribute("class");
            classAtt.value = "letter";
            div.setAttributeNode(classAtt);

            container.appendChild(div);
        }
    }

    static createKeypad() {

        let kPad = document.getElementById("keypad");
        kPad.innerHTML = "";

        for (let i = 0; i < letters.length; i++) {
            let btn = document.createElement("BUTTON");

            let t = document.createTextNode(letters[i]);
            btn.appendChild(t);

            let idAtt = document.createAttribute("id");
            idAtt.value = "KeyPadButton-" + letters[i];
            btn.setAttributeNode(idAtt);

            let classAtt = document.createAttribute("class");
            classAtt.value = "keyButton unused";
            btn.setAttributeNode(classAtt);

            let onClickAtt = document.createAttribute("onclick");
            onClickAtt.value = "game.useLetter(this)";
            btn.setAttributeNode(onClickAtt);

            kPad.appendChild(btn);
        }
    }
}
