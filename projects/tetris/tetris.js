const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");
const tileGap = 1;
const tileWidth = 40;
const columns = 10;
const rows = 20;
const fps = 10;
let grid;
let currentShape;
let ticksUntilDrop = 20;
let ticksSinceLastDrop = 0;
let tickDropIncrease = 1;
let spaceDown = false;
let lockWait = 0;
let lockWaitIncrease = 1;
let lockWaitWarning = 25;
let lockWaitMax = 35; // ticks waited before lock
let whiteTicks = 0; // for cycling the shape being white when at bottom
// const shapesArray = []; defined after specific shape definitions just above keyPush method at bottom
let linesCleared = 0;
let linesInOneGo; // for combos
let distance; // for hard drop points
let score = 0;
let htmlScore = document.getElementById('totalScore');
// TODO move shapes left & right


window.onload = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    grid = new Grid(columns, rows, tileWidth, tileGap);
    grid.generate();
    grid.draw();

    currentShape = getNewShape();
    currentShape.calculateGhostPiece();
    // currentShape = new Cyan();

    document.addEventListener("keydown", keyPush);
    document.addEventListener("keyup", keyUp);

    setInterval(function () {
        progressBoard();
        if (currentShape.root.gridY < 0) {
            tickDropIncrease = 15;
            currentShape.calculateGhostPiece();
        }
        if (spaceDown) {
            tickDropIncrease = 25;
        } else {
            tickDropIncrease = 2;
        }

        if (ticksSinceLastDrop > ticksUntilDrop && !checkCollisionBelow(currentShape)) {
            currentShape.drop();
            ticksSinceLastDrop = 0;
        }
        if (checkCollisionBelow(currentShape)) {
            lockWait += lockWaitIncrease;
            if (lockWait >= lockWaitMax + 2) {
                lockInPlace(currentShape);
                currentShape = getNewShape();
                currentShape.calculateGhostPiece();
            }
        } else {
            lockWait = 0;
        }
        checkFailAbove();
        ticksSinceLastDrop += tickDropIncrease;
        grid.draw();
        drawGhostOnGrid(currentShape);
        drawShapeOnGrid(currentShape);
        htmlScore.innerText = score;
    }, 1000 / fps);
};


function getNewShape() {
    let s;
    // let n = Math.floor(Math.random() * 7);
    let n = Math.floor(Math.random() * Math.floor(7));
    switch (n) {
        case 0:
            s = new Cyan();
            break;
        case 1:
            s = new Blue();
            break;
        case 2:
            s = new Orange();
            break;
        case 3:
            s = new Yellow();
            break;
        case 4:
            s = new Green();
            break;
        case 5:
            s = new Purple();
            break;
        case 6:
            s = new Red();
            break;
        case 7:
            s = getNewShape();
            break;
    }
    return s;
}

function fail() {
    // dunno yet probably call an end screen
    // TODO make end screen
    console.log("fail");
}

function checkFailAbove() {
    for (let i = 0; i < columns; i++) {
        if (grid.gridArray[i][-1].colour != "black") {
            fail();
        }
    }
}

function progressBoard() {
    linesInOneGo = 0;
    for (let i = 0; i < rows; i++) {
        checkLine(i);
    }
    switch(linesInOneGo) {
        case 1:
            score += Math.floor(100 * tickDropIncrease);
            break;
        case 2:
            score += Math.floor(300 * tickDropIncrease);
            break;
        case 3:
            score += Math.floor(500 * tickDropIncrease);
            break;
        case 4:
            score += Math.floor(800 * tickDropIncrease);
            break;
    }


    document.getElementById('linesCleared').innerText = linesCleared;
    // findSegments();

}

function checkLine(line) {

    let fullSoFar = true;

    for (let i = 0; i < columns; i++) {
        if (grid.gridArray[i][line].colour == "black") {
            fullSoFar = false;
        }
    }

    if (fullSoFar) {
        for (let i = 0; i < columns; i++) {
            grid.gridArray[i][line].colour = "black";
            grid.gridArray[i].splice(line, 1);
            grid.gridArray[i].unshift({realX: null, realY: null, colour: 'black'});
        }
        ticksUntilDrop -= 0.3; // increasing game speed
        lockWaitIncrease += 0.075; //
        linesCleared ++;
        linesInOneGo ++;
    }
    grid.reGen();
}

