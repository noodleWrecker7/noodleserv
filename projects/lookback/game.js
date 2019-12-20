/*******************************************************************************
 * Copyright (c) 2019.
 * Developed by Adam Hodgkinson
 * Last modified 15/11/2019, 18:06
 ******************************************************************************/

var debug = false;

var offScreenCanvas;
var offScreenContext;

var GAME;
const PLAYER_HEIGHT = 26;
const PLAYER_WIDTH = 26;
// speed is pixel per second
const PLAYER_GRAVITY = 600;
const PLAYER_JUMP_SPEED = 300;
const PLAYER_X_SPEED = 200;
const PLAYER_FRICTION = .9;

class Game {

    constructor() {
        console.log("play");
        this.preload();
        this.create();
        this.startTime = 0;
        this.timeElapsed = 0;
        this.timeLimit = 0;
    }

    preload() {
        this.level = parseInt(new URLSearchParams(window.location.search).get("level"));
        if (!this.level) window.location.search = "level=1";
        this.levelUrl = "map" + this.level;
        this.cvs = document.getElementById("gameCanvas");
        this.ctx = this.cvs.getContext("2d");
    }

    create() {
        this.map = new Map("mapData/" + this.levelUrl + ".json", this.cvs.width, this.cvs.height);
        //this.timeLimit = this.map.data[0].timeLimit;
        this.player = new Player();
        document.addEventListener("keydown", this.handleKeyDown)
        document.addEventListener("keyup", this.handleKeyUp)

    }

    update(d) {
        //let pUT1 = Date.now(); // pUT = Player Update Time
        this.player.update(d)
        //let pUT2 = Date.now();
        //console.log("Player Update took " + (pUT2 - pUT1));

        if (this.attemptInProgress) {
            this.timeElapsed = (Math.floor((Date.now() - this.startTime) / 1000));
            document.getElementById("time-display").innerText = "Time Elapsed: " + this.timeElapsed;

            if (this.timeElapsed > this.timeLimit) {
                this.fail();
            }
            //if (this.startTime)
        }
        this.render();
    }

    fail() {
        this.attemptInProgress = false;
        this.attemptFailed = true;
        document.getElementById("message-box").style.display = "block";
        document.getElementById("message").innerHTML = "You Failed this attempt!<br>Press any key to re-try.<br>Note: The timer and ghost don't begin until you do";
    }

    success() {
        document.getElementById("message-box").style.display = "block";
        document.getElementById("message").innerHTML = "Congrats, you completed this level!<br>Press any key to progress to the next level";
        this.attemptSucceeded = true;
        console.log("succeed")
    }

    reset() {
        document.getElementById("message-box").style.display = "none";
        this.player.resetAttempt();
        this.timeElapsed = 0;
        this.attemptInProgress = false;
        this.attemptFailed = false;
        this.startTime = 0;
    }

    render() { // draws offScreen to main screen
        //if (this.attemptInProgress) return;
        offScreenContext.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height)
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)

        //offScreenContext.drawImage(this.map.cvs, 0, 0);
        this.player.draw();
        if (!this.attemptInProgress) {

        }

        this.ctx.drawImage(offScreenCanvas, 0, 0);
    }


    // key handling
    handleKeyDown(e) {
        if (GAME.startTime == 0) {
            GAME.start();
        }


        let id = e.code;
        switch (id) {
            case "ArrowUp":
            case "KeyW":
                GAME.player.upPressed = true;
                break;
            case "ArrowDown":
            case "KeyS":
                GAME.player.downPressed = true;
                break;
            case "ArrowLeft":
            case "KeyA":
                GAME.player.leftPressed = true;
                break;
            case "ArrowRight":
            case "KeyD":
                GAME.player.rightPressed = true;
                break;
        }
    }

    handleKeyUp(e) {
        if (GAME.attemptSucceeded) window.location.search = "level=" + (GAME.level + 1)
        if (GAME.attemptFailed) {
            GAME.reset();
            return;
        }
        let id = e.code;
        switch (id) {
            case "KeyR":
                GAME.fail();
                break;
            case "ArrowUp":
            case "KeyW":
                GAME.player.upPressed = false;
                break;
            case "ArrowDown":
            case "KeyS":
                GAME.player.downPressed = false;
                break;
            case "ArrowLeft":
            case "KeyA":
                GAME.player.leftPressed = false;
                break;
            case "ArrowRight":
            case "KeyD":
                GAME.player.rightPressed = false;
                break;
        }
    }

    start() {
        this.attemptInProgress = true;
        console.log("started")
        this.startTime = Date.now();
        document.getElementById("message-box").style.display = "none";
        this.player.currentPath = {keys: []};
    }
}

