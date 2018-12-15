const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");
const tileGap = 2;
const tileWidth = 40;
const columns = 10;
const rows = 20;
const fps = 5;
let grid;
let test;

window.onload = function () {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    grid = new Grid(columns, rows, tileWidth, tileGap);
    grid.generate();
    grid.draw();

    //let testShape = [{x:}]

    test = new Cyan();
    drawShape(test);

    document.addEventListener("keydown", keyPush);

    setInterval(function () {
        grid.draw();
        drawShape(test);
    }, 1000 / fps);
};

function drawShape(shape) {
    ctx.fillStyle = shape.colour;
    for (let i = 0; i < 4; i++) {
        let gX = shape.trueArray[i].gridX;
        let gY = shape.trueArray[i].gridY;
        let gA = grid.gridArray[gX][gY];
        console.log(gA);
        ctx.fillRect(gA.realX, gA.realY, tileWidth, tileWidth);
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
            for (let r = 0; r < rows; r++) {
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
        this.root = {gridX: 4, gridY: 4};
    }

    /*rotate(dir) {
        switch (dir) {
            case "ccw":
                this.currentState--;
                break;
            case "cw":
                this.currentState++;
                break;
        }
        if (this.currentState > 3) {
            this.currentState = 0;
        }
        if (this.currentState < 0) {
            this.currentState = 3;
        }

        this.trueArray = this.setState(this.currentState);
    }*/


    rotate(dir) { // 1 for cw -1 for ccw, 0 just screws it up
        for (let i = 0; i < 4; i++) {
            let x = this.relArray[i].relX;
            this.relArray[i].relX = -dir * this.relArray[i].relY;
            this.relArray[i].relY = dir * x;
        }
        this.trueArray = this.setTrueArray();
    }

    setTrueArray() {
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let x = this.root.gridX + this.relArray[i].relX;
            let y = this.root.gridY + this.relArray[i].relY;
            arr.push({gridX: x, gridY: y});
        }
        return arr;
    }

    move(x, y){
        this.root.gridX += x;
        this.root.gridY += y;
    }
}

class Cyan extends TetrisShape {

    // Relative arrays, relative to root block


    constructor() {
        super();
        this.relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: 1, relY: 0}, {relX: 2, relY: 0}];
        this.trueArray = this.setTrueArray();
        this.colour = 'cyan';
    }


    /*states = [[{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: +1, relY: 0}, {relX: +2, relY: 0}], // currentState 0
        [{relX: 0, relY: 0}, {relX: 0, relY: -1}, {relX: 0, relY: +1}, {relX: 0, relY: +2}], // 1
        [{relX: 0, relY: 0}, {relX: +1, relY: 0}, {relX: -1, relY: 0}, {relX: -2, relY: 0}],
        [{relX: 0, relY: 0}, {relX: 0, relY: +1}, {relX: 0, relY: -1}, {relX: 0, relY: -2}]
    ];*/
}

function keyPush(e) {
    let id = e.key;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
        test.rotate(1);
    }

}