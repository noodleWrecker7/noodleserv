var socket = io();
socket.on('message', function (data) {
    console.log(data);
})

socket.on('get username', function (data) {
    currentUsername = data;
    setCookie("currentUsername", currentUsername, 1);
})

socket.on('connect user to game', function (gameId) {
    window.location.href = "/game?gameId=" + gameId;
})

socket.on('receive game list', function (data) {
    for (let i = 0; i < data.length; i++) {

    }
})

let currentSessionID = getCookie("currentSessionID");
let currentUsername;

window.onload = function () {
    if (currentSessionID == "") {
        window.location.href = "../";
    }
    socket.emit('return player', currentSessionID);
    setCookie("currentSessionID", currentSessionID, 1);
    refreshGameList();
}

function refreshGameList() {
    socket.emit('request game list', currentSessionID);
}

function createGame() {
    socket.emit('create game', currentSessionID);
}

function requestJoinGame(gameId) {
    socket.emit('request user join game', {gameId: gameId, sessionID: currentSessionID});
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(a) {
    const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}