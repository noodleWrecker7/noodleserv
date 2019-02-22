let cvs = document.getElementById("gameCanvas");
let ctx = cvs.getContext("2d");

let difficulty = 0;
let difficulties = [
    {gridSize: 8, mines: 10},
    {gridSize: 16, mines: 40},
    {gridSize: 24, mines: 99}
];
let selectedDifficultySettings = difficulties[difficulty];

let minesFlagged = 0;
let gridSquareSize = 20;
let gridSquareGap = 2;
let gameGrid;
let flagImg = new Image();
flagImg.src = "img/flag.png";
let paused = false;
let startTime = new Date().getTime();
window.onload = function () {
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    gameGrid = new Grid(gridSquareSize, gridSquareGap, selectedDifficultySettings.gridSize, selectedDifficultySettings.mines);
    setDifficulty(difficulty);
    gameGrid.draw();


    cvs.addEventListener("contextmenu", function (evt) {
        evt.preventDefault();
        mouseAction(evt, "rClick");
        return false;
    }, false);
    cvs.addEventListener("click", function (evt) {
        evt.preventDefault();
        mouseAction(evt, "lClick");
        return false;
    }, false);
    startTime = new Date().getTime();
    setInterval(function () {
        if (!paused) {
            let currentTime = new Date().getTime();
            let timeDifference = currentTime - startTime;
            let totalSeconds = Math.floor(timeDifference / 1000);
            let totalMinutes = Math.floor(totalSeconds / 60);
            let remainingSeconds = totalSeconds % 60;

            document.getElementById("timer").innerText = "Time: " + totalMinutes + "m " + remainingSeconds + "s";
        }
    }, 1000);

};

function gameOver() {
    paused = true;
    for (let i = 0; i < gameGrid.arrayOfMineLocations.length; i++) {
        uncoverTile(gameGrid.arrayOfMineLocations[i].gridX, gameGrid.arrayOfMineLocations[i].gridY);
    }
    document.getElementById("winMessage").innerText = "YOU LOSE!!";
}

function flagTile(x, y) {
    if (gameGrid.arrayOfGridSquares[x][y].coverStatus === "flagged") {
        gameGrid.arrayOfGridSquares[x][y].coverStatus = "covered";
        minesFlagged--;
    } else if (gameGrid.arrayOfGridSquares[x][y].coverStatus === "covered") {
        gameGrid.arrayOfGridSquares[x][y].coverStatus = "flagged";
        minesFlagged++;
    } else {
        console.log("ERROR: Tried to flag uncovered tile: " + x, ", " + y);
    }
    if (minesFlagged == selectedDifficultySettings.mines) {
        let win = true;
        for (let i = 0; i < minesFlagged; i++) {
            if (!gameGrid.arrayOfGridSquares[gameGrid.arrayOfMineLocations[i].gridX][gameGrid.arrayOfMineLocations[i].gridY].containsMine) {
                win = false;
                break;
            }
        }
        if (win) {
            document.getElementById("winMessage").innerText = "YOU WIN!!";
        } else {
            document.getElementById("winMessage").innerText = "";
        }
        paused = true;
    }
}

function uncoverTile(x, y) {
    if (gameGrid.arrayOfGridSquares[x][y].coverStatus === "covered") {
        gameGrid.arrayOfGridSquares[x][y].coverStatus = "uncovered";
        gameGrid.draw();
        if (gameGrid.arrayOfGridSquares[x][y].displayNumber === -1) {
            gameOver();
        }
    }
}

