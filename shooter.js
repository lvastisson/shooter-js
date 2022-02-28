var c = document.querySelector("#myCanvas");
var ctx = c.getContext("2d");

var gameObjects = [
    new GameObject(0, 'Player', 200, 700, 100, 100),
    new GameObject(1, 'Enemy1', 320, 60, 100, 100),
    new GameObject(1, 'Enemy2', 200, 70, 100, 100),
    new GameObject(1, 'Enemy3', 450, 80, 100, 100),
    new GameObject(2, 'Bullet', 400, 700, 20, 60)
];

var theGameLoop;
var gameLoopOn = true;

var direction = 0;

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
        if(event.keyCode == 37 || direction == -1) {
            gameObjects[0].xCoord -= 10;
            direction == -1;
        }
        else if(event.keyCode == 39 || direction == 1) {
            gameObjects[0].xCoord += 10;
            direction == 1;
        }
    });

    document.addEventListener('keyup', function(event) {
        if(event.keyCode == 37) {
            direction == 0;
        }
        else if(event.keyCode == 39) {
            direction == 0;
        }
    });
}

function gameLoop() {
    for (let i = 0; i < gameObjects.length; i++) {
        switch (gameObjects[i].objType) {
            case 0:
                handlePlayerCollision(i);
                break;
            case 1:
                handleEnemy(i);
                break;
        }
    }

    render();

    clearTimeout(theGameLoop);
    if (gameLoopOn)
        theGameLoop = setTimeout(gameLoop, 50);
}

function handlePlayerCollision(playerIndex) {

    const player = gameObjects[playerIndex];

    for (let i = 0; i < gameObjects.length; i++) {
        if (i == playerIndex)
            continue;

        const elem = gameObjects[i];
        
        if (checkRectCollision(player, elem)) {
            console.log("player collided with: " + elem.name);
            gameLoopOn = false;
            clearTimeout(theGameLoop);
            setTimeout(gameOver, 100);
        }
    }
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
    let i = enemyIndex;

    gameObjects[i].yCoord+=5;
}

function render() {
    ctx.clearRect(0, 0, 800, 800);

    for (let i = 0; i < gameObjects.length; i++) {
        const elem = gameObjects[i];
        
        switch(elem.objType) {
            case 0:
                ctx.fillRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                ctx.stroke();
                break;
            case 1:
                ctx.fillRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                ctx.stroke();
                break;
            case 2:
                ctx.strokeStyle = '#FF0000';
                ctx.fillRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                ctx.strokeRect(elem.xCoord - (elem.objWidth / 2), elem.yCoord - (elem.objHeight / 2), elem.objWidth, elem.objHeight);
                ctx.stroke();
                break;
        }
    }
}

function gameOver() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", 400, 400);
    ctx.stroke();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function GameObject(objTypeIndex, objName, x, y, width, height) {
    this.objType = objTypeIndex;
    this.name = objName;
    this.xCoord = x;
    this.yCoord = y;
    this.objWidth = width;
    this.objHeight = height;
}