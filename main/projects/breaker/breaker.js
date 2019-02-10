// GAME SETTINGS - change these if you want


var cvs = document.getElementById("gameCanvas");
var ctx = cvs.getContext("2d");

var game;

window.onload = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    game = new Game(3,)
};

class Game {
    constructor(lives, cols, rows, colWidth, rowHeight, gap, cWidth, cHeight) {

    }
}