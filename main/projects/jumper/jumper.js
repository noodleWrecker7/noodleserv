let tick = 0;

class Play extends Phaser.Scene {
    constructor() {
        super({key: "Play", active: true})
    }

    preload() {
        this.load.image("nose", "resource/nose.png");
    }

    create() {
        this.player = this.physics.add.sprite(24, 24, "nose");
        this.player.setCollideWorldBounds(true)
        this.graphics = this.add.graphics();
        //this.player.add.collider()


    }

    update(time, delta) {
        this.graphics.clear();


        //this.graphics.fillStyle(0xffffff, 0.8);
        //this.graphics.fillRect(this.player.x - 24, this.player.y -24, this.player.width, this.player.height)
    }
}

let config = {
    type: Phaser.AUTO,
    parent: "gameContainer",
    width: 920,
    height: 150,
    scene: [
        Play
    ],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 10}
        }
    },
    pixelArt: true
};

let game;
window.onload = function () {
    game = new Phaser.Game(config);
};