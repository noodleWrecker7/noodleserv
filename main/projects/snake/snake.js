let cvs; //cvs variables
let ctx;
const fps = 10; //fps update rate
let topScore;
let score;
let showingEnd = false;
let tailLength = 1;
let startLength = tailLength;
let xv = 0; // velocity
let yv = 0;
let trailCoords = []; // map of current position
const gridArray = []; // trueArray squares
let gridEdgePadding = 2;
let gridGap = 2;
let gridSize = 18;
let gridRows = 28;
let gridColumns = 28;
let head = {x: 14, y: 13};
let apple = {x: 0, y: 0};
let left, up, down, right, acLeft, acUp, acDown, acRight;
const endScreenBufferMax = 10;
let endBufferTicked = 0;

window.onload = function () {
    cvs = document.getElementById('snakeCanvas');
    ctx = cvs.getContext('2d');
    let scoreHTMl = document.getElementById("currentScore");
    let topScoreHTML = document.getElementById("topScore");

    document.addEventListener("keydown", keyPush);
    initialiseGrid();
    generateApple();
    topScore = getCookie("highScore");
    setInterval(function () {
        if (!showingEnd) {
            moveEverything();
            drawEverything();
            scoreHTMl.innerText = "Score: " + (tailLength - startLength);
            topScoreHTML.innerHTML = "High score: " + (topScore);
        } else {
            showEnd();
        }
    }, 1000 / fps);
};

function reset() {
    if (endBufferTicked > endScreenBufferMax) {
        trailCoords = [];
        head = {x: 14, y: 13};
        apple = {x: 0, y: 0};
        tailLength = startLength;
        endBufferTicked = 0;
        generateApple();
        xv = 0;
        yv = 0;
        showingEnd = false;
        setCookie("highScore", topScore, 7);
        score = 0;
        document.removeEventListener("mousedown", reset);
    }
}

function fail() {
    score = tailLength - startLength;
    showingEnd = true;
    document.addEventListener("mousedown", reset);
    setCookie("highScore", topScore, 7);
}

function showEnd() {
    ctx.fillStyle = "white";
    ctx.font = '50px Arial';
    ctx.fillText("Game Over! Score: " + score, 20, 180);
    ctx.fillText("Click anywhere to start", 20, 240);

    endBufferTicked++;
}

function moveEverything() {
    // move snake
    head.x += xv;
    head.y += yv;

    acLeft = left;
    acRight = right;
    acUp = up;
    acDown = down;


    if (head.y < 0) { // off top
        // head.y = gridRows - 1;
        fail();
        head.y++;
    }
    if (head.y >= gridRows) { // off bottom
        // head.y = 0;
        fail();
        head.y--;
    }
    if (head.x < 0) { // off left
        // head.x = gridColumns - 1;
        fail();
        head.x++;
    }
    if (head.x >= gridColumns) { // off right
        // head.x = 0;
        fail();
        head.x--;
    }

    trailCoords.push({x: head.x, y: head.y});
    while (trailCoords.length > tailLength) {
        trailCoords.shift();
    }

    // check collisions


}


function drawEverything() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // globalDraw snake
    for (let i = 0; i < trailCoords.length; i++) {
        ctx.fillStyle = "lime";
        let gC = trailCoords[i]; // trueArray co-ord
        ctx.fillRect(gridArray[gC.x][gC.y].x, gridArray[gC.x][gC.y].y, gridSize, gridSize);

        // collide self
        if (gC.x === head.x && gC.y === head.y && i !== trailCoords.length - 1) {
            // tailLength = trailCoords.length - i;
            fail();
        }

        // collide apple
        if (gC.x === apple.x && gC.y === apple.y) {
            tailLength++;
            score = tailLength -startLength;
            generateApple();
        }

        // top score
        if (topScore < tailLength) {
            topScore = tailLength - startLength;
        }
    }

    ctx.fillStyle = "red";
    aPos = gridArray[apple.x][apple.y];
    ctx.fillRect(aPos.x, aPos.y, gridSize, gridSize);
}

function generateApple() {
    apple.x = Math.floor(Math.random() * gridColumns);
    apple.y = Math.floor(Math.random() * gridRows);
}

function initialiseGrid() {
    for (let c = 0; c <= gridColumns; c++) {
        gridArray[c] = [];
        for (let r = 0; r <= gridRows; r++) {
            gridArray[c][r] = {
                x: c * (gridSize + gridGap) + gridEdgePadding / 2,
                y: r * (gridSize + gridGap) + gridEdgePadding / 2
            };
        }
    }
}

function keyPush(e) {
    let id = e.key;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
    }

    // left
    if ((id === 'a' || id === 'ArrowLeft') && !acRight) {
        xv = -1;
        yv = 0;
        left = true;
        up = false;
        right = false;
        down = false;
    }
    // up
    if ((id === 'w' || id === 'ArrowUp') && !acDown) {
        xv = 0;
        yv = -1;
        left = false;
        up = true;
        right = false;
        down = false;
    }
    // right
    if ((id === 'd' || id === 'ArrowRight') && !acLeft) {
        xv = 1;
        yv = 0;
        left = false;
        up = false;
        right = true;
        down = false;
    }
    // down
    if ((id === 's' || id === 'ArrowDown') && !acUp) {
        xv = 0;
        yv = 1;
        left = false;
        up = false;
        right = false;
        down = true;
    }
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/projects/snake";
}

function getCookie(a) {
    const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}