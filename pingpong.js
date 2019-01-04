var canvas; //canvas variables
var canvasContext;
var ballX = document.getElementById('pongCanvas').width / 2; //ball pos
var ballY = document.getElementById('pongCanvas').height / 2; //
var ballXSpeed = -150; //ball speeds
var ballYSpeed = 150; //speed is calculated at pixels per second
var fps = 60; //fps update rate
var ballWidth = 20; //ball size
var ballHeight = 20;//
const PADDLE_HEIGHT = 100;
var paddle1Y = 20;
var paddle2Y = 275;
var paddleWidth = 10;
var paddleOffset = 5;
var SPEED = 185;
var player1Score = 0;
var player2Score = 0;
var bounceAngle = 10;
var lossStreak = 0;
var showingEnd = false;
var direction = 0;


function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    }
}


window.onload = function () {
    canvas = document.getElementById('pongCanvas');
    canvasContext = canvas.getContext('2d');
    paddle1Y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    setInterval(function () {
        moveEverything();
        drawEverything();
    }, 1000 / fps);

    function handleMouse() {
        player2Score = 0;
        player1Score = 0;
        showingEnd = false;
    }

    canvas.addEventListener('mousedown', handleMouse);

    document.addEventListener('keydown',
        function (evt) {
            let id = evt.which || evt.keyCode || evt.key;

            if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
                evt.preventDefault(); // stop scroll
            }

            let totalMove = 0;
            if (id == 87) {
                totalMove ++;
            }
            if (id == 83) {
                totalMove --;
            }
            setDirection(totalMove);

        })
    document.addEventListener('keyup',
        function () {
            setDirection(0);
        })

}

function movePaddle() {
    switch (direction) {
        case 1:
            paddle1Y -= SPEED/fps;
            break;

        case -1:
            paddle1Y += SPEED/fps;
            break;
    }
    if(paddle1Y < 0){
        paddle1Y = 0;
    }
    if(paddle1Y + PADDLE_HEIGHT > canvas.height) {
        paddle1Y = canvas.height - PADDLE_HEIGHT;
    }
}

function setDirection(dir) {
    direction = dir;
}

function drawNet() {
    for (var i = 0; i < canvas.height; i += 40) {
        drawRect(canvas.width / 2 - 1, i, 2, 20, 'white');
    }
}

function drawEverything() {
    drawRect(0, 0, canvas.width, canvas.height, "rgb(0, 41, 29)");
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(player1Score, canvas.width / 4, 100);
    canvasContext.fillText(player2Score, (canvas.width / 4) * 3, 100);


    if (showingEnd) {
        endScreen();
        return;
    }

//draw circle
    drawNet();
    canvasContext.fillStyle = 'white';
    canvasContext.beginPath();
    canvasContext.arc(ballX, ballY, ballWidth / 2, 0, Math.PI * 2, true);
    canvasContext.fill();
    drawRect(paddleOffset, paddle1Y, paddleWidth, PADDLE_HEIGHT, 'green')
    drawRect(canvas.width - paddleOffset - paddleWidth, paddle2Y, paddleWidth, PADDLE_HEIGHT, 'red')

}

function paddle2Ai() {
    var paddle2YCenter = paddle2Y + PADDLE_HEIGHT / 2;
    if (paddle2YCenter < ballY - 20) {
        paddle2Y += SPEED / fps
    }
    if (paddle2YCenter > ballY + 20) {
        paddle2Y -= SPEED / fps
    }
}

function moveEverything() {
    if (showingEnd) {
        endScreen();
        return;
    }
    calculateBallPos();
    if (ballXSpeed > 0) {
        paddle2Ai();
    }
    movePaddle();
}

function endScreen() {
    showingEnd = true;
    drawRect(0, 0, canvas.width, canvas.height, 'black');
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(player1Score, canvas.width / 4, 100);
    canvasContext.fillText(player2Score, (canvas.width / 4) * 3, 100);
    canvasContext.fillText('Game Over', 375, 100);
    canvasContext.fillText('Click to continue...', 365, 400);
    ballXSpeed = 150;
    ballYSpeed = 150;
    lossStreak = 0;
}

function ballReset() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    if (lossStreak >= 3) {
        endScreen()
    }

    ballXSpeed = -ballXSpeed;
    ballYSpeed = Math.round(Math.random() * 200);
    if (ballYSpeed < 100) {
        ballYSpeed = -ballYSpeed;
    } else {
        ballYSpeed -= 100;
    }
}

function calculateBallPos() {
    var paddle2YCenter = paddle2Y + PADDLE_HEIGHT / 2;
    var paddle1YCenter = paddle1Y + PADDLE_HEIGHT / 2;
    if (ballX > canvas.width - 10 - ballWidth / 2) {
        if (ballY > paddle2Y &&
            ballY < paddle2Y + PADDLE_HEIGHT) {
            ballXSpeed = -ballXSpeed;
            ballYSpeed += (ballY - paddle2YCenter) * bounceAngle;
        } else {
            if (ballX > canvas.width - ballWidth / 2) {
                player1Score += 1;
                ballReset();
            }
        }
    }
    if (ballX < 10 + ballWidth / 2) {
        if (ballY > paddle1Y &&
            ballY < paddle1Y + PADDLE_HEIGHT) {
            ballXSpeed = -ballXSpeed + 10;
            ballYSpeed += (ballY - paddle1YCenter) * bounceAngle;
            lossStreak = 0;
        } else {
            if (ballX < 0 + ballWidth / 2) {
                player2Score += 1;
                lossStreak++;
                ballReset();
            }
        }
    }
    if (ballY > canvas.height - ballWidth / 2) {
        ballYSpeed = -ballYSpeed;
    }
    if (ballY < 0 + ballWidth / 2) {
        ballYSpeed = -ballYSpeed;
    }
    ballY += ballYSpeed / fps
    ballX += ballXSpeed / fps;
}

function drawRect(leftX, topY, width, height, colour) {
    canvasContext.fillStyle = colour;
    canvasContext.fillRect(leftX, topY, width, height)
}