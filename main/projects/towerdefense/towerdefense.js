var path;
var pathLength;

class Play extends Phaser.Scene {

    constructor() {
        super({key: "Play"});
        this.bottomTabData = {
            height: 120,
            width: 200,
            address: "assets/bottom-tab.png"
        };
        this.turretMenuButtonData = {
            width: 60,
            height: 60,
            closedAddress: "Menu Items/turretMenuButtonClosed.png",
            openAddress: "assets/turretMenuButtonOpen.png"
        };
        this.turretMenuData = {
            width: 120,
            height: 600,
            address: "assets/turretMenu.png"
        };
        this.selectedTurret = null;
        this.playerStats = {
            money: 0,
            ghostsKilled: 0
        }
    }

    preload() {
        this.load.multiatlas("atlas", "assets/bigSheet.json", "assets");

    }

    setMap(map) {
        this.mapData = MAP_DATA[map];
        if (this.mapData == null) {
            console.log("aah map not exist");
            return;
        }

        this.mapGroup = this.physics.add.staticGroup();

        for (let i = 0; i < this.mapData.coords.length; i++) {
            let t = this.add.sprite(this.mapData.coords[i].x, this.mapData.coords[i].y, "atlas", this.mapData.path + i + ".png");
            this.mapGroup.add(t);
        }
        this.mapGroup.refresh(); // dunno what this does but eh

        this.ghostPoints = this.mapData.ghostPoints;
        for (let i = 0; i < this.ghostPoints.length; i++) {
            if (i == 0) {
                path = this.add.path(this.ghostPoints[i].x, this.ghostPoints[i].y);
                continue;
            }
            path.lineTo(this.ghostPoints[i].x, this.ghostPoints[i].y);
        }
        pathLength = path.getLength();

    }

    create() {
        let mapChosen = 1; // temporary
        this.setMap(1);
        this.arrayOfMenuItems = [];
        this.arrayOfMenuText = [];

        this.ghostsMap = {};
        this.ghostsIdList = [];
        this.turretsMap = {};
        this.turretsIdList = [];
        this.bulletsMap = {};
        this.bulletsIdList = [];

        this.gameStats = {
            money: 1000,
            ghostsPoppped: 0,
            spawnChance: 1
        };


        this.bottom_tab = this.add.image(0, game.config.height - this.bottomTabData.height, "atlas", "Menu Items/bottom-tab.png");

        this.turretMenuButton = this.add.sprite(game.config.width, 0, "atlas", "Menu Items/turretMenuButtonClosed.png");
        this.turretMenuButton.setInteractive();
        this.turretMenuButton.on("pointerup", this.handleTurretMenu);

        this.turretMenu = this.add.image(game.config.width, 0, "atlas", "Menu Items/turretMenu.png");
        this.turretMenu.visible = false;
        this.turretMenu.depth = 2;


        this.createGhost(0, this);


        this.enemiesGroup = new Phaser.GameObjects.Group(this);


        this.graphics = this.add.graphics(); // needed to draw turrets and maybe something else idk

        // DO MENU SHIT
        let startY = 50; // FIRST ITEM CENTER
        let yGap = 50; // GAP BETWEEN CENTERS
        for (let i = 0; i < NUMBER_OF_MENU_ITEMS; i++) {
            let temp = this.add.image(game.config.width - this.turretMenu.width / 2, startY + (i * yGap), "atlas", "Menu Items/item" + i + ".png");
            temp.visible = false;
            temp.setInteractive();
            temp.on("pointerup", function () {
                this.buy(i);
            }, this); // 'this' is to send context of scene
            temp.depth = 3;
            this.arrayOfMenuItems.push(temp);
        }

        //TODO make this one animation
        this.anims.create({ // CHANGE IMAGE OF MENU BUTTON
            key: "turretMenuButtonClosed",
            frames: [{key: "atlas", frame: "Menu Items/turretMenuButtonClosed.png"}],
            frameRate: 1,
            repeat: 0
        });
        this.anims.create({
            key: "turretMenuButtonOpen",
            frames: [{key: "atlas", frame: "Menu Items/turretMenuButtonOpen.png"}],
            frameRate: 1,
            repeat: 0
        });
        this.moneyText = this.add.text(50, 500, "$" + this.gameStats.money);


    }

