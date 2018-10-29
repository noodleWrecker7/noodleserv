let canvas; //canvas variables
let canvasContext;
var fps = 30; //fps update rate
let score = 0;
let showingEnd = false;
let tailLength = 1;
let xv = xy = 0;
let trailCoords =[];
let grid = [];

window.onload = function () {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    document.addEventListener("keydown", keyPush);
    initialiseGrid();

    setInterval(function () {
        moveEverything();
        drawEverything();
    }, 1000 / fps);
}

function moveEverything() {

}

function drawEverything() {

}

function initialiseGrid() {

}

function keyPush(e) {
    id = e.key || e.which || e.keyCode;
    switch(id){
        case 37:

    }
}