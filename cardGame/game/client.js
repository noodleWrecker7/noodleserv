var socket = io();
socket.on('message', function(data) {
    console.log(data);
})

socket.on('logged out', function() {
    window.location.href = "../";

})

function logOut() {
    setCookie("currentSessionID", "", 0.2);
    socket.emit('log out', currentSessionID);
}