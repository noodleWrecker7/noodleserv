const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");
const tileGap = 2;
const tileWidth = 40;
const columns = 10;
const rows = 20;
const fps = 10;
let grid;
let currentShape;
let ticksUntilDrop = 1;
let ticksSinceLastDrop = 0;
// const shapesArray = []; defined after specific shape definitions just above keyPush method at bottom

// TODO move shapes left & right

window.onload = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    grid = new Grid(columns, rows, tileWidth, tileGap);
    grid.generate();
    grid.draw();


    currentShape = new Cyan();

    document.addEventListener("keydown", keyPush);

    setInterval(function () {

        if (ticksSinceLastDrop > ticksUntilDrop) {
            currentShape.drop();
            ticksSinceLastDrop = 0;
        }
        if (checkCollisionBelow(currentShape)) {
            lockInPlace(currentShape);
            checkFailAbove();
            currentShape = getNewShape();
        }
        ticksSinceLastDrop++;
        grid.draw();
        drawShape(currentShape);
    }, 1000 / fps);
};

function getNewShape() {
    let s;
    let n = Math.floor(Math.random() *7);
    switch(n) {
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
        if(grid.gridArray[i][-1].colour != "black"){
            fail();
        }
    }
}

function drawShape(shape) {
    shape.setTrueArray();
    ctx.fillStyle = shape.colour;
    for (let i = 0; i < 4; i++) {
        let gX = shape.trueArray[i].gridX;
        let gY = shape.trueArray[i].gridY;
        let gA = grid.gridArray[gX][gY];
        if (gA != null) {

            if (shape.relArray[i].relX == 0 && shape.relArray[i].relY == 0) {
                ctx.fillStyle = "orange";
            } else {
                ctx.fillStyle = shape.colour;
            }
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
    console.log(shape);
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
    }

    rotate(dir) { // 1 for cw -1 for ccw, 0 just screws it up
        for (let i = 0; i < 4; i++) {
            let x = this.relArray[i].relX;
            this.relArray[i].relX = -dir * this.relArray[i].relY;
            this.relArray[i].relY = dir * x;
        }
        this.setTrueArray();
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

    move(x, y) {
        this.root.gridX += x;
        this.root.gridY += y;
    }

    drop() {
        this.root.gridY++;
        this.setTrueArray();
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

    constructor(){
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: 1, relY: 1}];
        this.setTrueArray();
        this.colour = 'blue';
    }
}

class Orange extends TetrisShape {

    constructor(){
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: -1, relY: 1}];
        this.setTrueArray();
        this.colour = 'orange';
    }
}

class Yellow extends TetrisShape {

    constructor(){
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: 0, relY: 1}, {relX: 1, relY: 0}, {relX: 1, relY: 1}];
        this.setTrueArray();
        this.colour = 'yellow';
    }
}

class Green extends TetrisShape {

    constructor(){
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: 1, relY: 0}, {relX: 0, relY: 1}, {relX: -1, relY: 1}];
        this.setTrueArray();
        this.colour = 'lime';
    }
}

class Purple extends TetrisShape {

    constructor(){
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: 0, relY: 1}];
        this.setTrueArray();
        this.colour = 'purple';
    }
}

class Red extends TetrisShape {

    constructor(){
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 0, relY: 1}, {relX: 1, relY: 1}];
        this.setTrueArray();
        this.colour = 'red';
    }
}

const shapesArray = [new Cyan(), new Blue(), new Orange(), new Yellow(), new Green(), new Purple(), new Red()];

function keyPush(e) {
    let id = e.key;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
        currentShape.rotate(1);
    }

}