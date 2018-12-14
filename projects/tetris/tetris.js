const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");
const tileGap = 2;
const tileWidth = 40;
const columns = 10;
const rows = 20;


window.onload = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    const grid = new Grid(columns, rows, tileWidth, tileGap);

    document.addEventListener("keydown", keyPush);

    setInterval(function () {

    }, 1000 / fps);
};

class Grid {



    constructor(columns, rows, tileWidth, tileGap) {
        this.columns = columns;
        this.rows = rows;
        this.tileWidth = tileWidth;
        this.tileGap = tileGap;
        this.gridArray = [];
    }

    generate() {
        for (let c = 0; i < columns; i++) {
            this.gridArray[c] = [];
            for (let r = 0; i < rows; i++) {
                gridArray[c][r] = {}
            }
        }
    }
}

class Shape {

    constructor(count){ // count of blocks
        this.count = count;
    }


}

function keyPush(e) {
    id = e.key;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
    }
}