function mouseAction(evt, clickType) {
    let mousePos = getMousePos(cvs, evt);
    for (let c = 0; c < gameGrid.gridWidth; c++) {
        for (let r = 0; r < gameGrid.gridWidth; r++) {
            let rX = gameGrid.arrayOfGridSquares[c][r].realX;
            let rY = gameGrid.arrayOfGridSquares[c][r].realY;
            if (rX < mousePos.x && rX + gameGrid.gridSquareSize > mousePos.x && rY < mousePos.y && rY + gameGrid.gridSquareSize > mousePos.y) {
                if (clickType == "rClick") {
                    flagTile(c, r);
                } else if (clickType == "lClick") {
                    uncoverTile(c, r);
                    if (gameGrid.arrayOfGridSquares[c][r].coverStatus == "uncovered" && gameGrid.arrayOfGridSquares[c][r].displayNumber > -1) {
                        gameGrid.flood(c, r);
                    }
                }
            }
        }
    }
    gameGrid.draw();
}

class Grid {

    constructor(size, gap, width, mines) {
        this.gridSquareSize = size;
        this.gridSquareGap = gap;
        this.gridWidth = width;
        this.numOfMines = mines;
        this.arrayOfGridSquares = [];
        this.arrayOfMineLocations = [];

        this.relativeCoordsAroundSquareToCalculateHowManyMinesASquareCanSee = [
            {x: +0, y: +1},
            {x: +1, y: +1},
            {x: +1, y: +0},
            {x: +1, y: -1},
            {x: +0, y: -1},
            {x: -1, y: -1},
            {x: -1, y: +0},
            {x: -1, y: +1}
        ];
        this.shortRelCoords = this.relativeCoordsAroundSquareToCalculateHowManyMinesASquareCanSee;

        this.createGrid();
    }

    createGrid() {
        for (let c = 0; c < this.gridWidth; c++) {
            this.arrayOfGridSquares[c] = [];
            for (let r = 0; r < this.gridWidth; r++) {
                this.arrayOfGridSquares[c][r] = {
                    realX: this.gridSquareGap + c * (this.gridSquareGap + this.gridSquareSize),
                    realY: this.gridSquareGap + r * (this.gridSquareGap + this.gridSquareSize),
                    containsMine: false,
                    displayNumber: 0, // -1 is a mine, 0 is none nearby all the rest work as usual
                    coverStatus: "covered"
                }
            }
        }
        // place mines
        this.arrayOfMineLocations = [];
        for (let i = 0; i < this.numOfMines; i++) {
            let mineIsDupe;
            let x, y;
            do {
                x = Math.floor(Math.random() * this.gridWidth);
                y = Math.floor(Math.random() * this.gridWidth);
                mineIsDupe = false;
                for (let j = 0; j < this.arrayOfMineLocations.length; j++) {
                    if (x === this.arrayOfMineLocations[j].gridX && y === this.arrayOfMineLocations[j].gridY) {
                        mineIsDupe = true;
                    } else {
                    }
                }
            } while (mineIsDupe);
            this.arrayOfMineLocations.push({gridX: x, gridY: y});
            this.arrayOfGridSquares[x][y].containsMine = true; // @TODO remove this
            this.arrayOfGridSquares[x][y].displayNumber = -1;
        }

        // calculate display numbers
        for (let c = 0; c < this.gridWidth; c++) {
            for (let r = 0; r < this.gridWidth; r++) {
                if (this.arrayOfGridSquares[c][r].displayNumber === -1) continue;
                let totalMinesSeen = 0;
                for (let i = 0; i < this.shortRelCoords.length; i++) {
                    if (c + this.shortRelCoords[i].x < 0 || c + this.shortRelCoords[i].x >= this.gridWidth || r + this.shortRelCoords[i].y < 0 || r + this.shortRelCoords[i].y >= this.gridWidth) {
                        continue;
                    }

                    let square = this.arrayOfGridSquares[c + this.shortRelCoords[i].x][r + this.shortRelCoords[i].y];
                    if (square.displayNumber === -1) {
                        totalMinesSeen++;
                    }
                }
                this.arrayOfGridSquares[c][r].displayNumber = totalMinesSeen;
            }
        }
    }