function drawShapeOnGrid(shape) {
    shape.setTrueArray();
    whiteTicks++;
    for (let i = 0; i < 4; i++) {
        let gX = shape.trueArray[i].gridX;
        let gY = shape.trueArray[i].gridY;
        let gA = grid.gridArray[gX][gY];
        if (gA != null) {

            ctx.fillStyle = shape.colour;
            if (lockWait >= lockWaitWarning || (whiteTicks % 4 == 1 && lockWait > 0)) {
                ctx.fillStyle = "white";
            }
            if (lockWait >= lockWaitMax) {
                ctx.fillStyle = shape.colour;
            }
            if (shape.relArray[i].relX == 0 && shape.relArray[i].relY == 0) {
                ctx.fillStyle = "orange";
            }

            ctx.fillRect(gA.realX, gA.realY, tileWidth, tileWidth);
        }
    }
}
function drawGhostOnGrid(shape) {
    ctx.fillStyle = 'grey';
    for (let i = 0; i < 4; i++) {
        console.log(shape.ghostTrueArray);
        let gX = shape.ghostTrueArray[i].gridX;
        let gY = shape.ghostTrueArray[i].gridY;
        let gA = grid.gridArray[gX][gY];
        if (gA != null) {
            ctx.fillRect(gA.realX, gA.realY, tileWidth, tileWidth);
        }
    }
}


function checkCollisionBelow(shape) {
    let collide = false;

    for (let i = 0; i < 4; i++) {
        let coord = shape.trueArray[i]
        let y = coord.gridY;
        let x = coord.gridX;
        if (y >= (rows - 1) || grid.gridArray[x][y + 1].colour != "black") {
            collide = true;
        }
    }
    return collide;
}

function lockInPlace(shape) {
    for (let i = 0; i < 4; i++) {
        let coord = shape.trueArray[i];
        grid.gridArray[coord.gridX][coord.gridY].colour = shape.colour;
    }
}


class Grid {

    constructor(columns, rows, tileWidth, tileGap) {
        this.columns = columns;
        this.rows = rows;
        this.tWidth = tileWidth;
        this.tGap = tileGap;
        this.gridArray = [];
    }

    generate() {
        for (let c = 0; c < columns; c++) {
            this.gridArray[c] = [];
            for (let r = -3; r < rows; r++) {
                this.gridArray[c][r] = {
                    realX: tileGap + c * (tileGap + tileWidth),
                    realY: tileGap + r * (tileGap + tileWidth),
                    colour: "black"
                };
            }
        }
    }

    reGen() { // to repair coords when shifting y row down after line clear
        for (let c = 0; c < columns; c++) {
            for (let r = -3; r < rows; r++) {
                this.gridArray[c][r].realX = tileGap + c * (tileGap + tileWidth);
                this.gridArray[c][r].realY = tileGap + r * (tileGap + tileWidth);
            }
        }
    }

    draw() {
        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                let gS = this.gridArray[c][r];
                ctx.fillStyle = gS.colour;
                ctx.fillRect(gS.realX, gS.realY, tileWidth, tileWidth);
            }
        }
    }


}

class TetrisShape {

    //blockArray;
    constructor() {
        this.root = {gridX: 4, gridY: -3};
        this.ghostRoot = {gridX: 4, gridY: -3};
        this.ghostTrueArray;
    }

    rotate(dir) { // 1 for cw -1 for ccw, 0 just screws it up
        let okay = true;

        for (let i = 0; i < 4; i++) { // test is within bounds
            let x = this.relArray[i].relX;
            let newX = this.root.gridX + (-dir * this.relArray[i].relY);
            let newY = this.root.gridY + (dir * x);

            if (newX < 0 || newX >= columns || newY >= rows || newY < -3 || grid.gridArray[newX][newY].colour != "black") {
                okay = false;
            }
        }
        if (okay) {
            for (let i = 0; i < 4; i++) { // actually sets new pos
                let x = this.relArray[i].relX;
                this.relArray[i].relX = -dir * this.relArray[i].relY;
                this.relArray[i].relY = dir * x;
            }
        }
        this.setTrueArray(); // updates true position
        this.calculateGhostPiece()
    }

