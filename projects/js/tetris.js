const cvs = document.getElementById("tetrisCanvas");
const ctx = cvs.getContext("2d");

window.onload = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    document.addEventListener("keydown", keyPush);

    setInterval(function () {

    }, 1000 / fps);

};

function keyPush(e) {
    id = e.key;

    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].indexOf(id) > -1) { // if id is in list
        e.preventDefault(); // stop scroll
    }
}