    draw() {
        for (let c = 0; c < this.gridWidth; c++) {
            for (let r = 0; r < this.gridWidth; r++) {
                switch (this.arrayOfGridSquares[c][r].coverStatus) {
                    case "covered":
                        ctx.fillStyle = "lightSlateGrey";
                        ctx.fillRect(this.arrayOfGridSquares[c][r].realX, this.arrayOfGridSquares[c][r].realY, this.gridSquareSize, this.gridSquareSize);
                        break;
                    case "flagged":
                        ctx.fillStyle = "lightSlateGrey";
                        ctx.fillRect(this.arrayOfGridSquares[c][r].realX, this.arrayOfGridSquares[c][r].realY, this.gridSquareSize, this.gridSquareSize);
                        ctx.drawImage(flagImg, this.arrayOfGridSquares[c][r].realX, this.arrayOfGridSquares[c][r].realY, this.gridSquareSize, this.gridSquareSize);
                        break;
                    case "uncovered":
                        if (this.arrayOfGridSquares[c][r].displayNumber === -1) {
                            ctx.fillStyle = "lightGrey";
                            ctx.fillRect(this.arrayOfGridSquares[c][r].realX, this.arrayOfGridSquares[c][r].realY, this.gridSquareSize, this.gridSquareSize);
                            ctx.fillStyle = "black";
                            ctx.beginPath();
                            ctx.arc(this.arrayOfGridSquares[c][r].realX + this.gridSquareSize / 2, this.arrayOfGridSquares[c][r].realY + this.gridSquareSize / 2, this.gridSquareSize / 2, 0, 2 * Math.PI, false);
                            ctx.fill();
                            break;
                        }
                        ctx.fillStyle = "lightGrey";
                        ctx.fillRect(this.arrayOfGridSquares[c][r].realX, this.arrayOfGridSquares[c][r].realY, this.gridSquareSize, this.gridSquareSize);
                        switch (this.arrayOfGridSquares[c][r].displayNumber) {
                            case -1:
                                ctx.fillStyle = "black";
                                break;
                            case 0:
                                ctx.fillStyle = "grey";
                                break;
                            case 1:
                                ctx.fillStyle = "blue";
                                break;
                            case 2:
                                ctx.fillStyle = "green";
                                break;
                            case 3:
                                ctx.fillStyle = "red";
                                break;
                            case 4:
                                ctx.fillStyle = "purple";
                                break;
                            case 5:
                                ctx.fillStyle = "brown";
                                break;
                            case 6:
                                ctx.fillStyle = "turquoise";
                                break;
                            case 7:
                                ctx.fillStyle = "white";
                                break;
                            case 8:
                                ctx.fillStyle = "yellow";
                                break;
                        }
                        if (this.arrayOfGridSquares[c][r].displayNumber > 0) {
                            ctx.font = "20px Montserrat";
                            ctx.fillText(this.arrayOfGridSquares[c][r].displayNumber, this.arrayOfGridSquares[c][r].realX + 5, this.arrayOfGridSquares[c][r].realY + this.gridSquareSize - 2, this.gridSquareSize);
                        }
                        break;
                }
            }
        }
        document.getElementById("minesFlagged").innerText = "Mines Flagged: " + minesFlagged;
    }

