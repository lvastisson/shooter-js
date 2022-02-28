var c = document.querySelector("#myCanvas");
var ctx = c.getContext("2d");
var bgImg = document.getElementById('bg');
var playerImg = document.getElementById('player');
var rocketImg = document.getElementById('rocket');
var rocketImg2 = document.getElementById('rocket2');
var rocketImg3 = document.getElementById('rocket3');
var enemyImg = document.getElementById('enemy');
var enemyImg2 = document.getElementById('enemy2');
var enemyDead = document.getElementById('enemy_dead');

var enemyFrames = [enemyImg, enemyImg2];
var rocketFrames = [rocketImg, rocketImg2, rocketImg3];

var gameObjects = [
    new GameObject(0, 'Player', 200, 700, 100, 100, 0),
    new GameObject(1, 'Enemy1', 320, 60, 100, 100, 2)
];

var theGameLoop;
var gameLoopOn = true;
var score = 0;
var lastSpawned = 50;
var spawnDelay = 50;

var direction = 0;
var shootReady = 0;
var shot = false;

function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = new Array(rows);
    }
    return arr;
}

function runGame() {
    initializeGame();
    gameLoop();
}

function initializeGame() {
    document.addEventListener('keydown', function(event) {
        if(event.keyCode == 37 || event.keyCode == 65) {
            event.preventDefault();
            direction = -1;
        }
        else if(event.keyCode == 39 || event.keyCode == 68) {
            event.preventDefault();
            direction = 1;
        }
        if(event.keyCode == 32 && shootReady == 0) {
            event.preventDefault();
            shootReady = 1;
        }
    });

    document.addEventListener('keyup', function(event) {
        event.preventDefault();

        if(event.keyCode == 37 || event.keyCode == 65) {
            direction = 0;
        }
        else if(event.keyCode == 39 || event.keyCode == 68) {
            direction = 0;
        }
        if(event.keyCode == 32) {
            shootReady = 0;
            shot = false;
        }
    });
}

function gameLoop() {
    lastSpawned--;

    if (lastSpawned <= 0) {
        spawnEnemy();

        lastSpawned = spawnDelay;

        if (spawnDelay > 1)
            spawnDelay--;
    }

    if (shootReady == 1 && !shot) {
        shoot();
        shot = true;
    }

    for (let i = 0; i < gameObjects.length; i++) {
        if (!gameObjects[i].enabled)
            continue;

        switch (gameObjects[i].objType) {
            case 0:
                handlePlayerCollision(i);
                gameObjects[0].xCoord += 20 * direction;
                break;
            case 1:
                handleEnemy(i);
                break;
            case 2:
                handleBullet(i);
                break;
        }
    }

    render();

    clearTimeout(theGameLoop);
    if (gameLoopOn)
        theGameLoop = setTimeout(gameLoop, 50);
}

function spawnEnemy() {
    gameObjects.push(new GameObject(1, 'Enemy', getRandomInt(50, 750), -50, 100, 100, 2))
}

function handleBullet(bulletIndex) {
    gameObjects[bulletIndex].yCoord -= 20;

    const bullet = gameObjects[bulletIndex];

    if (bullet.yCoord < -100)
        gameObjects[bulletIndex].enabled = false;

    for (let i = 0; i < gameObjects.length; i++) {
        const elem = gameObjects[i];

        if (elem.objType == 0 || elem.objType == 2 || !elem.enabled)
            continue;

        if (checkRectCollision(bullet, elem)) {
            gameObjects[bulletIndex].enabled = false;
            gameObjects[i].enabled = false;
            gameObjects[i].dying = true;
            score++;
        }
    }
}

function handlePlayerCollision(playerIndex) {

    const player = gameObjects[playerIndex];

    for (let i = 0; i < gameObjects.length; i++) {
        if (i == playerIndex)
            continue;

        const elem = gameObjects[i];

        if (!elem.enabled)
            continue;

        if (checkRectCollision(player, elem)) {
            console.log("player collided with: " + elem.name);
            callGameOver();
        }
    }
}

