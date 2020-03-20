/*******************************************************************************
 * Copyright (c) 2019.
 * Developed by Adam Hodgkinson
 * Last modified 19/08/2019, 15:33
 ******************************************************************************/

cvs = document.getElementById("gameCanvas");
ctx = cvs.getContext("2d");
var cWidth = cvs.width;
var cHeight = cvs.height;
var playing = false, crashed = false, aiActivate = false;
;
var waiting = true;
var ground, background, player;
var arrayOfPipes = [];
var offScreenCanvas = document.createElement("canvas");
offScreenCanvas.width = cvs.width;
offScreenCanvas.height = cvs.height;
var offScreenContext = offScreenCanvas.getContext('2d');
let score = 0;
let highScore = getCookie("highScore");
if (highScore < 1) {
    highScore = 0;
    setCookie("highScore", 0, 365);
}
setCookie("highScore", highScore, 365);

var restartBuffer = 0;
var restartTimer = 20;

var restartButton = {x: Math.floor((cWidth / 2) - (214 / 2)), y: 350, width: 214, height: 75, img: new Image()};
restartButton.img.src = "img/restart.png";

var scoreBox = {x: Math.floor((cWidth / 2) - (108 / 2)), y: 150, width: 108, height: 143, img: new Image()};
scoreBox.img.src = "img/score.png";


window.onload = function () {
    ground = new Ground();
    background = new Image();
    background.src = "img/background.png";
    background.onload = function () {
        document.getElementById("backgroundC").getContext("2d").drawImage(background, 0, 0);
    };
    player = new Player();
    ctx.font = "400 33px 'Flappy Bird'";

    document.addEventListener("mousedown", function (e) {
        mouseAction(e);
    });

    document.addEventListener("keydown", function (e) {
        handleKey(e);
    });

    document.addEventListener("touch", function (e) {
        e.preventDefault();
        document.getElementById("temp").innerText = "testing";
    });
    globalDraw();
};

function superSecretMode() {
    if (aiActivate) {
        aiActivate = false;
    } else {
        aiActivate = true;
    }

}

function tick() {

    if (aiActivate && playing) {
        ai(0);
    }


    if (playing) {
        for (let i = 0; i < 2; i++) {
            arrayOfPipes[i].move();
        }
    }


    if (playing || waiting && !crashed) {
        ground.move();
    }

    player.update();
    if (playing) {
        if (aiActivate) {
            ai();
        }
        checkPlayerCollidePipe();
        checkPlayerCollideEdge();
        checkPlayerScorePoint();
    }

    if (crashed) {
        restartBuffer++;
    }


    render();

}

function ai() {
    let p;
    if (arrayOfPipes[0].x + arrayOfPipes[0].width < player.x) {
        p = 1;
    } else {
        p = 0;
    }
    if (player.y + player.height >= arrayOfPipes[p].y + arrayOfPipes[p].vGap - 20) {
        player.jump();
    }
}

function checkPlayerCollideEdge() {
    if (player.y + player.height > ground.y || player.y < 0) {
        fail();
    }
}

function render() {
    offScreenContext.clearRect(0, 0, 480, 640);
    ctx.clearRect(0, 0, 480, 640);

    for (let i = 0; i < arrayOfPipes.length; i++) {
        arrayOfPipes[i].draw(offScreenContext);
    }

    ground.draw(offScreenContext);
    player.draw(offScreenContext);
    ctx.drawImage(offScreenCanvas, 0, 0);
    if (crashed) {
        drawEndScreen();
    }
    if (playing) {
        drawFBText(score, 225, 50);
    }

}

function drawEndScreen() {
    ctx.drawImage(restartButton.img, restartButton.x, restartButton.y);
    ctx.drawImage(scoreBox.img, scoreBox.x, scoreBox.y);

    drawFBText(score, cWidth / 2 - ctx.measureText(score).width / 2, 219);
    drawFBText(highScore, cWidth / 2 - ctx.measureText(highScore).width / 2, 275);
}

function drawFBText(text, x, y) {

    let textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'black';
    ctx.fillRect(x - 4, y - 30, textWidth + 5, 34);

    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);

}

function checkPlayerScorePoint() {
    if (player.x > arrayOfPipes[0].x + arrayOfPipes[0].width && !arrayOfPipes[0].collected) {
        collectPoint();
    }
}

function collectPoint() {
    arrayOfPipes[0].collected = true;
    score++;
    if (score > highScore && !aiActivate) {
        highScore = score;
        setCookie("highScore", highScore, 365);
    }
}

function checkPlayerCollidePipe() {
    let p;
    if (arrayOfPipes[0].x + arrayOfPipes[0].width < player.x) {
        p = 1;
    } else {
        p = 0;
    }

    if (player.x < arrayOfPipes[p].x + arrayOfPipes[p].width && player.x + player.width > arrayOfPipes[p].x) { // if collides on x axis
        if (player.y < arrayOfPipes[p].y || player.y + player.height > arrayOfPipes[p].y + arrayOfPipes[p].vGap) {
            fail();
        }
    }

}

function fail() {
    waiting = playing = false;
    crashed = true;


}

function handleKey(e) {
    let id = e.code;
    if (id == "Space") {
        if (waiting) {
            startGame();
        } else if (crashed) {
            if (restartBuffer > restartTimer) {
                reset();
            }
        } else if (playing) {
            player.jump();
        }
    }
}

