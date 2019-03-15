let path;
let pathLength;

class Menu extends Phaser.Scene {
    constructor() {
        super({key: "menu", active: true});
        console.log("menu")
    }

    preload() {
        this.load.image("MainMenu", "resource/MainMenu.png");
    }

    create() {
        this.add.image(0, 0, "MainMenu").setOrigin(0, 0);
        this.input.once("pointerup", function () {
            this.scene.start("Play", {levelChosen: 1})
        }, this)
    }

    update() {

    }
}

class Play extends Phaser.Scene {

    constructor() {
        super({key: "Play", active: false});
        console.log("play");

        this.bottomTabData = {
            height: 120,
            width: 200,
            address: "resource/bottom-tab.png"
        };

        this.selectedTurretId = null;

    }

    preload() {
        this.load.multiatlas("atlas", "resource/bigSheet.json", "resource");
        this.load.json("waveData", "resource/waveData.json");
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
            t.depth = 0;
            this.mapGroup.add(t);
        }
        this.mapGroup.refresh(); // dunno what this does but eh

        this.ghostPoints = this.mapData.ghostPoints;
        for (let i = 0; i < this.ghostPoints.length; i++) {
            if (i === 0) {
                path = this.add.path(this.ghostPoints[i].x, this.ghostPoints[i].y);
                continue;
            }
            path.lineTo(this.ghostPoints[i].x, this.ghostPoints[i].y);
        }
        pathLength = path.getLength();

    }

    create(data) {
        this.mapChosen = data.levelChosen;
        WAVE_DATA = this.cache.json.get("waveData");
        this.setMap(this.mapChosen);
        this.arrayOfMenuItems = [];
        this.arrayOfMenuText = [];

        this.ghostsMap = {};
        this.ghostsIdList = [];
        this.turretsMap = {};
        this.turretsIdList = [];
        this.bulletsMap = {};
        this.bulletsIdList = [];

        this.gameStats = {
            money: 0,
            ghostsPoppped: 0,
            spawnChance: 1,
            maxChance: 200,
            repeats: 1
        };

        this.waveStats = {
            currentWave: 1,
            status: 0, // 0 - waiting to start, 1 - in progress, 2- finished/in last chunk
        };

        this.bottom_tab = this.add.image(0, game.config.height - this.bottomTabData.height, "atlas", "Menu Items/bottom-tab.png");
        this.bottom_tab.depth = 10;

        /*        this.turretMenuButton = this.add.sprite(game.config.width, 0, "atlas", "Menu Items/turretMenuButtonClosed.png");
                this.turretMenuButton.setInteractive();
                this.turretMenuButton.on("pointerup", this.handleTurretMenu);*/

        this.turretMenu = this.add.image(game.config.width, 0, "atlas", "Menu Items/turretMenu.png");
        //this.turretMenu.visible = false;
        this.turretMenu.depth = 10;

        this.startWaveButton = this.add.image(860, 490, "atlas", "Menu Items/startwave.png");
        this.startWaveButton.depth = 10;
        this.startWaveButton.on("pointerup", this.startWave, this);
        this.startWaveButton.setInteractive();


        this.graphics = this.add.graphics(); // needed to draw turrets and maybe something else idk

        // DO MENU SHIT
        let startY = 50; // FIRST ITEM CENTER
        let yGap = 50; // GAP BETWEEN CENTERS
        this.arrayOfMenuText = [];
        for (let i = 0; i < NUMBER_OF_MENU_ITEMS; i++) {
            let temp = this.add.image(game.config.width - this.turretMenu.width / 2, startY + (i * yGap), "atlas", "Menu Items/item" + i + ".png");
            //temp.visible = false;
            temp.setInteractive();
            temp.on("pointerup", function () {
                this.buy(i);
            }, this); // 'this' is to send context of scene
            temp.depth = 11;
            this.arrayOfMenuItems.push(temp);

            let item = this.arrayOfMenuItems[i];
            item.visible = true;
            this.arrayOfMenuItems[i].setInteractive(true);
            let t = this.add.text(item.x, item.y, "$" + TURRET_DATA[i].price, {fontFamily: '"Roboto Condensed"'});
            t.depth = 12;
            this.arrayOfMenuText.push(t);
        }

        this.moneyText = this.add.text(50, 500, "Money: $" + this.gameStats.money);
        this.moneyText.depth = 11;

        this.totalWaveText = " of " + (WAVE_DATA.length-1);

        this.waveNoText = this.add.text(50, 550, "Wave: " + this.waveStats.currentWave + this.totalWaveText);
        this.waveNoText.depth = 11;

        let escKey = this.input.keyboard.addKey("ESC");
        escKey.on("down", function () {
            let id = (this.selectedTurretId);
            this.selectTurret(null);

            if (!this.turretsMap[id].isPlaced) {
                this.gameStats.money += this.turretsMap[id].value;
                this.turretsMap[id].kill();
                return;
            }
            this.turretsMap[id].isSelected = false;

        }, this);


        for (let key in TURRET_DATA) {
            let data = TURRET_DATA[key];

            var frameNames = this.anims.generateFrameNames("atlas", {
                start: 1, end: 3, zeroPad: 1,
                prefix: data.imagePath, suffix: '.png'
            });
            this.anims.create({
                key: data.imagePath + "fire",
                frames: frameNames,
                frameRate: 45,
                repeat: 0
            });

            this.anims.create({
                key: data.imagePath + "static",
                frames: [{key: "atlas", frame: data.imagePath + "3.png"}],
                frameRate: 5,
                repeat: 0
            });
        }
    }

    selectTurret(id) {
        this.selectedTurretId = id;

        this.leftUpgrade = this.add.image(790, 495, "atlas", "Menu Items/upgradeButton.png");
        this.leftUpgrade.tint = 0x00e000;
        this.leftUpgrade.depth = 12;
        console.log("upgrade")

    }

    checkWaveEnd() {
        if (this.ghostsIdList.length <= 0 && this.waveStats.status === 2) {
            this.waveStats.status = 0;
            this.gameStats.money += WAVE_DATA[this.waveStats.currentWave].completeBonus;
            let winText = this.add.text(300, 275, "Wave " + this.waveStats.currentWave + " complete!");
            winText.setDisplaySize(260, 30);
            let timer = this.time.addEvent({
                delay: 5000,
                callbackScope: this,
                callback: function () {
                    winText.destroy();
                }
            });
            this.waveStats.currentWave++;
            this.startWaveButton.setFrame("Menu Items/startwave.png")
        }
    }

    startWave() {
        if (this.waveStats.status !== 0) {
            return;
        }
        this.loadWave(this.waveStats.currentWave);
        this.waveStats.status = 1;
        this.startWaveButton.setFrame("Menu Items/waveongoing.png")
    }

    buy(i) { // in context of the scene
        let selTurret = this.turretsMap[this.selectedTurretId];
        if (selTurret != null) { // if it exits
            if (!selTurret.isPlaced) { // if its still trying to place another
                return;
            }
        }
        // TODO if(!isUnlocked){return}

        let price = TURRET_DATA[i].price;
        if (price > this.gameStats.money) {

            this.arrayOfMenuItems[i].tint = 0xf0a0a0;
            let timeEvent = this.time.addEvent({
                delay: 500,
                callback: function () {
                    this.arrayOfMenuItems[i].clearTint();
                },
                callbackScope: this
            });
            return;
        }
        this.gameStats.money -= price;

        this.selectTurret(this.createTurret(i, this));

    }

    /*spawn() {
        let m;
        if (this.gameStats.spawnChance < 10) {
            m = 2;
        } else if (this.gameStats.spawnChance < 15) {
            m = 3;
        } else {
            m = 4;
        }
        let n;
        if (this.gameStats.spawnChance > 3) {
            n = 1;
        } else {
            n = 0;
        }

        for (let i = 0; i < this.gameStats.repeats; i++) {
            this.createGhost(Phaser.Math.Between(n, m), this);
        }
        this.frameWithoutSpawn = 0;
    }*/

    update(time, delta) {
        this.graphics.clear();

        if (this.selectedTurretId != null) {
            if (this.turretsMap[this.selectedTurretId].isPlaced) {
                this.graphics.fillStyle(0xf0f0f0, 0.5);
                this.graphics.fillCircleShape(this.turretsMap[this.selectedTurretId].circle);
            }
        }

        this.moneyText.text = "Money: $" + this.gameStats.money;
        this.waveNoText.text = "Wave: " + this.waveStats.currentWave + this.totalWaveText;

        /* let n = Phaser.Math.Between(0, this.gameStats.maxChance);
         if (n < this.gameStats.spawnChance) {
             this.spawn();
             this.gameStats.spawnChance += 0.075;
             if (this.gameStats.spawnChance > this.gameStats.maxChance) {
                 this.gameStats.maxChance += 100;
                 this.gameStats.repeats += 1;
             }
             console.log(this.gameStats)
         }
         this.frameWithoutSpawn++;
         if (this.frameWithoutSpawn > 100) {
             this.spawn();
         }*/


        for (let i = 0; i < this.turretsIdList.length; i++) {
            this.turretsMap[this.turretsIdList[i]].update(time);
        }

        for (let i = 0; i < this.ghostsIdList.length; i++) {
            this.ghostsMap[this.ghostsIdList[i]].update(delta);
        }

        for (let i = 0; i < this.bulletsIdList.length; i++) {
            this.bulletsMap[this.bulletsIdList[i]].update(delta);
        }

        this.checkWaveEnd();
    }

    createTurret(tier, scene) {
        let id;
        do {
            id = Phaser.Math.Between(0, Number.MAX_SAFE_INTEGER - 1); // dont really need -1 but OVERCOMPENSATION
        } while (this.turretsIdList.indexOf(id) !== -1);
        this.turretsIdList.push(id);
        this.turretsMap[id] = new Turret(id, tier, scene);
        //this.turretsMap[id] = new itemsData[tier].class(id, scene);
        this.selectTurret(id);

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

    createBullet(x, y, angle, scene, ownerId, layers, ghosts) {
        let id;
        do {
            id = Phaser.Math.Between(0, Number.MAX_SAFE_INTEGER - 1); // dont really need -1 but OVERCOMPENSATION
        } while (this.bulletsIdList.indexOf(id) !== -1);
        this.bulletsIdList.push(id);
        this.bulletsMap[id] = new Bullet(id, x, y, angle, scene, ownerId, layers, ghosts);

        return id;
    }

    loadWave(w) {
        let data = WAVE_DATA[w];
        for (let i = 0; i < data.ghosts.length; i++) {
            this.time.addEvent({
                delay: data.ghosts[i].timeBefore,
                callback: function () {
                    for (let j = 0; j < data.ghosts[i].amount; j++) {
                        let id = this.createGhost(data.ghosts[i].tier, this);
                        this.ghostsMap[id].follower.t -= j * data.ghosts[i].tBetween;
                    }
                    if (i >= data.ghosts.length - 1) {
                        this.waveStats.status = 2;
                    }
                },
                callbackScope: this
            })
        }
    }
}

