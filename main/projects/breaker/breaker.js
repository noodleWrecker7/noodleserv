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
PADDLEWIDTH = 60;
PADDLEHEIGHT = 10;
RADIUS = 5;
PADDLESPEED = 200;

BALLYSTARTSPEED = 100;


var cvs = document.getElementById("gameCanvas");
var ctx = cvs.getContext("2d");
var cWidth = cvs.width;
var cHeight = cvs.height;
var game;

window.onload = function () {
    //try {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    game = new Game();
    cvs.addEventListener("mousemove", function (e) {
        let w = game.paddle.width / 2;
        game.paddle.x = e.layerX - w;
    });
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
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
    game.paddle.update();
    game.paddle.draw();
    game.checkBallIsGoingToCollide();
    game.ball.update();
    game.checkBallHasCollided();
    game.checkBallPaddleCollide();
    game.ball.draw();
    ctx.fillStyle = "pink";
    ctx.fillRect(game.ball.x - game.ball.radius, game.ball.y - game.ball.radius, game.ball.radius * 2, game.ball.radius * 2);
}

function keyDown(e) {
    let id = e.key;
    if (id == "ArrowLeft") {
        e.preventDefault();
        game.paddle.left = true;
    }
    if (id == "ArrowRight") {
        e.preventDefault();
        game.paddle.right = true;
    }
}

function keyUp(e) {
    let id = e.key;
    if (id == "ArrowRight") {
        game.paddle.right = false;
    }
    if (id == "ArrowLeft") {
        game.paddle.left = false;
    }
}


class Paddle {

    constructor() {
        this.x = cvs.width / 2 - PADDLEWIDTH / 2;
        this.y = cvs.height - PADDLEBOTTOMOFFSET - PADDLEHEIGHT;
        this.xv = 0;
        this.width = PADDLEWIDTH;
        this.height = PADDLEHEIGHT;
        this.bottomOffset = PADDLEBOTTOMOFFSET;
        this.colour = "white";
        this.paddleSpeed = PADDLESPEED;
        this.left = this.right = false;
    }

    draw() {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.move();
        this.x += Math.floor(this.xv * calc);
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > cWidth) this.x = cWidth - this.width;
    }

    move() {
        this.xv = 0;
        if (this.left) {
            this.xv += -this.paddleSpeed;
        }
        if (this.right) {
            this.xv += this.paddleSpeed;
        }
    }
}

class Ball {

    constructor() {
        this.x = cvs.width / 2;
        this.y = 450;
        this.xv = 0;
        this.yv = BALLYSTARTSPEED;
        this.radius = RADIUS;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    update() {
        this.x += Math.floor(this.xv * calc);
        this.y += Math.floor(this.yv * calc);
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
        this.ball = new Ball();

        this.bricksArray = this.createBricks();
    }

    checkBallIsGoingToCollide() {
        let newX = this.ball.x + this.ball.xv * calc;
        let newY = this.ball.y + this.ball.yv * calc;
        let w = this.brickWidth;
        let h = this.brickHeight;
        let bR = this.ball.radius;

        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows; r++) {
                let b = this.bricksArray[c][r];
                if (newX + bR > b.x && newX - bR < b.x + w && this.ball.y + bR > b.y && this.ball.y - bR < b.y + h) {
                    this.ball.xv = -this.ball.xv;
                }
                if (newY + bR > b.y && newY - bR < b.y + h && this.ball.x + bR > b.x && this.ball.x - bR < b.x + w) {
                    this.ball.yv = -this.ball.yv;
                }
                if (newX + bR > b.x && newX - bR < b.x + w && newY + bR > b.y && newY - bR < b.y + h) {
                    this.ball.yv = -this.ball.yv;
                    this.ball.xv = -this.ball.xv;
                }
            }
        }

    }

    checkBallHasCollided() {

    }

    checkBallPaddleCollide() {
        let p = this.paddle;
        if (this.ball.y + this.ball.radius > p.y && this.ball.y - this.ball.radius < p.y + p.height && this.ball.x + this.ball.radius > p.x && this.ball.x - this.ball.radius < p.x + p.width) {
            this.ball.yv = -this.ball.yv
        }
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