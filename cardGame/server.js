// Config
const MAX_PLAYERS = 9;
const ID_LENGTH = 12;

// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/game', express.static(__dirname + '/game'));

// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, '/index.html'));
});

// Starts server
server.listen(5000, function () {
    console.log(__dirname);
    console.log('Starting server on port 5000');
});

// Add the WebScoket handlers
// var connectedSessionIDs = [];
var connectedSessions = {};

var gamesInProgress = {};

io.on('connection', function (socket) { // when a connection is recieved
    socket.on('new player', newPlayer);  // if they claim to be a new player

    socket.on('return player', returningPlayer); // if they claim to be returning player

    socket.on('create game', createGame);

    socket.on('request user join game', userJoinGame)

    socket.on('request game list', sendGameList);

    socket.on('log out', logOutUser);
});

function removePlayerFromGame(gameId, session) {

    for (let j = 0; j < gamesInProgress[gameId].players.length; j++) {
        if (gamesInProgress[gameId].players[j].sessionID == session) {
            delete gamesInProgress[gameId].players[j];
            if (gamesInProgress[gameId].players.length < 1) {
                delete gamesInProgress[gameId];
                console.log("Game '" + gameId + "' deleted");
            }
        }
    }
    console.log("game '" + gameId + "' removed by '" + session + "'");
    console.log(Object.keys(gamesInProgress).length + " games remaining")
}

function logOutUser(session) {
    delete connectedSessions[session];
    let gameIds = Object.keys(gamesInProgress);
    for (let i = 0; i < gameIds.length; i++) { // for each game in progress
        if (gamesInProgress[gameIds[i]].creatorSessionID == session) {
            delete gamesInProgress[gameIds[i]];
            console.log("Creator in game '"+gameIds[i]+"' left. Deleting.");
            continue;
        }
        for (let j = 0; j < gamesInProgress[gameIds[i]].players.length; j++) { // for each player in that game
            if (gamesInProgress[gameIds[i]].players[j].sessionID == session) { // if that player is the one logging out
                removePlayerFromGame(gamesInProgress[gameIds[i]].gameId, session); // remove them from the game
            }
        }
    }

    io.sockets.connected[this.id].emit('logged out');
    console.log("logged out session: " + session)
}

function sendGameList(sessionID) {
    let gameIds = Object.keys(gamesInProgress);
    let returnObject = [];
    for (let i = 0; i < gameIds.length; i++) {
        let game = gamesInProgress[gameIds[i]];
        let tempGame = {};
        tempGame.id = game.gameId;
        tempGame.creatorName = connectedSessions[game.creatorSessionID].username;
        tempGame.numberPlayers = game.players.length;
        tempGame.gameName = game.gameName;
        returnObject.push(tempGame);
    }

    if (connectedSessions[sessionID] == null) {
        return;
    }
    io.sockets.connected[connectedSessions[sessionID].socketID].emit('receive game list', returnObject);
}

function userJoinGame(data) {
    let gameId = data.gameId;
    let userSession = data.sessionID;

    let game = gamesInProgress[gameId];
    if (game == null) {
        return;
    }
    if (game.players.length >= 9) {
        return;
    }
    if (game.status != 0) {
        return;
    }

    io.sockets.connected[connectedSessions[userSession].socketID].emit('connect user to game', gameId);
    for (let i = 0; i < game.players.length; i++) { // prevents user from joining more than once and filling up lobby

        if (gamesInProgress[gameId].players[i].sessionID == userSession) {
            return;
        }
    }

    gamesInProgress[gameId].players.push({
        sessionID: userSession,
        username: connectedSessions[userSession].username,
        points: 0
    });


}

function createGame(data) {
    let creator = data.creator;
    let gameName = data.gameName;
    let gameIds = Object.keys(gamesInProgress);
    let gId = null;
    while (gId == null || gameIds.indexOf(gId) != -1) {
        gId = Math.floor(Math.random() * 1000);
    }
    console.log("game '" + gameName + "' created by session '" + creator + "'");
    console.log("Current session: " + connectedSessions[creator]);
    let game = {
        gameName: gameName,
        creatorSessionID: creator,
        gameId: gId,
        players: [{sessionID: creator, username: connectedSessions[creator].username, points: 0}],
        czar: 0,
        status: 0
    };
    gamesInProgress[gId] = game;
    io.sockets.connected[connectedSessions[creator].socketID].emit('connect user to game', gId);
}

function returningPlayer(data) {
    let returnSessionID = data; // gets the session id given by client
    if (connectedSessions[returnSessionID] == null) {
        io.sockets.connected[this.id].emit('session not found');
        return;
    }
    connectedSessions[returnSessionID].socketID = this.id; // updates the sessions socket id
    console.log(this.id + " connected as " + connectedSessions[returnSessionID].username + " with sessionID: " + returnSessionID); // logs to console
    io.sockets.connected[this.id].emit('get username', connectedSessions[returnSessionID].username);
}

function newPlayer(data) {
    console.log(this.id + " connected as " + data); // logs to server
    let newSessionID = null;
    let sessionIds = Object.keys(connectedSessions);
    while (newSessionID == null || sessionIds.indexOf(newSessionID) != -1) { // to make sure its unique
        newSessionID = makeid(ID_LENGTH); // generates server-session id
    }
    io.sockets.connected[this.id].emit('newSessionID', newSessionID); // sends the client its id
    // connectedSessionIDs.push(newSessionID);
    connectedSessions[newSessionID] = {sessionID: newSessionID, socketID: this.id, username: data}; // saves to list of session ids
}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}