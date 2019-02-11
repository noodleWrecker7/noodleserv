// GAME SETTINGS - ONLY AFFECT NEW GAMES
LIVES = 4;
COLS = 14;
// ROWS = 8;
BRICKWIDTH = 31;
BRICKHEIGHT = 10;
GAP = 2;
SIDEPADDING = 5; // EACH SIDE EXTRA PAD
TOPPADDING = 50;

PADDLEBOTTOMOFFSET = 20;
PADDLEWIDTH = 50;
PADDLEHEIGHT = 10;
RADIUS = 5;


var cvs = document.getElementById("gameCanvas");
var ctx = cvs.getContext("2d");

var game;

window.onload = function () {
    //try {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    game = new Game();
    cvs.addEventListener("mousemove", function (evt) {
        game.mouse
    });
    globalDraw();
    //} catch (e) {
    //console.log(e);
    //}
};

function tick() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    game.createBricks();
    game.drawBricks();
    game.paddle.draw();
}

class Paddle {

    constructor() {
        this.x = cvs.width / 2 - PADDLEWIDTH / 2;
        this.y = cvs.height - PADDLEBOTTOMOFFSET - PADDLEHEIGHT;
        this.width = PADDLEWIDTH;
        this.height = PADDLEHEIGHT;
        this.bottomOffset = PADDLEBOTTOMOFFSET;
        this.colour = "white";
    }

    draw() {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {

    constructor() {
        this.x = cvs.width / 2;
        this.y = 450;
        this.radius = RADIUS;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y,)
    }
}

class Game {
    constructor() {
        this.lives = LIVES;
        this.cols = COLS;
        this.rows = 8;
        this.brickWidth = BRICKWIDTH;
        this.brickHeight = BRICKHEIGHT;
        this.gap = GAP;
        this.sidePad = SIDEPADDING;
        this.topPad = TOPPADDING;
        this.paddle = new Paddle();


        this.bricksArray = this.createBricks();
    }

    drawBricks() {
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                let b = this.bricksArray[c][r];
                ctx.fillStyle = b.colour;
                ctx.fillRect(b.x, b.y, this.brickWidth, this.brickHeight);
            }
        }
    }

    createBricks() {
        let arr = [];
        for (let c = 0; c < this.cols; c++) {
            arr[c] = [];
            for (let r = 0; r < this.rows; r++) {
                let color;
                switch (r) {
                    case 0:
                    case 1:
                        color = "red";
                        break;
                    case 2:
                    case 3:
                        color = "orange";
                        break;
                    case 4:
                    case 5:
                        color = "lime";
                        break;
                    case 6:
                    case 7:
                        color = "yellow";
                        break;
                }

                arr[c][r] = {
                    x: this.sidePad + this.gap + (this.brickWidth + this.gap) * c,
                    y: this.topPad + this.gap + (this.brickHeight + this.gap) * r,
                    colour: color
                }
            }
        }
        return arr;
    }
}

// RENDERING DO NOT F***ING TOUCH IT

var fps = 45;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;
var calc;

function globalDraw() {
    //await sleep(2);
    requestAnimationFrame(globalDraw);

    now = Date.now();
    delta = now - then;
    //if (delta > interval) {
    // update time stuffs

    // Just `then = now` is not enough.
    // Lets say we set fps at 10 which means
    // each frame must take 100ms
    // Now frame executes in 16ms (60fps) so
    // the loop iterates 7 times (16*7 = 112ms) until
    // delta > interval === true
    // Eventually this lowers down the FPS as
    // 112*10 = 1120ms (NOT 1000ms).
    // So we have to get rid of that extra 12ms
    // by subtracting delta (112) % interval (100).
    // Hope that makes sense.

    then = now - (delta % interval);

    // ... Code for Drawing the Frame ...
    calc = delta / 1000;
    tick();
    //}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}