    setTrueArray() {
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let x = this.root.gridX + this.relArray[i].relX;
            let y = this.root.gridY + this.relArray[i].relY;
            arr.push({gridX: x, gridY: y});
        }
        this.trueArray = arr;
        return arr;
    }

    drop() {
        this.root.gridY++;
        this.setTrueArray();
    }

    moveX(dir) { // dir either -1 or 1 for left or right respective

        this.setTrueArray();
        let reverse, outOfBounds = false;
        for (let i = 0; i < 4; i++) {
            let coord = this.trueArray[i];
            if (coord.gridX + dir < 0 || coord.gridX + dir >= columns) {
                outOfBounds = true;
            }
            if (!outOfBounds) {
                let gridSquare = grid.gridArray[coord.gridX + dir][coord.gridY];
                if (gridSquare == null || gridSquare.colour != "black") {
                    reverse = true;
                }
            }

        }
        if (!reverse && !outOfBounds) {
            this.root.gridX += dir;
        }

        this.setTrueArray();
        this.calculateGhostPiece();
    }


    calculateGhostPiece() {
        let collide = false;
        this.ghostRoot.gridX = this.root.gridX;
        this.ghostRoot.gridY = this.root.gridY;

        while (!collide) {
            for (let i = 0; i < 4; i++) {
                let y = this.ghostRoot.gridY + this.relArray[i].relY;
                let x = this.ghostRoot.gridX + this.relArray[i].relX;
                if (y >= (rows - 1) || grid.gridArray[x][y + 1].colour != "black") {
                    collide = true;
                }
            }
            if(!collide){
                this.ghostRoot.gridY ++;
            }
        }
        this.ghostTrueArray = [];
        for (let i = 0; i < 4; i++) {
            let x = this.ghostRoot.gridX + this.relArray[i].relX;
            let y = this.ghostRoot.gridY + this.relArray[i].relY;
            this.ghostTrueArray.push({gridX: x, gridY: y});
        }
    }
}

class Cyan extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: 2, relY: 0}];
        this.setTrueArray();
        this.colour = 'cyan';
    }

}

class Blue extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: 1, relY: 1}];
        this.setTrueArray();
        this.colour = 'blue';
    }
}

class Orange extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: -1, relY: 1}];
        this.setTrueArray();
        this.colour = 'orange';
    }
}

class Yellow extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: 0, relY: 1}, {relX: 1, relY: 0}, {relX: 1, relY: 1}];
        this.setTrueArray();
        this.colour = 'yellow';
    }
}

class Green extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: 1, relY: 0}, {relX: 0, relY: 1}, {relX: -1, relY: 1}];
        this.setTrueArray();
        this.colour = 'lime';
    }
}

class Purple extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: 0, relY: 1}];
        this.setTrueArray();
        this.colour = 'purple';
    }
}

class Red extends TetrisShape {

    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 0, relY: 1}, {relX: 1, relY: 1}];
        this.setTrueArray();
        this.colour = 'red';
    }
}

function keyPush(e) {
    let id = e.key;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
    }
    console.log(id);
    if (id == 'ArrowUp') {
        currentShape.rotate(1);
    }
    if (id == 'ArrowDown') {
        currentShape.rotate(-1);
    }

    if (id == 'ArrowLeft') {
        currentShape.moveX(-1)
    }
    if (id == 'ArrowRight') {
        currentShape.moveX(1)
    }

    if (id == ' ') {
        console.log("spaced")
        // currentShape.drop();
        // ticksUntilDrop = 2;
        // ticksSinceLastDrop++;
        tickDropIncrease = 20;
        spaceDown = true;
    }

}

function keyUp(e) {
    let id = e.key;

    if (id == ' ') {
        console.log("spaceu");
        tickDropIncrease = 1;
        spaceDown = false;
    }

    if (id == 'Control') {
        distance = 0;
        while (!checkCollisionBelow(currentShape)) {
            currentShape.drop();
            distance ++;
        }
        lockInPlace(currentShape);
        currentShape = getNewShape();
        score += distance *2;
    }
}