    buy(i) { // in context of the scene
        let selTurret = this.turretsMap[this.selectedTurretId];
        if (selTurret != null) { // if it exits
            if (!selTurret.isPlaced) { // if its still trying to place another
                return;
            }
        }
        // TODO if(!isUnlocked){return}

        let price = itemsData[i].price;
        if (price > this.gameStats.money) {
            return;
        }
        this.gameStats.money -= price;

        this.selectedTurretId = this.createTurret(i, this);
        this.turretMenuHide();
    }

    handleTurretMenu() {
        let menu = this.scene.turretMenu;
        if (menu.visible) {
            this.scene.turretMenuHide();
        } else {
            this.scene.turretMenuShow();
        }
    }

    turretMenuHide() { // for some reason this is from perspective of the scene when called from event
        let menu = this.turretMenu;
        this.turretMenuButton.x = game.config.width;
        menu.visible = false;
        this.turretMenuButton.play("turretMenuButtonClosed");
        for (let i = 0; i < NUMBER_OF_MENU_ITEMS; i++) {
            this.arrayOfMenuItems[i].visible = false;
            this.arrayOfMenuItems[i].setInteractive(false);
            this.arrayOfMenuText[i].destroy();
        }
        return;
    }

    turretMenuShow() {
        let menu = this.turretMenu;
        this.turretMenuButton.x = game.config.width - menu.width;
        menu.visible = true;
        this.turretMenuButton.play("turretMenuButtonOpen");

        this.arrayOfMenuText = [];
        for (let i = 0; i < NUMBER_OF_MENU_ITEMS; i++) {
            let item = this.arrayOfMenuItems[i];
            item.visible = true;
            this.arrayOfMenuItems[i].setInteractive(true);
            let t = this.add.text(item.x, item.y, "$" + itemsData[i].price, {fontFamily: '"Roboto Condensed"'});
            t.depth = 4;
            this.arrayOfMenuText.push(t);
        }
        return;

    }

    spawn() {
        let m;
        if (this.gameStats.spawnChance < 2) {
            m = 2;
        } else {
            m = 4;
        }
        let n;
        if (this.gameStats.spawnChance > 3) {
            n = 1;
        } else {
            n = 0;
        }

        this.createGhost(Phaser.Math.Between(n, m), this);
        this.frameWithoutSpawn = 0;
    }

    update(time, delta) {
        this.graphics.clear();

        if (this.selectedTurretId != null) {
            if (this.turretsMap[this.selectedTurretId].isPlaced) {
                this.graphics.fillStyle(0xf0f0f0, 0.5);
                this.graphics.fillCircleShape(this.turretsMap[this.selectedTurretId].circle);
            }
        }

        this.moneyText.text = "$" + this.gameStats.money;

        let n = Phaser.Math.Between(0, 200);
        if (n < this.gameStats.spawnChance) {
            this.spawn();
            this.gameStats.spawnChance += 0.075;
        }
        this.frameWithoutSpawn++;
        if (this.frameWithoutSpawn > 100) {
            this.spawn();
        }


        for (let i = 0; i < this.turretsIdList.length; i++) {
            this.turretsMap[this.turretsIdList[i]].update(time);
        }

        for (let i = 0; i < this.ghostsIdList.length; i++) {
            this.ghostsMap[this.ghostsIdList[i]].update(delta);
        }

        for (let i = 0; i < this.bulletsIdList.length; i++) {
            this.bulletsMap[this.bulletsIdList[i]].update(delta);
        }

    }

    createTurret(tier, scene) {
        let id;
        do {
            id = Phaser.Math.Between(0, Number.MAX_SAFE_INTEGER - 1); // dont really need -1 but OVERCOMPENSATION
        } while (this.turretsIdList.indexOf(id) !== -1);
        this.turretsIdList.push(id);
        this.turretsMap[id] = new itemsData[tier].class(id, scene);

        return id;
    }

    createGhost(tier, scene) {
        let id;
        do {
            id = Phaser.Math.Between(0, Number.MAX_SAFE_INTEGER - 1); // dont really need -1 but OVERCOMPENSATION
        } while (this.ghostsIdList.indexOf(id) !== -1);
        this.ghostsIdList.push(id);
        this.ghostsMap[id] = new Ghost(id, tier, scene);

        return id;
    }

