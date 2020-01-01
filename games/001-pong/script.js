const BOARD_HEIGHT = 450;
const BOARD_WIDTH = 800;
const GAME_TO = 5;

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 450;

function clearCanvas() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 800, 450);
}

function drawScore(leftPlayerScore, rightPlayerScore) {
  ctx.font = '48px sans-serif';
  ctx.fillStyle = '#ccc';
  ctx.fillText(leftPlayerScore, 5, 40, 50);
  ctx.fillText(rightPlayerScore, BOARD_WIDTH - 30, 40, 50);
}

function drawBall(ball) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(ball.getX() - 5, ball.getY() - 5, 10, 10);
}

function drawPaddle(paddle) {
  ctx.fillStyle = paddle.style;
  ctx.fillRect(paddle.getX(), paddle.getY(), 10, paddle.getHeight());
}

const MakePaddle = function(color, startingX, startingY) {
  const x = startingX;
  let y = startingY;
  const height = 100;
  const getX = () => x;
  const getY = () => y;
  const getHeight = () => height;
  const moveUp = () => {
    if (y - 10 < 0) {
      y = 0;
    } else {
      y -= 10;
    }
  };
  const moveDown = () => {
    if (y + 10 + height > BOARD_HEIGHT) {
      y = BOARD_HEIGHT - height;
    } else {
      y += 10;
    }
  };
  const style = color;
  const willBounce = (ballX, ballY, ballSpeedX, ballSpeedY) => {
    // check that getX() is between ballX and ballX+ballSpeedX
    const doesTouchX = (ballX - getX()) * ((ballX+ballSpeedX) - getX()) <= 0;
    const doesTouchY = (ballY > getY()) && (ballY < getY() + getHeight());
    return doesTouchX && doesTouchY;
  };
  return {
    getX, getY, getHeight, style, moveUp, moveDown, willBounce
  };
};

const computerPaddle = MakePaddle('#900', 50, 200);
const playerPaddle = MakePaddle('#090', 750, 200);

const ball = ((paddle1, paddle2) => {
  const leftPlayer = paddle1;
  const rightPlayer = paddle2;
  let x = 200;
  let y = 200;
  let xSpeed = 5;
  let ySpeed = 5;
  const reset = () => {
    x = BOARD_WIDTH / 2;
    y = BOARD_HEIGHT / 2;
    xSpeed = (8 + Math.floor(Math.random() * 7)) * (Math.random() < 0.8 ? 1 : -1);
    ySpeed = (12 + Math.floor(Math.random() * 5)) * (Math.random() < 0.5 ? 1 : -1);
    // move the ball slightly away from the side it's going towards
    x -= xSpeed * 10;
  };
  const getX = () => x;
  const getY = () => y;
  const update = () => {
    x += xSpeed;
    y += ySpeed;
    if (y > BOARD_HEIGHT - 5 || y < 0) {
      ySpeed *= -1;
    }
    if (leftPlayer.willBounce(x, y, xSpeed, ySpeed) || rightPlayer.willBounce(x, y, xSpeed, ySpeed)) {
      xSpeed *= -1;
    }
  };
  reset();
  return {
    getX, getY, update, reset
  }
})(computerPaddle, playerPaddle);

function updateComputer() {
  if (computerPaddle.getY() + 50 > ball.getY()) {
    computerPaddle.moveUp();
  } else {
    computerPaddle.moveDown();
  }
}

function updatePlayer() {
  if (playerState.isGoingUp()) {
    playerPaddle.moveUp();
  } else if (playerState.isGoingDown()) {
    playerPaddle.moveDown();
  }
}

const playerState = (() => {
  let upArrowKeyIsDown = false;
  let downArrowKeyIsDown = false;
  const press = (key) => {
    if (key === 'up') {upArrowKeyIsDown = true} else {downArrowKeyIsDown = true}
  };
  const raise = (key) => {
    if (key === 'up') {upArrowKeyIsDown = false} else {downArrowKeyIsDown = false}
  };
  const isGoingUp = () => upArrowKeyIsDown && !downArrowKeyIsDown;
  const isGoingDown = () => !upArrowKeyIsDown && downArrowKeyIsDown;
  return {
    isGoingUp, isGoingDown, press, raise
  }
})();

window.addEventListener('keydown', function handleKeydown(e) {
  if (e.keyCode === 38) {
    playerState.press('up');
    e.preventDefault();
  } else if (e.keyCode === 40) {
    playerState.press('down');
    e.preventDefault();
  }
});
window.addEventListener('keyup', function handleKeydown(e) {
  if (e.keyCode === 38) {
    playerState.raise('up');
    e.preventDefault();
  } else if (e.keyCode === 40) {
    playerState.raise('down');
    e.preventDefault();
  }
});

let playerScore = 0;
let computerScore = 0;
function update() {
  clearCanvas();
  ball.update()
  drawBall(ball);
  if (ball.getX() > BOARD_WIDTH) {
    ball.reset();
    computerScore += 1;
  } else if (ball.getX() < 0) {
    ball.reset();
    playerScore += 1;
  }
  updatePlayer();
  updateComputer();
  drawPaddle(playerPaddle);
  drawPaddle(computerPaddle);
  if (ball.getX() > BOARD_WIDTH) {
    ball.reset();
    computerScore += 1;
  } else if (ball.getX() < 0) {
    ball.reset();
    playerScore += 1;
  }
  drawScore(computerScore, playerScore);
  if (computerScore >= GAME_TO || playerScore >= GAME_TO) {
    clearInterval(startGame);
    ctx.font = '100px sans-serif';
    ctx.fillStyle = '#ccc';
    if (playerScore > computerScore) {
      ctx.fillText("WINNER!", 200, BOARD_HEIGHT / 2);
    } else {
      ctx.fillText("GAME OVER", 100, BOARD_HEIGHT / 2);
    }
  }
}

const startGame = setInterval(update, 20);
