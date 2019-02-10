cvs = document.getElementById("gameCanvas");
ctx = cvs.getContext("2d");


let t = 0;
function tick() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ground.move();
    ground.draw();
    t ++;
    if(t >= 30) {
        console.log("second");
        t = 0;
    }
}

class Ground {

    constructor() {
        this.imgSrc = "imgBottom/ground.png";
        this.img = new Image();
        this.img.src = this.imgSrc;
        this.relativeX = 0;
        this.groundSpeed = 4;
    }

    move(delta) {
        this.relativeX -= this.groundSpeed * delta;
        if (-this.relativeX >= this.img.width) {
            this.relativeX = 0;
        }
    }

    draw() {
        for (let i = 0; i < cvs.width / this.img.width + 1; i++) {
            ctx.drawImage(this.img, i * this.img.width + this.relativeX, cvs.height - this.img.height, this.img.width, this.img.height);
        }
    }
}
var g = new Ground();
var x = 0;
var requestAnimationFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, element){
            setTimeout(function(){ callback((new Date).getTime()); }, 1000/60);
        };
})();
window.onload = function(){



    var speed = 60; // pixels per second
    var calc = speed/1000;
    var start_time = (new Date).getTime();

    (function draw(time){
        var pos = (time - start_time)*calc;
        //g.move(pos);
        //g.globalDraw();
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,cvs.width, cvs.height);
        x += 0.5 * pos;
        ctx.fillStyle = 'red';
        ctx.fillRect(50, 100, 50, 50);
        console.log(pos);
        requestAnimationFrame(draw);
    })();

}();

