var socket = io();
socket.on('message', function (data) {
    console.log(data);
})

let currentSessionID = null;
socket.on('newSessionID', function (data) {
    currentSessionID = data;
    setCookie("currentSessionID", currentSessionID, 1);
})

function connect(form) {
    let name = htmlEscape(form.username.value);
    socket.emit('new player', name);
    console.log(name);
    setCookie("currentUsername", name, 1);

    window.location.href = "/static/serverlist.html";
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

function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/#/g, '%23');
}