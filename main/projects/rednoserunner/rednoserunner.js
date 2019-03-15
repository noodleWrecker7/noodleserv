class Play extends Phaser.Scene {
    constructor() {
        super({key: "Play", active: true})
    }

    preload() {
        this.load.image("nose", "resource/nose.png");
    }

    create() {
        this.player = this.physics.add.sprite(0, 0, "nose").setOrigin(0, 0);

    }

    update() {
    }


}

let config = {
    type: Phaser.AUTO,
    parent: "gameContainer",
    width: 920,
    height: 100,
    scene: [
        Play
    ],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 1}
        }
    },
    pixelArt: true
};

let game;
window.onload = function () {
    game = new Phaser.Game(config);
};