const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");
const tileGap = 2;
const tileWidth = 40;
const columns = 10;
const rows = 20;
const fps = 25;

window.onload = function () {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    const grid = new Grid(columns, rows, tileWidth, tileGap);
    grid.generate();
    grid.draw();

    //let testShape = [{x:}]

    let test = new Cyan();

    document.addEventListener("keydown", keyPush);

    setInterval(function () {

    }, 1000 / fps);
};

function drawShape(shape) {
    for (let i = 0; i < 4; i++) {

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

    states = []; // so it cant be like 'yo states ain't exist'
    relArray = [];
    //blockArray;
    constructor() {
        this.root = {gridX: 4, gridY: 0};
        this.currentState = 0;
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

        this.gridArray = this.setState(this.currentState);
    }*/

    rotateCw(){
        for (let i = 0; i < 4; i++) {
            let x = this.relArray[i].gridX;
            this.relArray[i].gridX = -this.relArray[i].gridY;
            this.relArray[i].gridY = x;
        }
    }



    setTrueArray(s) {
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let x = this.root.gridX += this.states[s][i].relX;
            let y = this.root.gridY += this.states[s][i].relY;
            arr.push({gridX: x, gridY: y});
        }
        return arr;
    }
}

class Cyan extends TetrisShape {

    colour = 'cyan';
    // Relative arrays, relative to root block

    relArray = [{relX: 0, relY: 0}, {relX: -1, relY: 0}, {relX: +1, relY: 0}, {relX: +2, relY: 0}];

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
    }
}