class Bullet {

    constructor(id, x, y, angle, scene, ownerId, layers, ghosts) {
        this.id = id;
        this.sprite = scene.add.sprite(x, y, "atlas", "projectiles/bullet.png");
        this.speed = PROJECTILE_DATA.bullet1.speed;
        this.sprite.setPosition(x, y);
        this.startX = x;
        this.startY = y;
        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);
        this.ownerId = ownerId;
        this.range = scene.turretsMap[ownerId].range;
        this.layers = layers;
        this.ghosts = ghosts;
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
                this.sprite.scene.ghostsMap[l[i]].pop(this.layers);
                this.ghosts--;
                this.sprite.scene.turretsMap[this.ownerId].ghostsPopped++;
                if (this.ghosts < 1) {
                    this.kill();
                }
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

    constructor(id, tier, scene) {
        this.ghostsPopped = 0;
        this.id = id;
        this.tier = tier;

        this.isValid = true;
        this.isPlaced = false;
        //this.isSelected = true;
        this.readyToShoot = true;

        let data = TURRET_DATA[this.tier];
        this.shotCooldown = data.shotCooldown; // milliseconds --- should be set in subclass
        this.lastShot = 0;

        this.range = data.range;
        this.createCircle(this.range);

        this.value = data.price;

        this.layersPerGhost = data.layersPerGhost;
        this.ghostsPerBullet = data.ghostsPerBullet;

        this.sprite = scene.add.sprite(0, 0, "atlas", data.imagePath + "3.png");

        this.sprite.setScale(0.5);

        this.sprite.play(data.imagePath + "fire");
        this.path = data.imagePath;

        this.sprite.setInteractive();
        this.sprite.on("pointerup", this.place, this);

        this.preference = "first";

    }