class Map {
    constructor(url, w, h) {
        this.data = [];
        this.winbox = {};
        let prom = this.loadMap(url)
        prom.then(value => {
            this.data = value;
            this.drawMap(this.data);
        })
        prom.catch(value => {
            console.log(value)
        })
        this.cvs = document.createElement("canvas");
        this.cvs.width = w;
        this.cvs.height = h;
        this.ctx = this.cvs.getContext("2d");

    }

    drawMap(map) {
        console.log(map)
        for (let i = 0; i < map.length; i++) {
            let item = map[i]
            console.log(item)
            if (item.config) {
                GAME.timeLimit = item.timeLimit;
                document.getElementById("time-limit-display").innerText = "Time limit: " + item.timeLimit
                GAME.player.startX = item.startX;
                GAME.player.startY = item.startY;
                continue;
            }
            if (!item.winbox) {
                this.ctx.fillStyle = item.colour;
            } else {
                this.ctx.fillStyle = "green"
                this.ctx.globalAlpha = 0.3;
                this.winbox = item;
            }
            this.ctx.fillRect(item.x, item.y, item.width, item.height)
            this.ctx.globalAlpha = 1;
        }
        document.getElementById("backgroundCanvas").getContext("2d").drawImage(this.cvs, 0, 0);
    }

    async loadMap(url) {
        return new Promise(((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open("GET", url);
            req.onload = () => resolve(JSON.parse(req.responseText));
            req.onerror = () => reject(req.statusText);
            req.send();
        }))
    }
}


class Player {
    constructor() {
        this.height = PLAYER_HEIGHT;
        this.width = PLAYER_WIDTH;
        this.x = 100;
        this.xv = 0;
        this.xSpeed = PLAYER_X_SPEED;
        this.friction = PLAYER_FRICTION;
        this.yv = 0;
        this.jumpSpeed = PLAYER_JUMP_SPEED;
        this.gravity = PLAYER_GRAVITY;
        this.y = 400;
        this.currentPath = {keys: []};
        this.pastPath = {};

        this.startX = 100;
        this.startY = 100;

        this.upPressed = false;
        this.leftPressed = false;
        this.rightPressed = false;
        this.downPressed = false;

        this.onGround = true;
        this.jumpAvailable = true;
        this.collisionJumpAvailable = true;
    }

    resetAttempt() {
        this.x = this.startX;
        this.y = this.startY;
        this.pastPath = this.currentPath;
        this.currentPath = {keys: []}
        this.xv = 0;
        this.yv = 0;
    }

    draw() { // draws from last positon
        if (debug) {
            offScreenContext.fillStyle = "green";
            offScreenContext.fillRect(Math.floor(this.x - this.width / 2), Math.floor(this.y - this.height / 2), this.width, this.height)
        }
        if (!this.pastPath.keys) return;
        let pos = this.calculatePosition(Date.now() - GAME.startTime)
        offScreenContext.fillStyle = "red";
        offScreenContext.fillRect(Math.floor(pos.x - this.width / 2), Math.floor(pos.y - this.height / 2), this.width, this.height)
    }

    update(d) {
        if (GAME.attemptFailed) return;
        if (this.upPressed) this.up();
        //if (this.downPressed) this.down();
        if (this.leftPressed) this.left();
        if (this.rightPressed) this.right();
        if (!this.onGround) {
            this.yv += this.gravity * d;
        }
        this.x += this.xv * d;
        this.y += this.yv * d;


        this.checkOnGround();


        this.xv *= this.friction * d;
        if (this.xv < 0.01 && this.xv > -0.01) this.xv = 0;

        /*if (!this.onGround) */
        this.checkCollisionWithMap();

        // record current point
        //if(!GAME.attemptInProgress) return;
        let progress = Date.now() - GAME.startTime;
        this.currentPath[progress] = {x: this.x, y: this.y};
        this.currentPath.keys.push(progress);

    }

    checkCollisionWithMap() {
        if (!this.currentPath.keys[0]) return;
        for (let item of GAME.map.data) {
            if (item.config) continue;
            if (item.permeable) continue;
            if (this.x - 1 + this.width / 2 > item.x && this.x - this.width / 2 < item.x + item.width && this.y - 1 + this.height / 2 > item.y && this.y - this.width / 2 < item.y + item.height) {
                if (item.winbox) {
                    this.reachEnd()
                    break;
                }
                if (item.deadly) {
                    GAME.fail()
                    break;
                }
                console.log("Attempting to resolve collision")
                this.resolveCollision(item);
                return;
            } else if (intersects(item.x, item.y, item.x + item.width, item.y + item.height, this.x, this.y, this.currentPath[this.currentPath.keys[this.currentPath.keys.length - 1]].x, this.currentPath[this.currentPath.keys[this.currentPath.keys.length - 1]].y)) { // if the vector collides with the shape
                if (item.deadly) {
                    GAME.fail();
                    break;
                }
                this.resolveCollision(item);
                return;
            }
        }
    }