    flood(startX, startY) {
        let adjacentTilesToSearch = [];
        let arrayOfEmptyAdjacentTilesSearched = [];


        adjacentTilesToSearch.push({x: startX, y: startY});
        while (adjacentTilesToSearch.length > 0) {
            // search tile 0
            console.log("Length of adjacentTilesToSearch is: " + adjacentTilesToSearch.length);
            let tile = adjacentTilesToSearch[0];
            let beenSearched = false;
            for (let i = 0; i < arrayOfEmptyAdjacentTilesSearched.length; i++) { // checking hasnt already been searched
                if (tile.x === arrayOfEmptyAdjacentTilesSearched[i].x && tile.y === arrayOfEmptyAdjacentTilesSearched[i].y) {
                    adjacentTilesToSearch.shift();
                    beenSearched = true;
                }
            }
            if (beenSearched) {
                continue;
            }
            console.log("searching tile: " + tile.x + ", " + tile.y);
            for (let i = 0; i < this.shortRelCoords.length; i++) { // checking is a valid tile
                if (tile.x + this.shortRelCoords[i].x < 0 || tile.x + this.shortRelCoords[i].x >= this.gridWidth || tile.y + this.shortRelCoords[i].y < 0 || tile.y + this.shortRelCoords[i].y >= this.gridWidth) {
                    continue;
                }

                let squareChecking = this.arrayOfGridSquares[tile.x + this.shortRelCoords[i].x][tile.y + this.shortRelCoords[i].y]; // the sqaure being checked
                if (squareChecking.displayNumber === 0) { // if its a valid tile
                    let beenSearched = false;
                    for (let j = 0; j < arrayOfEmptyAdjacentTilesSearched.length; j++) {
                        if (tile.x === arrayOfEmptyAdjacentTilesSearched[j].x && tile.y === arrayOfEmptyAdjacentTilesSearched[j].y) {
                            beenSearched = true;
                        }
                    }
                    if (!beenSearched) {
                        adjacentTilesToSearch.push({ // add it to the next lot to search
                            x: tile.x + this.shortRelCoords[i].x,
                            y: tile.y + this.shortRelCoords[i].y
                        });
                    }
                }
            }
            arrayOfEmptyAdjacentTilesSearched.push({x: tile.x, y: tile.y});
            adjacentTilesToSearch.shift();
        }
        for (let i = 0; i < arrayOfEmptyAdjacentTilesSearched.length; i++) {
            uncoverTile(arrayOfEmptyAdjacentTilesSearched[i].x, arrayOfEmptyAdjacentTilesSearched[i].y);
        }
        for (let i = 0; i < arrayOfEmptyAdjacentTilesSearched.length; i++) {
            let tile = arrayOfEmptyAdjacentTilesSearched[i];
            if (this.arrayOfGridSquares[tile.x][tile.y].displayNumber > 0) {
                continue;
            }
            for (let j = 0; j < this.shortRelCoords.length; j++) {
                if (tile.x + this.shortRelCoords[j].x < 0 || tile.x + this.shortRelCoords[j].x >= this.gridWidth || tile.y + this.shortRelCoords[j].y < 0 || tile.y + this.shortRelCoords[j].y >= this.gridWidth) {
                    continue;
                }

                if (this.arrayOfGridSquares[tile.x + this.shortRelCoords[j].x][tile.y + this.shortRelCoords[j].y].displayNumber > 0) {
                    uncoverTile(tile.x + this.shortRelCoords[j].x, tile.y + this.shortRelCoords[j].y);
                }
            }
        }
    }
}

function setDifficulty(d) {
    paused = false;
    difficulty = d;
    selectedDifficultySettings = difficulties[difficulty];
    cvs.width = selectedDifficultySettings.gridSize * (gameGrid.gridSquareSize + gameGrid.gridSquareGap) + gameGrid.gridSquareGap;
    cvs.height = selectedDifficultySettings.gridSize * (gameGrid.gridSquareSize + gameGrid.gridSquareGap) + gameGrid.gridSquareGap;
    gameGrid = new Grid(gridSquareSize, gridSquareGap, selectedDifficultySettings.gridSize, selectedDifficultySettings.mines);
    gameGrid.draw();
    console.log("redraw");
    document.getElementById("totalMines").innerText = "Total Mines: " + selectedDifficultySettings.mines;
    startTime = new Date().getTime();
    document.getElementById("timer").innerText = "Time: 0m 0s";
    minesFlagged = 0;
    document.getElementById("winMessage").innerText = "";
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

/*
function drawStroked(text, x, y) {
    ctx.font = '80px Sans-serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}*/
