const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");
const tileGap = 2;
const tileWidth = 40;
const columns = 10;
const rows = 20;
const fps = 25;

window.onload = function () {
 /*   ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);*/
    const grid = new Grid(columns, rows, tileWidth, tileGap);
    grid.generate();
    grid.draw();

    //let testShape = [{x:}]

    let s = new Shape();

    document.addEventListener("keydown", keyPush);

    setInterval(function () {

    }, 1000 / fps);
};

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

    draw(){
        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                let gS = this.gridArray[c][r];
                ctx.fillStyle = gS.colour;
                ctx.fillRect(gS.realX, gS.realY, tileWidth, tileWidth);
            }
        }
    }


}

class Shape {

    //blockArray;

    constructor(bArr) { // count of blocks

    }

}

class Cyan extends Shape {

}

function keyPush(e) {
    let id = e.key;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
    }
}