    createBullet(x, y, angle, scene, ownerId) {
        let id;
        do {
            id = Phaser.Math.Between(0, Number.MAX_SAFE_INTEGER - 1); // dont really need -1 but OVERCOMPENSATION
        } while (this.bulletsIdList.indexOf(id) !== -1);
        this.bulletsIdList.push(id);
        this.bulletsMap[id] = new Bullet(id, x, y, angle, scene, ownerId);

        return id;
    }

}

class Bullet {

    constructor(id, x, y, angle, scene, ownerId) {
        this.id = id;
        this.sprite = scene.add.sprite(x, y, "atlas", "projectiles/bullet.png");
        this.speed = 2;
        this.sprite.setPosition(x, y);
        this.startX = x;
        this.startY = y;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        this.ownerId = ownerId
        this.range = scene.turretsMap[ownerId].range;
    }


    update(delta) {
        this.sprite.x += this.dx * (this.speed * delta);
        this.sprite.y += this.dy * (this.speed * delta);

        let l = this.sprite.scene.ghostsIdList;

        for (let i = 0; i < l.length; i++) {
            let g = this.sprite.scene.ghostsMap[l[i]].sprite;
            let gCirc = new Phaser.Geom.Circle(g.x, g.y, g.width / 2);
            let bCirc = new Phaser.Geom.Circle(this.sprite.x, this.sprite.y, this.sprite.width / 2);
            if (Phaser.Geom.Intersects.CircleToCircle(gCirc, bCirc)) {
                this.sprite.scene.ghostsMap[l[i]].pop(1);
                this.sprite.scene.turretsMap[this.ownerId].ghostsPopped++;
                this.kill();
                return;
            }
        }
        if (Phaser.Math.Distance.Between(this.startX, this.startY, this.sprite.x, this.sprite.y) > this.range) {
            this.kill();
        }
    }

    kill() {
        this.sprite.scene.bulletsIdList.splice(this.sprite.scene.bulletsIdList.indexOf(this.id), 1);
        delete this.sprite.scene.bulletsMap[this.id];
        this.sprite.destroy();
    }
}

class Turret {

    constructor(id, path, scene) {
        this.ghostsPopped = 0;
        this.id = id;

        this.isValid = true;
        this.isPlaced = false;
        this.isSelected = true;
        this.readyToShoot = true;
        this.shotCooldown = 50; // milliseconds --- should be set in subclass
        this.lastShot = 0;

        this.sprite = scene.add.sprite(0, 0, "atlas", path + "3.png");

        this.sprite.setScale(0.5);
        var frameNames = scene.anims.generateFrameNames("atlas", {
            start: 1, end: 3, zeroPad: 1,
            prefix: path, suffix: '.png'
        });
        scene.anims.create({
            key: path + "fire",
            frames: frameNames,
            frameRate: 25,
            repeat: 0
        });

        scene.anims.create({
            key: path + "static",
            frames: [{key: "atlas", frame: path + "3.png"}],
            frameRate: 5,
            repeat: 0
        });
        this.sprite.play(path + "fire");
        this.path = path;

        this.sprite.setInteractive();
        this.sprite.on("pointerup", this.place, this);

    }

    findClosestGhost() {
        let arr = this.sprite.scene.ghostsIdList;
        let gMap = this.sprite.scene.ghostsMap;

        for (let i = arr.length - 1; i >= 0; i--) {
            let g = gMap[arr[i]].sprite;
            let gCirc = new Phaser.Geom.Circle(g.x, g.y, g.width / 2);
            if (Phaser.Geom.Intersects.CircleToCircle(gCirc, this.circle)) {
                this.closestGhostId = arr[i];
                return arr[i];
            }
        }
    }

