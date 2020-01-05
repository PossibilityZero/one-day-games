'use strict';

const graphicsHandler = (() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const height = 600;
  const width = 500;
  const xOrigin = width / 2;
  const yOrigin = height - 100;
  const setupCanvas = () => {
    canvas.height = height;
    canvas.width = width;
  };
  const translateCoords = (coords) => {
    let drawX = coords.x + xOrigin;
    let drawY = yOrigin - coords.y;
    return {x: drawX, y: drawY};
  };
  const clearCanvas = () => {
    ctx.fillStyle = '#778';
    ctx.fillRect(0, 0, width, height);
  };
  const drawPaddle = (paddle) => {
    ctx.fillStyle = '#557';
    let center = translateCoords(paddle.getCoords());
    let length = paddle.getLength();
    let angle = paddle.getAngle();
    ctx.translate(center.x, center.y);
    ctx.rotate(-angle);
    ctx.fillRect(-length / 2, -5, length, 10);
    ctx.rotate(angle);
    ctx.translate(-center.x, -center.y);
  };
  const drawBall = (ball) => {
    const drawCoords = translateCoords(ball.getCoords());
    ctx.fillStyle = ball.getColor();
    ctx.beginPath();
    ctx.arc(drawCoords.x, drawCoords.y, 8, 0, 2 * Math.PI, true);
    ctx.fill();
  };
  const updateInfo = (score, lives, activeBalls) => {
    document.getElementById('score-readout').textContent = `Score: ${score}`;
    document.getElementById('lives-readout').textContent = `Lives: ${lives}`;
    document.getElementById('active-balls-readout').textContent = `Active Balls: ${activeBalls}`;
  };
  const update = (balls, paddles) => {
    clearCanvas();
    balls.forEach((ball) => {
      drawBall(ball);
    });
    paddles.forEach((paddle) => {
      drawPaddle(paddle);
    });
  };
  setupCanvas();
  return {
    update, updateInfo
  };
})();

function MakePaddle (paddleType) {
  let x = 0;
  let y = 0;
  let length = 100;
  let angle = 0;
  let type = paddleType;
  const getCoords = () => ({x, y});
  const getLength = () => length;
  const getAngle = () => angle;
  const isAbovePaddle = (coords) => {
    let xOffset = coords.x - x;
    return coords.y > y + xOffset * Math.tan(angle);
  };
  const isBelowPaddle = (coords) => {
  };
  const isWithinLength = (ballX) => {
    // return true if x falls within boundaries of paddle;
    const adjustedLength = (length / 2) * Math.cos(angle);
    const furthestLeft = x - adjustedLength;
    const furthestRight = x + adjustedLength;
    return ballX >= furthestLeft && ballX <= furthestRight;
  };
  const setPosition = () => {
    if (paddleType === 'mouse') {
      y = (1 / 1000) * (x ** 2);
      angle = x / 500;
    }
  };
  const moveTo = (_x) => {
    x = _x;
    setPosition();
  };
  return {
    getCoords, getLength, getAngle, isWithinLength, isAbovePaddle,
    moveTo
  };
}
function pickRandomColor () {
  let hex = '012345abcdef';
  let color = '#';
  for (let i = 0; i < 3; i++) {
    color += hex[Math.floor(Math.random() * hex.length)];
  }
  return color;
}

function MakeBall (startX, startY, xStartVelocity, yStartVelocity) {
  const color = pickRandomColor();
  const getColor = () => color;
  let didJustBounce = false;
  let x = startX;
  let y = startY;
  let previousX, previousY;
  let xVelocity = xStartVelocity;
  let yVelocity = yStartVelocity;
  const getCoords = () => ({x, y});
  const applyGravity = () => {
    yVelocity -= 1.0;
  };
  const getPreviousCoords = () => ({x: previousX, y: previousY});
  const getNextCoords = () => ({x: x + xVelocity, y: y + yVelocity});
  const bounce = (angle) => {
    // I totally guessed this
    xVelocity = yVelocity * Math.sin(angle) + xVelocity * Math.cos(angle);
    yVelocity = - (xVelocity * Math.sin(angle) + yVelocity * Math.cos(angle));
    didJustBounce = true;
  };
  const update = () => {
    if (didJustBounce) {
      didJustBounce = false;
    } else {
      applyGravity();
    }
    previousX = x;
    previousY = y;
    x += xVelocity;
    y += yVelocity;
  };
  return {
    getPreviousCoords, getCoords, getNextCoords, bounce, update, getColor
  };
}

const game = ((_graphicsHandler) => {
  let interval;
  let ticksPassed = 0;
  let realScore = 0;
  let lives = 3;
  const ticksPerSecond = 40;
  const balls = [];
  const paddles = [];
  const graphicsHandler = _graphicsHandler;
  const addPaddle = (paddle) => {
    paddles.push(paddle);
  };
  const addBall = (ball) => {
    balls.push(ball);
  };
  const updateScore = () => {
    realScore += 2 ** balls.length;
  };
  const getScore = () => Math.floor(realScore / 20);
  const checkJuggles = () => {
    for (const ball of balls) {
      for (const paddle of paddles) {
        const wasAbovePaddle = paddle.isAbovePaddle(ball.getPreviousCoords());
        const isBelowPaddle = !paddle.isAbovePaddle(ball.getCoords());
        const willIntersectPaddle = wasAbovePaddle && isBelowPaddle;
        const isWithinLength = paddle.isWithinLength(ball.getCoords().x);
        if (willIntersectPaddle && isWithinLength) {
          ball.bounce(paddle.getAngle());
          realScore += 200;
        }
      }
    }
  };
  const playTick = () => {
    ticksPassed++;
    checkJuggles();
    for (const ball of balls) {
      ball.update();
      if (ball.getCoords().y < -100) {
        balls.splice(balls.indexOf(ball), 1);
        lives -= 1;
      }
    }
    updateScore();

    graphicsHandler.update(balls, paddles);
    graphicsHandler.updateInfo(getScore(), lives, balls.length)
    
    if (lives > 0) {
      interval = setTimeout(playTick, 1000 / ticksPerSecond);
    }
    if (ticksPassed % (ticksPerSecond * 5) === 0 || balls.length === 0) {
      const xStart = -50 + Math.floor(Math.random() * 100);
      const yStart = 150 + Math.floor(Math.random() * 100);
      const xStartVelocity = -5 + Math.floor(Math.random() * 10);
      const yStartVelocity = 5 + Math.floor(Math.random() * 15);
      addBall(MakeBall(xStart, yStart, xStartVelocity, yStartVelocity));
    }
  };
  const start = () => {
    interval = setTimeout(playTick, 1000 / ticksPerSecond);
  };
  const pause = () => {
    clearInterval(interval);
  };
  const reset = () => {
    ticksPassed = 0;
    realScore = 0;
    lives = 3;
    balls.splice(0);
    clearInterval(interval);
    game.addBall(MakeBall(0, 300, 0, 0));
    start();
  };
  return {
    start, pause, reset, playTick,
    getScore,
    addBall, addPaddle
  };
})(graphicsHandler);

const canvas = document.querySelector('#game');
const mousePaddle = MakePaddle('mouse');
canvas.addEventListener('mousemove', (e) => {
  const xOrigin = 500 / 2;
  mousePaddle.moveTo(e.offsetX - xOrigin);
});

document.getElementById('reset').addEventListener('click', () => {
  game.reset();
});
game.addPaddle(mousePaddle);
game.reset();
