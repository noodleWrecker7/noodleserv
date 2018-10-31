let cvs; //cvs variables
let ctx;
const fps = 10; //fps update rate
let topScore = getCookie("topScore");
let score;
let showingEnd = false;
let tailLength = 2;
let xv = 0; // velocity
let yv = 1;
let trailCoords = []; // map of current position
var grid = []; // grid squares
let gridEdgePadding = 0;
let gridGap = 2;
let gridSize = 18;
let gridRows = 28;
let gridColumns = 28;
let head = {x: 14, y: 0};
let apple = {x: 0, y: 0};
var left, up, down, right, acLeft, acUp, acDown, acRight;
var endScreenBufferMax = 10;
var endBufferTicked = 0;

window.onload = function () {
    cvs = document.getElementById('snakeCanvas');
    ctx = cvs.getContext('2d');
    scoreHTMl = document.getElementById("currentScore");
    topScoreHTML = document.getElementById("topScore");

    document.addEventListener("keydown", keyPush);
    initialiseGrid();
    generateApple();

    setInterval(function () {
        if (!showingEnd) {
            moveEverything();
            drawEverything();
            scoreHTMl.innerText = "Score: " + (tailLength - 2);
            topScoreHTML.innerHTML = "High score: " + (topScore);
        } else {
            showEnd();
        }
    }, 1000 / fps);
};

function reset() {
    showingEnd = true;
}

function showEnd() {
    ctx.fillStyle = "white";
    ctx.font = '50px Arial';
    ctx.fillText("Game Over! Score: " + score, 20, 180);

    document.addEventListener("mousedown", function () {
        if (endBufferTicked > endScreenBufferMax) {
            score = tailLength - 2;
            trailCoords = [];
            head = {x: 14, y: 0};
            apple = {x: 0, y: 0};
            tailLength = 2;
            endBufferTicked = 0;
            generateApple();
            xv = 0;
            yv = 1;
            setCookie("highScore", topScore, 7);
            reset()
            showingEnd = false;
        }
    });
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


    console.log("Head at: " + head);
    if (head.y < 0) { // off top
        // head.y = gridRows - 1;
        reset()
        head.y++;
    }
    if (head.y >= gridRows) { // off bottom
        // head.y = 0;
        reset()
        head.y--;
    }
    if (head.x < 0) { // off left
        // head.x = gridColumns - 1;
        reset()
        head.x++;
    }
    if (head.x >= gridColumns) { // off right
        // head.x = 0;
        reset()
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

    // draw snake
    for (i = 0; i < trailCoords.length; i++) {
        ctx.fillStyle = "lime";
        let gC = trailCoords[i]; // grid co-ord
        ctx.fillRect(grid[gC.x][gC.y].x, grid[gC.x][gC.y].y, gridSize, gridSize);

        // collide self
        if (gC.x === head.x && gC.y === head.y && i !== trailCoords.length - 1) {
            // tailLength = trailCoords.length - i;
            reset()
        }

        // collide apple
        if (gC.x === apple.x && gC.y === apple.y) {
            tailLength++;
            generateApple();
        }

        // top score
        if (topScore < tailLength) {
            topScore = tailLength -2;
        }
    }

    ctx.fillStyle = "red";
    aPos = grid[apple.x][apple.y];
    ctx.fillRect(aPos.x, aPos.y, gridSize, gridSize);
}

function generateApple() {
    apple.x = Math.floor(Math.random() * gridColumns);
    apple.y = Math.floor(Math.random() * gridRows);
}

function initialiseGrid() {
    for (let c = 0; c <= gridColumns; c++) {
        grid[c] = [];
        for (let r = 0; r <= gridRows; r++) {
            grid[c][r] = {
                x: c * (gridSize + gridGap) + gridEdgePadding,
                y: r * (gridSize + gridGap) + gridEdgePadding
            };
        }
    }
}

function keyPush(e) {
    id = e.key;

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
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}