    kill() {
        this.sprite.scene.turretsIdList.splice(this.sprite.scene.turretsIdList.indexOf(this.id), 1);
        delete this.sprite.scene.turretsMap[this.id];
        this.sprite.destroy();
    }

    findClosestGhost() { // closest to turret
        let arr = this.sprite.scene.ghostsIdList;
        let gMap = this.sprite.scene.ghostsMap;

        let closestDist = null;
        let closestId = null;
        for (let i = arr.length - 1; i >= 0; i--) {
            let g = gMap[arr[i]].sprite;

            let d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, g.x, g.y);
            if (d < closestDist || closestDist == null) {
                closestDist = d;
                closestId = arr[i];
            }
        }
        if (closestId == null) {
            return null;
        }
        let g = gMap[closestId].sprite;
        let gCirc = new Phaser.Geom.Circle(g.x, g.y, g.width / 2);
        if (Phaser.Geom.Intersects.CircleToCircle(gCirc, this.circle)) {
            return closestId;
        }
        return null;
    }

    findLastGhost() { // closest to end
        let arr = this.sprite.scene.ghostsIdList;
        let gMap = this.sprite.scene.ghostsMap;

        let lowestT = null;
        let lowestId = null;
        for (let i = arr.length - 1; i >= 0; i--) {
            let g = gMap[arr[i]].sprite;
            if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, g.x, g.y) > this.range + gMap[arr[i]].sprite.width / 2) {
                continue;
            }

            let t = gMap[arr[i]].follower.t;
            if (t < lowestT || lowestT == null) {
                lowestT = t;
                lowestId = arr[i];
            }
        }
        if (lowestId == null) {
            return null;
        }
        let g = gMap[lowestId].sprite;
        let gCirc = new Phaser.Geom.Circle(g.x, g.y, g.width / 2);
        if (Phaser.Geom.Intersects.CircleToCircle(gCirc, this.circle)) {
            return lowestId;
        }
        return null;
    }

    findFirstGhost() { // closest to start
        let arr = this.sprite.scene.ghostsIdList;
        let gMap = this.sprite.scene.ghostsMap;

        let highestT = null;
        let highestId = null;
        for (let i = arr.length - 1; i >= 0; i--) {
            let g = gMap[arr[i]].sprite;
            if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, g.x, g.y) > this.range + gMap[arr[i]].sprite.width / 2) {
                continue;
            }
            let t = gMap[arr[i]].follower.t;
            if (t < highestT || highestT == null) {
                highestT = t;
                highestId = arr[i];
            }
        }
        if (highestId == null) {
            return null;
        }
        let g = gMap[highestId].sprite;
        let gCirc = new Phaser.Geom.Circle(g.x, g.y, g.width / 2);
        if (Phaser.Geom.Intersects.CircleToCircle(gCirc, this.circle)) {
            return highestId;
        }
        return null;
    }

    chooseGhost() {
        let cg = this.sprite.scene.ghostsMap[this.chosenGhostId];
        if (cg != null && Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, cg.sprite.x, cg.sprite.y) < this.range) {
            return this.chosenGhostId
        }

        switch (this.preference) {
            case "closest":
                this.chosenGhostId = this.findClosestGhost();
                break;
            case "first":
                this.chosenGhostId = this.findFirstGhost();
                break;
            case "last":
                this.chosenGhostId = this.findLastGhost();
                break;
        }
        return this.chosenGhostId;
    }

    checkLocValid() {
        // if not colliding with anything (map, turrets, buttons, side, then return true
        return !(this.checkIsOnMap() || this.collidesTurret() || this.sprite.x + this.sprite.width / 4 > game.config.width - this.sprite.scene.turretMenu.width || this.sprite.y + this.sprite.width / 4 > game.config.height - this.sprite.scene.bottom_tab.height);
    }

    update(time) {
        if (!this.isPlaced) {
            this.x = game.input.mousePointer.x;
            this.y = game.input.mousePointer.y;
            this.sprite.setX(this.x);
            this.sprite.setY(this.y);
            this.circle.setPosition(this.x, this.y);

            let colour;

            this.isValid = this.checkLocValid();

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


        if (this.readyToShoot) {
            if (!this.lookAtGhost()) { // if not found
                return;
            }
            this.shoot();

            this.lastShot = time;
            this.readyToShoot = false;

        } else {
            this.lookAtGhost();
        }
    }

    shoot() {
        this.sprite.play(this.path + "fire");
        this.sprite.scene.createBullet(this.sprite.x, this.sprite.y, this.sprite.rotation, this.sprite.scene, this.id, this.layersPerGhost, this.ghostsPerBullet);
        this.chooseGhost();
    }

    lookAtGhost() { // returns true if it found a ghost

        let ghost = this.sprite.scene.ghostsMap[this.chosenGhostId];

        if (ghost == null) { // if it doesnt exist
            ghost = this.sprite.scene.ghostsMap[this.chooseGhost()]; // get a new one
            if (ghost == null) { // if there are no ghosts nearby
                return false; // return
            }
        }

        //let d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, ghost.sprite.x, ghost.sprite.y);

        /*if (d > this.range + ghost.sprite.width / 2) { // if the current ghost is out of range
            ghost = this.sprite.scene.ghostsMap[this.chooseGhost()]; // get a new one
            if (ghost == null) { // if it doesnt exist
                return false; // get a new one
            }
        }*/

        let rotation = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, ghost.sprite.x, ghost.sprite.y);

        this.sprite.setRotation(rotation);

        return true;
    }

    place() {
        if (!this.isValid) {
            return;
        }

        this.isPlaced = true;
        this.sprite.scene.selectTurret(this.id);

        this.sprite.on("pointerup", this.select, this);
    }

    select() {
        //this.isSelected = true;
        this.sprite.scene.selectTurret(this.id);
    }

    checkIsOnMap() {
        let turret = this.sprite;
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

    collidesTurret() {
        let turret = this.sprite;
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

class Ghost {

    constructor(id, tier, scene) {
        this.id = id;
        this.tier = tier;

        this.sprite = scene.add.sprite(0, 0, "atlas", "ghosts/red.png");
        this.sprite.on("pointerdown", this.pop, this);

        this.sprite.setInteractive();
        this.sprite.depth = Phaser.Math.Between(1, 9);

        this.setTier(this.tier, scene);

        this.follower = {t: 0, vec: new Phaser.Math.Vector2()};
        this.startPath();

    }

    setTier(tier) {
        this.tier = tier;
        let ghostInfo = GHOST_DATA.tiers[tier];
        if (ghostInfo == null) {

            return this.tier;
        }

        // Calculate speed
        let pixelPerSeconds = ghostInfo.speed;
        let seconds = pathLength / pixelPerSeconds;
        this.speed = 1 / seconds; // t per second, total of 1t divided by how many seconds it should take. this is then x in each update

        // Set image
        this.sprite.setFrame(ghostInfo.imagePath, true, true);
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
        let m = a;
        if (n < 0) {
            m = n + a + 1;
        }
        this.sprite.scene.gameStats.ghostsPoppped += m;
        this.sprite.scene.gameStats.money += 5 * m;
        if (this.setTier(n) < 0) {
            this.kill();
        }
    }
}

const NUMBER_OF_MENU_ITEMS = 2;

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

const TURRET_DATA = {
    0: {
        price: 450,
        range: 100,
        shotCooldown: 400,
        imagePath: "turrets/yellow/default/",
        layersPerGhost: 1,
        ghostsPerBullet: 1,
        upgrades: {
            left: [
                {
                    name: "better range",
                    description: "increases range",
                    price: 100,
                    effect: "range 20"
                }
            ],
            right: []
        }
    },
    1: {
        price: 700,
        range: 200,
        shotCooldown: 650,
        imagePath: "turrets/red/default/",
        layersPerGhost: 1,
        ghostsPerBullet: 2,
    }
};

const GHOST_DATA = {
    tiers: {
        0: {
            speed: 95, // pixels per seconds
            imagePath: "ghosts/red.png",
            layerHealth: 1,
            immunities: []
        },
        1: {
            speed: 125, // pixels per seconds
            imagePath: "ghosts/blue.png",
            layerHealth: 1,
            immunities: []
        },
        2: {
            speed: 140, // pixels per seconds
            imagePath: "ghosts/green.png",
            layerHealth: 1,
            immunities: []
        },
        3: {
            speed: 200, // pixels per seconds
            imagePath: "ghosts/lilac.png",
            layerHealth: 1,
            immunities: []
        },
        4: {
            speed: 280, // pixels per seconds
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

let WAVE_DATA;

let config = {
    type: Phaser.AUTO,
    parent: "gameContainer",
    width: 920,
    height: 600,
    scene: [
        Menu,
        Play
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0}
        }
    }
};
let game;
window.onload = function () {
    game = new Phaser.Game(config);
};