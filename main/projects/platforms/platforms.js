let cvs = document.getElementById("gameCanvas");
let ctx = cvs.getContext("2d");
let game;
let fps = 30;

window.onload = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    document.addEventListener("keydown", function (evt) {
        keyDown(evt);
    }, false);

    document.addEventListener("keyup", function (evt) {
        keyUp(evt);
    }, false);
    game = new RunnerGame(50);
    setInterval(function () {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        game.platformsDraw();
        game.movePlayer();
        game.drawPlayer();
    }, 1000 / fps);
};


class RunnerGame {
    constructor(numOfPlats) {
        this.numberOfPlatforms = numOfPlats;
        this.arrayOfPlatforms = [];
        this.initialiseFirstTime();
        this.player = {x: 50, y: 100, width: 10, height: 20, xv: 0, yv: 0};
        this.onGround = false;
        this.left = this.right = this.down = false;
        this.horizontalSpeed = 2;
        this.xFriction = 0.8;
        this.gravity = 0.5;
        this.jumpSpeed = 10;

    }

    setPlayerOnGround() {
        this.onGround = false;
        for (let i = 0; i < this.arrayOfPlatforms.length; i++) {
            if (this.player.y + this.player.height > this.arrayOfPlatforms[i].y && this.player.y + this.player.height < this.arrayOfPlatforms[i].y + this.arrayOfPlatforms[i].height && this.player.x < this.arrayOfPlatforms[i].x + this.arrayOfPlatforms[i].width && this.player.x + this.player.width > this.arrayOfPlatforms[i].x) {
                this.onGround = true;
            }
        }

    }

    movePlayer() {
        this.setPlayerOnGround();
        if (this.onGround) {
            if (this.player.yv > 0) {
                this.player.yv = 0;
            }
            this.player.xv *= this.xFriction;
        } else {
            this.player.yv += this.gravity;
        }
        if (this.left || this.right) this.moveX();
        if (this.down && this.player.yv < 2) {
            this.player.yv = 2;
        }
        this.player.y += this.player.yv;
        this.player.x += this.player.xv;

        this.checkCollideCanvas();

    }

    checkCollideCanvas() {

    }

    drawPlayer() {
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    }

    initialiseFirstTime() {
        for (let i = 0; i < this.numberOfPlatforms; i++) {

            let x = Math.floor(Math.random() * cvs.width);
            let y = Math.floor(Math.random() * cvs.height);
            let width = Math.floor(Math.random() * 100 + 30);
            let height = Math.floor(Math.random() * 30 + 20);
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, width, height);
            this.arrayOfPlatforms.push({x: x, y: y, width: width, height: height});
        }
    }

    platformsDraw() {
        for (let i = 0; i < this.arrayOfPlatforms.length; i++) {
            let plat = this.arrayOfPlatforms[i];
            ctx.fillStyle = 'white';
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        }
    }

    moveX() {
        let total = 0; // so left + right cancel out
        if (this.left) {
            total -= this.horizontalSpeed;
        }
        if (this.right) {
            total += this.horizontalSpeed;
        }
        this.player.xv = total;
    }

    jump() {
        this.player.yv = -this.jumpSpeed;
    }

}

function keyDown(e) {
    let id = e.code;
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Space', 'KeyA', 'KeyS', 'KeyW', 'KeyD'].indexOf(id) > -1) {
        e.preventDefault();
    }
    switch (id) {
        case "ArrowLeft":
        case "KeyA":
            game.left = true;
            break;
        case "ArrowRight":
        case "KeyD":
            game.right = true;
            break;
        case "ArrowUp":
        case "KeyW":
            if (game.onGround) {
                game.jump();
            }
            break;
        case "KeyS":
        case "ArrowDown":
            game.down = true;
            break;
    }
}

function keyUp(e) {
    let id = e.code;
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Space', 'KeyA', 'KeyS', 'KeyW', 'KeyD'].indexOf(id) > -1) {
        e.preventDefault();
    }
    switch (id) {
        case "ArrowLeft":
        case "KeyA":
            game.left = false;
            break;
        case "ArrowRight":
        case "KeyD":
            game.right = false;
            break;

        case "KeyW":
        case "ArrowUp":
            if (game.player.yv < 0) {
                game.player.yv = 0;
            }
            break;
        case "KeyS":
        case "ArrowDown":
            game.down = false;
            break;
    }
}