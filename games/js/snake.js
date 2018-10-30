let cvs; //cvs variables
let ctx;
const fps = 10; //fps update rate
let score = 0;
let showingEnd = false;
let tailLength = 5;
let xv = 0; // velocity
let yv = 1;
let trailCoords = []; // map of current position
var grid = []; // grid squares
let gridEdgePadding = 0;
let gridGap = 2;
let gridSize = 18;
let gridRows = 28;
let gridColumns = 28;
let head = {x: 14, y: 0 };
let apple = {x: 0, y: 0};




window.onload = function () {
    cvs = document.getElementById('snakeCanvas');
    ctx = cvs.getContext('2d');
    score

    document.addEventListener("keydown", keyPush);
    initialiseGrid();
    generateApple();

    setInterval(function () {
        moveEverything();
        drawEverything();
    }, 1000 / fps);
}

function moveEverything() {
    // move snake
    head.x += xv;
    head.y += yv;
    console.log("Head at: " +head);
    if(head.y < 0) { // off top
        head.y = gridRows-1;
    }
    if(head.y >= gridRows) { // off bottom
        head.y = 0;
    }
    if(head.x < 0) { // off left
        head.x = gridColumns-1;
    }
    if(head.x >= gridColumns) { // off right
        head.x = 0;
    }

    trailCoords.push({x: head.x, y: head.y});
    while(trailCoords.length > tailLength) {
        trailCoords.shift();
    }

    // check collisions


}



function drawEverything() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    // draw snake
    for(i = 0; i < trailCoords.length; i++) {
        ctx.fillStyle = "lime";
        let gC = trailCoords[i]; // grid co-ord
        if(i === trailCoords.length -1){
            ctx.fillStyle = "red";
        }
        ctx.fillRect(grid[gC.x][gC.y].x, grid[gC.x][gC.y].y, gridSize, gridSize);

        // collide self
        if(gC.x === head.x && gC.y === head.y && i !== trailCoords.length -1) {
            tailLength = trailCoords.length - i;
        }

        // collide apple
        if(gC.x === apple.x && gC.y === apple.y) {
            tailLength ++;
            generateApple();
        }

    }

    ctx.fillStyle = "red";
    aPos = grid[apple.x][apple.y];
    ctx.fillRect(aPos.x, aPos.y, gridSize, gridSize);
}

function generateApple() {
    apple.x = Math.floor(Math.random()*gridColumns);
    apple.y = Math.floor(Math.random()*gridRows);
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
    if (id === 'a' || id === 'ArrowLeft' && xv < 1) {
        xv = -1;
        yv = 0;
    }
    // up
    if (id === 'w' || id === 'ArrowUp' && yv < 1) {
        xv = 0;
        yv = -1;
    }
    // right
    if (id === 'd' || id === 'ArrowRight' && xv > -1) {
        xv = 1;
        yv = 0;
    }
    // down
    if (id === 's' || id === 'ArrowDown' && yv > -1) {
        xv = 0;
        yv = 1;
    }
}