function reset() {
    waiting = true;
    crashed = false;
    playing = false;
    player.y = 300;
    arrayOfPipes = [];
    score = 0;
    restartBuffer = 0;
}

function mouseAction(e) {
    if (waiting) {
        startGame();
    } else if (crashed) {
        let x = e.layerX;
        let y = e.layerY;
        if (x > restartButton.x && x < restartButton.x + restartButton.width && y < restartButton.y + restartButton.height && y > restartButton.y) {
            reset();
        }
    } else if (playing) {
        player.jump();
    }
}

function startGame() {
    playing = true;
    crashed = waiting = false;
    generatePipes();
    player.jump();
}

class Player {

    constructor() {
        this.width = 57;
        this.height = 40;
        this.gravity = 43; // this.gravity = 2.2 * 30;
        this.jumpSpeed = 6 * fps; // this.jumpSpeed = 19 * 30;
        this.maxFall = 21 * fps; // this.maxFall = 21 * 30;
        this.imgCounter = 0;
        this.bobCounter = 1;
        this.bobChange = +1 *fps;
        this.bobSpeed = 0;
        this.bobLength = 12;
        this.x = 200;
        this.y = 300;
        this.yv = 0;
        this.img = [];
        for (let i = 0; i < 3; i++) {
            let m = new Image();
            m.src = "img/bird-" + i + ".png";
            this.img.push(m);
        }
    }

    jump() {
        this.yv = -this.jumpSpeed;
        this.y += this.yv * calc;
    }

    draw(canv) {
        let c = Math.floor(this.imgCounter / 9);
        canv.drawImage(this.img[c], Math.floor(this.x), Math.floor(this.y));
    }

    bob() {
        this.bobCounter += this.bobChange * calc;
        this.bobSpeed += 0.15 * fps * calc;
        if (this.bobCounter <= 0) {
            this.bobChange = +1;
            this.bobSpeed = 0;
        }
        if (this.bobCounter >= this.bobLength) {
            this.bobChange = -1;
            this.bobSpeed = 0;
        }
        this.y += this.bobChange * this.bobSpeed * calc;

    }

    dive() {
        this.yv = this.maxFall;
        this.y += this.yv * calc;
    }

    update() {
        if (playing) {
            this.flap();
            this.yv += this.gravity;

        } else if (waiting) {
            this.bob();
        }
        if (this.yv > this.maxFall) {
            this.yv = this.maxFall;
        }
        /*if(crashed && this.y + this.height < ground.y) {
            this.yv = 0;
        }*/

        if (crashed) {
            if (this.y + this.height < ground.y) {
                this.dive();
            } else {
                this.y = (ground.y - this.height) + 1;
            }
            this.yv = 0;
        }
        this.y += this.yv * calc;

    }

    flap() {
        this.imgCounter++;
        if (this.imgCounter > 26) {
            this.imgCounter = 0;
        }
    }
}

function generatePipes() {
    arrayOfPipes = [];
    for (let i = 0; i < 2; i++) {
        arrayOfPipes[i] = new Pipe((cWidth + 800) + (i * 285));
    }
}

function replacePipe() {

    let l = cvs.width;
//    let p = new Pipe(arrayOfPipes[l].x + 282);
    let p = new Pipe(l);
    arrayOfPipes.push(p);

    arrayOfPipes.shift();

}

class Pipe {
    constructor(x) {
        this.collected = false;
        this.vGap = 155;
        this.y = this.randomY();
        this.x = x;
        this.imgBottom = new Image();
        this.imgTop = new Image();
        this.imgBottom.src = "img/pipe-bottom.png";
        this.imgTop.src = "img/pipe-top.png";
        this.pipeSpeed = 2.5 * fps;
        this.width = 86;
        this.iTopHeight = 496;
    }

    move() {
        this.x -= this.pipeSpeed * calc;
        this.checkOffScreen();
    }

    checkOffScreen() {
        if (this.x + this.imgBottom.width < 0) {
            replacePipe();
        }
    }

    draw(canv) {
        canv.drawImage(this.imgBottom, Math.floor(this.x), Math.floor(this.y + this.vGap));
        canv.drawImage(this.imgTop, Math.floor(this.x), Math.floor(this.y - this.iTopHeight));
    }

    randomY() {
        let min = 58;
        let max = (cHeight - ground.img.height) - this.vGap - 30;

        let y = Math.floor(Math.random() * (max - min)) + min;

        return y;
    }
}

class Ground {

    constructor() {
        this.imgSrc = "img/ground.png";
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.y = 0;
        this.img.onload = function () {
            ground.y = cHeight - this.height
        };
        this.relativeX = 0;
        this.groundSpeed = 2.8 * fps;
        this.iWidth = 23;
        this.iHeight = 80;
    }

    move() {
        this.relativeX -= this.groundSpeed * calc;
        if (-this.relativeX >= this.iWidth) {
            this.relativeX = 0;
        }
    }

    draw(canv) {
        let relX = Math.floor(this.relativeX);
        for (let i = 0; i < cWidth / this.iWidth + 1; i++) {
            canv.drawImage(this.img, i * this.iWidth + relX, this.y, this.iWidth, this.iHeight);
        }
    }
}

var fps = 100;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;
var calc;

function globalDraw() {
    //await sleep(4);
    requestAnimationFrame(globalDraw);

    now = Date.now();
    delta = now - then;
    if (delta > interval) {
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
        console.log("delta " + delta)
        tick();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/projects/flappybird";
}

function getCookie(a) {
    const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}
