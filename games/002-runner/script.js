'use strict';
const xOrigin = 0;
const yOrigin = 350;
const GAME_HEIGHT = 400;
const GAME_WIDTH = 800;

const canvas = document.querySelector('#runner-game');
const context = canvas.getContext('2d');

canvas.height = GAME_HEIGHT;
canvas.width = GAME_WIDTH;
context.fillStyle = '#888';
context.fillRect(0,0,800,400);

const canvasHandler = ((context) => {
  const ctx = context;
  const clear = () => {
    context.fillStyle = '#888';
    context.fillRect(0, 0, 800, 400);
  };
  const drawPlatforms = (platforms) => {
    platforms.getFloors().forEach((floor) => {
      if (floor.timeRemaining > 100 || floor.timeRemaining % 10 < 5) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#111";
        ctx.beginPath();
        ctx.moveTo(floor.start, yOrigin - floor.height);
        ctx.lineTo(floor.end, yOrigin - floor.height);
        ctx.stroke();
      }
    });
  };
  const drawPlayer = (player) => {
    ctx.fillStyle = '#ddd';
    // head
    ctx.beginPath();
    const headRadius = 10;
    const bodySize = 20;
    const headX = xOrigin + player.getCoords().x;
    const headY = yOrigin - player.getCoords().y - (headRadius + bodySize + 1)
    ctx.arc(headX, headY, headRadius, Math.PI * 0.7 , 2.3 * Math.PI, false);
    ctx.lineTo(headX + 10, headY + (headRadius + bodySize));
    ctx.lineTo(headX - 10, headY + (headRadius + bodySize));

    ctx.fill();
  };
  const update = (player, platforms) => {
    clear();
    drawPlayer(player);
    drawPlatforms(platforms);
  }
  return {
    update, clear, drawPlayer
  }
})(context);

const platforms = (function MakePlatform() {
  const floors = [];
  const getFloorCount = () => floors.length;
  const getFloors = () => floors;
  const createFloor = () => {
    const height = Math.floor(Math.random() * 10) * 30;
    let start = Math.floor(Math.random() * 600);
    if (start < 30) {start = 0}; // don't allow a tiny gap
    let end = start + 200 + Math.floor(Math.random() * 400);
    if (end > GAME_WIDTH - 30) {end = GAME_WIDTH}; // don't allow a tiny gap
    const timeRemaining = 300 + Math.floor(Math.random() * 400);
    const newFloor = {
      height, start, end, timeRemaining
    };
    floors.push(newFloor);
  };
  const getFloorBelow = (x, y) => {
    const applicableFloors = floors.filter(floor => {
      const isBelowCoords = floor.height <= y;
      const isWithinCoords = floor.start <= x && floor.end >= x;
      return isBelowCoords && isWithinCoords;
    });
    applicableFloors.sort((floorA, floorB) => floorA.height < floorB.height);
    if (applicableFloors.length === 0) {
      return -1000;
    } else {
      return applicableFloors[0].height;
    }
  };
  const update = () => {
    for (let i = floors.length - 1 ; i >= 0 ; i--) {
      const floor = floors[i];
      floor.timeRemaining -= 1;
      if (floor.timeRemaining < 0) {
        floors.splice(i, 1);
      }
    }
  };
  const reset = () => {
    floors.splice(0);
    Array.prototype.push.apply(floors, [
      {
        height: 90,
        start: 0,
        end: 600,
        timeRemaining: 120,
      },
      {
        height: 240,
        start: 0,
        end: 500,
        timeRemaining: 550
      },
      {
        height: 180,
        start: 500,
        end: GAME_WIDTH,
        timeRemaining: 300,
      },
      {
        height: 30,
        start: 600,
        end: GAME_WIDTH,
        timeRemaining: 200,
      }
    ]);
  };
  return {
    getFloorCount, getFloors, getFloorBelow, createFloor, update, reset
  };
})();

const player = (function MakePlayer(_platform) {
  const platforms = _platform;
  let height;
  let position;
  let xVelocity;
  let yVelocity;
  const reset = () => {
    height = 150;
    position = 0;
    xVelocity = 10;
    yVelocity = 0;
  };
  const getCoords = () => ({x: position, y: height});
  const applyGravity = () => {
    if (height === platforms.getFloorBelow(position, height)) {
      yVelocity = 0;
    } else {
      yVelocity -= 0.9;
    }
  };
  const jump = () => {
    if (height === platforms.getFloorBelow(position, height)) {
      yVelocity = 15;
    }
  };
  const bumpDown = () => {
    if (height === platforms.getFloorBelow(position, height)) {
      height -= 1;
    }
  };
  const update = () => {
    if (position + xVelocity < 0 || position + xVelocity > GAME_WIDTH) {
      xVelocity *= -1;
    }
    position += xVelocity;

    const currentFloor = platforms.getFloorBelow(position, height);
    if (height > currentFloor && height + yVelocity < currentFloor) {
      height = currentFloor;
    } else {
      height += yVelocity;
    }
    applyGravity();
  };
  const isOnPlatform = () => yVelocity === 0;
  return {
    jump, bumpDown, reset, getCoords, update, isOnPlatform
  };
})(platforms);

window.addEventListener('keydown', function(e) {
  if (e.keyCode === 38 || e.keyCode === 32) {
    e.preventDefault();
    player.jump();
  } else if (e.keyCode === 40) {
    e.preventDefault();
    player.bumpDown();
  }
});

let score = 0;
let game;

const scoreReadout = document.querySelector('#score-readout');
function update() {
  if (Math.random() < 0.01 * (8 - platforms.getFloorCount())) {
    platforms.createFloor();
  }
  scoreReadout.textContent = "Score: " + Math.floor(score);
  platforms.update();
  player.update();
  canvasHandler.update(player, platforms);
  if (player.getCoords().y < -100) {
    console.log('Game Over');
    clearInterval(game);
  }
  if (player.isOnPlatform()) {
    score += 100 / (20 + 5 * Math.max(0, player.getCoords().y));
  }
}

function restart() {
  clearInterval(game);
  platforms.reset();
  player.reset();
  score = 0;
  game = setInterval(update, 20);
}

document.querySelector('#start-game-button').addEventListener('click', () => {
  restart();
});

restart();