    resolveCollision(item) {
        if (!this.jumpAvailable && this.collisionJumpAvailable) {
            this.jumpAvailable = true;
            this.collisionJumpAvailable = false;
        }

        let pastCoord = this.currentPath[this.currentPath.keys[this.currentPath.keys.length - 1]];
        let vector = {x: pastCoord.x - this.x, y: pastCoord.y - this.y}; // from current to past
        //console.log(vector)
        let i = 0;
        while (true) { // percentage of vector
            i += 2;
            let multiplier = i / 100;
            let newX = this.x + (vector.x * multiplier);
            let newY = this.y + (vector.y * multiplier);
            if (!this.checkCollideWithItem({x: newX, y: newY, width: this.width, height: this.height}, item)) {
                this.x = newX;
                //this.xv = 0
                this.y = newY;
                this.yv = 0;
                this.onGround = true;
                break;
            }
        }
    }

    checkCollideWithItem(object, item) {
        //console.log(item.x);
        if (object.x - 1 + object.width / 2 > item.x && object.x - this.width / 2 < item.x + item.width && object.y - 1 + object.height / 2 > item.y && object.y - object.height / 2 < item.y + item.height) {
            return true;
        }
        let pastCoord = this.currentPath[this.currentPath.keys[this.currentPath.keys.length - 1]];
        if (intersects(item.x, item.y, item.x + item.width, item.y + item.height, object.x, object.y, pastCoord.x, pastCoord.y)) {
            return true;
        }
        return false;
    }

    reachEnd() {
        GAME.success();
    }

    checkOnGround() {
        this.onGround = false;
        for (let item of GAME.map.data) {
            if (item.config) continue;
            if (item.permeable) continue;
            if (Math.floor(this.y) + this.height / 2 == Math.floor(item.y) && this.x - this.width / 2 < item.x + item.width && this.x + this.width / 2 > item.x) {
                this.jumpAvailable = true;
                this.collisionJumpAvailable = true;
                this.onGround = true;
                return true;
            }
        }
    }

    calculatePosition(time) {
        /*var closest = this.pastPath.keys.reduce(function (prev, curr) {
            return (Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev);
        });*/
        let num = closest(time, this.pastPath.keys);

        return {x: this.pastPath[num].x, y: this.pastPath[num].y};
    }


    up() {
        if (this.jumpAvailable) {
            this.yv = -this.jumpSpeed;
            this.jumpAvailable = false;
        }
    }

    left() {
        this.xv = -this.xSpeed;
    }

    right() {
        this.xv = this.xSpeed;
    }

}

window.onload = function () {
    focus();
    GAME = new Game();
    offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = GAME.cvs.width;
    offScreenCanvas.height = GAME.cvs.height;
    offScreenContext = offScreenCanvas.getContext('2d');
    globalDraw();
};

var fps = 100;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;
var calc;
let timeSinceFpsUpdate = 0;

//let pastDelta = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function globalDraw() {
    //await sleep(4);
    requestAnimationFrame(globalDraw);

    now = Date.now();
    delta = now - then;
    if (delta > interval) {
        // let pUT1 = Date.now(); // pUT = Player Update Time

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
        //console.log("delta " + delta)
        //console.log("FPS: " + 1000 / delta)
        //pastDelta.shift();
        //pastDelta.push(delta);
        timeSinceFpsUpdate += delta;
        if (timeSinceFpsUpdate > 2000) {
            document.getElementById("fps-counter").innerText = "FPS: " + Math.floor(1000 / delta)
            timeSinceFpsUpdate = 0;
        }
        GAME.update(calc);
        // let pUT2 = Date.now();
        // console.log("1:  " + pUT1);
        // console.log("2:  " + pUT2);
    }
}

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function intersects(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

function closest(num, arr) {
    var mid;
    var lo = 0;
    var hi = arr.length - 1;
    while (hi - lo > 1) {
        mid = Math.floor((lo + hi) / 2);
        if (arr[mid] < num) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (num - arr[lo] <= arr[hi] - num) {
        return arr[lo];
    }
    return arr[hi];
}