    update(time) {
        if (!this.isPlaced) {
            this.x = game.input.mousePointer.x;
            this.y = game.input.mousePointer.y;
            this.sprite.setX(this.x);
            this.sprite.setY(this.y);
            this.circle.setPosition(this.x, this.y);


            let colour;

            if (this.checkIsOnMap(this.sprite) || this.collidesTurret(this.sprite)) {
                this.isValid = false;
            } else {
                this.isValid = true;
            }
            if (this.isValid) {
                colour = "0x90f090"
            } else {
                colour = "0xf09090"
            }


            this.sprite.scene.graphics.fillStyle(colour, 0.5);

            this.sprite.scene.graphics.fillCircleShape(this.circle);
            return;
        }

        if (time > this.lastShot + this.shotCooldown) {
            this.readyToShoot = true;
        }

        this.lookAtClosestGhost();

        if (this.readyToShoot) {
            if (!this.lookAtClosestGhost()) { // if not found
                return;
            }
            this.shoot();

            this.lastShot = time;
            this.readyToShoot = false;

        }
    }

    shoot() {
        this.sprite.play(this.path + "fire");
        this.sprite.scene.createBullet(this.sprite.x, this.sprite.y, this.sprite.rotation, this.sprite.scene, this.id);

    }

    lookAtClosestGhost() { // returns true if it found a ghost

        let ghost = this.sprite.scene.ghostsMap[this.closestGhostId];

        if (ghost == null) { // if it doesnt exist
            ghost = this.sprite.scene.ghostsMap[this.findClosestGhost()]; // get a new one
            if (ghost == null) { // if there are no ghosts nearby
                return false; // return
            }
        }

        let d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, ghost.sprite.x, ghost.sprite.y);

        if (d > this.range + ghost.sprite.width / 2) { // if the current ghost is out of range
            ghost = this.sprite.scene.ghostsMap[this.findClosestGhost()]; // get a new one
            if (ghost == null) { // if it doesnt exist
                return false; // get a new one
            }
        }

        let rotation = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, ghost.sprite.x, ghost.sprite.y);

        this.sprite.setRotation(rotation);

        return true;
    }


    place() {
        let tSprite = this.sprite;
        let button = this.sprite.scene.turretMenuButton;
        if (tSprite.x + tSprite.width > button.x && tSprite.x < button.x + button.width && tSprite.y + tSprite.height > button.y && tSprite.y < button.y + button.height) {
            return;
        }
        if (!this.isValid) {
            return;
        }


        this.isPlaced = true;
        this.sprite.scene.selectedTurretId = this.id;

        this.sprite.on("pointerup", this.select, this);
    }

    select() {
        this.isSelected = true;
        this.sprite.scene.selectedTurretId = this.id;
    }

    checkIsOnMap(turret) {
        let sc = turret.scene;
        let pieces = sc.mapGroup.children.entries;
        let tW = turret.width / 2 + 2; // divide 2 because turrets are scaled 0.5

        for (let i = 0; i < pieces.length; i++) {
            if (Phaser.Geom.Intersects.CircleToRectangle(new Phaser.Geom.Circle(turret.x, turret.y, tW / 2), pieces[i].getBounds())) {
                return true;
            }
        }
        return false;
    }

    collidesTurret(turret) {
        let sc = turret.scene;

        let tW = turret.width / 2 - 8; // divide 2 because turrets are scaled 0.5  ----- -2 is so they can overlap slightly

        let ids = sc.turretsIdList;
        let map = sc.turretsMap;

        for (let i = 0; i < ids.length - 1; i++) {
            let tCirc = new Phaser.Geom.Circle(turret.x, turret.y, tW / 2);
            let pCirc = new Phaser.Geom.Circle(map[ids[i]].sprite.x, map[ids[i]].sprite.y, map[ids[i]].sprite.width / 4); // divide 4 bc scale and then radius
            if (Phaser.Geom.Intersects.CircleToCircle(tCirc, pCirc)) {
                return true;
            }
        }
        return false;
    }

    createCircle(r) {
        this.circle = new Phaser.Geom.Circle(this.x, this.y, r)
    }

}

class YellowPacman extends Turret {
    constructor(id, scene) {
        super(id, "turrets/yellow/default/", scene);
        this.range = 100;
        this.createCircle(this.range);
        this.shotCooldown = 200;
    }
}

class RedPacman extends Turret {
    constructor(id, scene) {
        super(id, "turrets/red/default/", scene);
        this.range = 200;
        this.createCircle(this.range);
        this.shotCooldown = 400;
    }
}


class Ghost {