function shoot() {
    gameObjects.push(new GameObject(2, 'Bullet', gameObjects[0].xCoord, gameObjects[0].yCoord - 100, 20, 60, 3));
}

function checkRectCollision(obj1, obj2) {
    if (obj1.yCoord - (obj1.objHeight / 2) < obj2.yCoord + (obj2.objHeight / 2) &&
        obj1.yCoord + (obj1.objHeight / 2) > obj2.yCoord - (obj2.objHeight / 2) &&
        obj1.xCoord + (obj1.objWidth / 2) > obj2.xCoord - (obj2.objWidth / 2) &&
        obj1.xCoord - (obj1.objWidth / 2) < obj2.xCoord + (obj2.objWidth / 2)) {

        return true;
    }
    else{
        return false;
    }
}

function handleEnemy(enemyIndex) {
    enemy = gameObjects[enemyIndex];

    if (!enemy.enabled)
        return;

    enemy.yCoord += 5;

    if (enemy.yCoord > 800) {
        callGameOver();
        gameObjects[enemyIndex].enabled = false;
    }
}

function render() {
    ctx.clearRect(0, 0, 800, 800);

    ctx.drawImage(bgImg, 0, 0, 800, 800);

    for (let i = 0; i < gameObjects.length; i++) {
        const elem = gameObjects[i];
        
        if (!elem.enabled && !elem.dying)
            continue;

        ctx.fillStyle = "black";

        switch(elem.objType) {
            case 0:
                drawImg(playerImg, elem)
                // ctx.fillStyle = "#DDD";
                // ctx.fillRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                break;
            case 1:
                cycleAnimFrame(i);

                if (!elem.dying) {
                    drawImg(enemyFrames[gameObjects[i].animFrame], elem);
                }
                else {
                    if(gameObjects[i].deathAnimLength > 0.05) {
                        gameObjects[i].deathAnimLength -= 0.1;
                    }
                    else {
                        gameObjects[i].deathAnimLength = 0;
                        gameObjects[i].dying = false;
                    }

                    ctx.globalAlpha = gameObjects[i].deathAnimLength;
                    drawImg(enemyDead, elem);
                    ctx.globalAlpha = 1;
                }  
                // ctx.fillRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                break;
            case 2:
                cycleAnimFrame(i);

                drawImg(rocketFrames[gameObjects[i].animFrame], elem);
                // ctx.strokeStyle = 'black';
                // ctx.fillStyle = "#13692a";
                // ctx.fillRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                // ctx.strokeRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                break;
        }
    }

    ctx.stroke();

    displayScore();
}

function drawImg(image, elem) {
    ctx.drawImage(image, elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
}

function cycleAnimFrame(objectIndex) {
    gameObjects[objectIndex].animStep++;

    if (gameObjects[objectIndex].animStep >= gameObjects[objectIndex].animSpeed) {
        gameObjects[objectIndex].animStep = 0;
        gameObjects[objectIndex].animFrame++;
    }

    if (gameObjects[objectIndex].animFrame >= gameObjects[objectIndex].framesCount) {
        gameObjects[objectIndex].animFrame = 0;
    }
}

function callGameOver() {
    gameLoopOn = false;
    clearTimeout(theGameLoop);
    setTimeout(gameOver, 100);
}

function gameOver() {
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillRect(300,350,200,80);
    ctx.fillStyle = "black";
    ctx.fillText("Game Over", 400, 400);
    ctx.stroke();
}

function displayScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 0, 20);
    ctx.stroke();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function GameObject(objTypeIndex, objName, x, y, width, height, framesCount) {
    this.enabled = true;
    this.dying = false;
    this.animFrame = 0;
    this.animStep = 0;
    this.animSpeed = 10;
    this.deathAnimLength = 1;
    this.framesCount = framesCount;
    this.objType = objTypeIndex;
    this.name = objName;
    this.xCoord = x;
    this.yCoord = y;
    this.objWidth = width;
    this.objHeight = height;
}