    constructor(id, tier, scene) {
        this.id = id;
        this.tier = tier;

        this.sprite = scene.add.sprite(0, 0, "atlas", "ghosts/red.png");
        this.sprite.on("pointerdown", this.pop, this);

        this.sprite.setInteractive();
        this.sprite.depth = this.id;

        this.setTier(this.tier, scene);

        this.follower = {t: 0, vec: new Phaser.Math.Vector2()};
        this.startPath();

    }

    setTier(tier, scene) {
        this.tier = tier;
        let ghostInfo = GHOST_DATA.tiers[tier];
        if (ghostInfo == null) {

            return this.tier;
        }

        // Calculate speed
        let pixelPerSeconds = ghostInfo.speed;
        let seconds = pathLength / pixelPerSeconds;
        let tPerSecond = 1 / seconds;
        this.speed = tPerSecond;

        // Set image
        this.sprite.setFrame(ghostInfo.imagePath, true, true)
        return this.tier;
    }

    startPath() {
        this.follower.t = 0;

        path.getPoint(this.follower.t, this.follower.vec);

        this.sprite.setPosition(this.follower.vec.x, this.follower.vec.y);
    }

    kill() {
        this.sprite.scene.ghostsIdList.splice(this.sprite.scene.ghostsIdList.indexOf(this.id), 1);
        delete this.sprite.scene.ghostsMap[this.id];
                this.sprite.destroy();
    }

    update(delta) {
        this.follower.t += this.speed * (delta / 1000);
        if (this.follower.t > 1) {
            this.kill();

        }
        path.getPoint(this.follower.t, this.follower.vec);

        this.sprite.setPosition(this.follower.vec.x, this.follower.vec.y);

    }


    pop(a) {

        if (isNaN(a)) {
            a = 1;
        }

        let n = this.tier - a;
        this.sprite.scene.gameStats.ghostsPoppped += a;
        this.sprite.scene.gameStats.money += 20;
        if (this.setTier(n) < 0) {
            this.kill();
            return;
        }


    }

}


const NUMBER_OF_MENU_ITEMS = 2;

let itemsData = [
    {price: 100, class: YellowPacman},
    {price: 250, class: RedPacman}
];

const MAP_DATA = [
    null,
    {
        path: "Map/level 1/",
        length: 9, // no. of imgs
        coords: [
            {x: 0, y: 217}, // img 0 etc
            {x: 94, y: 14},
            {x: 142, y: 14},
            {x: 269, y: 62},
            {x: 317, y: 407},
            {x: 472, y: 28},
            {x: 520, y: 28},
            {x: 648, y: 76},
            {x: 696, y: 246}
        ],
        ghostPoints: [
            {x: -40, y: 241},
            {x: 118, y: 241},
            {x: 118, y: 38},
            {x: 293, y: 38},
            {x: 293, y: 431},
            {x: 496, y: 431},
            {x: 496, y: 52},
            {x: 672, y: 52},
            {x: 672, y: 270},
            {x: 840, y: 270}
        ]
    }
];

const GHOST_DATA = {
    tiers: {
        0: {
            speed: 95, // pixels per seconds
            imagePath: "ghosts/red.png",
            layerHealth: 1,
            immunities: []
        },
        1: {
            speed: 145, // pixels per seconds
            imagePath: "ghosts/blue.png",
            layerHealth: 1,
            immunities: []
        },
        2: {
            speed: 190, // pixels per seconds
            imagePath: "ghosts/green.png",
            layerHealth: 1,
            immunities: []
        },
        3: {
            speed: 280, // pixels per seconds
            imagePath: "ghosts/lilac.png",
            layerHealth: 1,
            immunities: []
        },
        4: {
            speed: 350, // pixels per seconds
            imagePath: "ghosts/yellow.png",
            layerHealth: 1,
            immunities: []
        }
    }
};

const PROJECTILE_DATA = {
    bullet1: {
        speed: 1000,
        imagePath: "projectiles/bullet.png"
    }
};


var config = {
    type: Phaser.AUTO,
    parent: "gameContainer",
    width: 800,
    height: 600,
    scene: [
        Play
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0}
        }
    }
};
var game;
window.onload = function () {
    game = new Phaser.Game(config);
}

