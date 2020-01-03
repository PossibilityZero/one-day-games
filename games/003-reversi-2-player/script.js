'use strict';

const graphicsHandler = (() => {
  const boardElement = document.getElementById('board');
  const scoreElement = document.getElementById('score-readout');
  const turnElement = document.getElementById('turn-readout');
  let board;
  const generateSquares = () => {
    for (let x = 1; x <= 8; x++) {
      for (let y = 1; y <= 8; y++) {
        const newSquare = document.createElement('div');
        newSquare.classList.add('board-square');
        newSquare.style.order = (x - 1) * 8 + y;
        newSquare.id = `${x},${y}`;
        boardElement.appendChild(newSquare);
      }
    }
  };
  const clearBoard = () => {
    while (boardElement.children.length > 0) {
      boardElement.removeChild(boardElement.firstChild);
    }
  };
  const setupBoard = (_board) => {
    clearBoard();
    generateSquares();
    board = _board;
  };
  const clearPieces = () => {
    for (const square of document.querySelectorAll('.board-square')) {
      while (square.children.length > 0) {
        square.removeChild(square.firstChild);
      }
    }
  };
  const addPiece = (coords, player) => {
    if (player === 0) {
      return;
    }
    const newPiece = document.createElement('div');
    newPiece.classList.add('piece');
    newPiece.classList.add(player === 1 ? 'black' : 'white');
    const squareId = `${coords.x},${coords.y}`;
    document.getElementById(squareId).appendChild(newPiece);
  };
  const drawPieces = () => {
    clearPieces();
    const pieces = board.getPieces();
    for (let x = 1; x <= 8; x++) {
      for (let y = 1; y <= 8; y++) {
        addPiece({x,y}, pieces[x-1][y-1]);
      }
    }
  };
  const updateInfo = (gameFinished, currentPlayer, winner) => {
    if (gameFinished) {
      let displayText;
      switch (winner) {
        case 1:
          displayText = "Black Wins!";
          break;
        case 2:
          displayText = "White Wins!";
          break;
        case 0:
          displayText = "Draw";
          break;
      }
      turnElement.textContent = displayText;
    } else {
      turnElement.textContent = `Turn: Player ${currentPlayer}`;
    }
  };
  const updateScore = () => {
    let {1: playerOneScore, 2: playerTwoScore} = board.getCurrentScore();
    scoreElement.textContent = `Black: ${playerOneScore} - White: ${playerTwoScore}`;
  };
  const update = () => {
    updateScore();
    drawPieces();
  };
  return {
    setupBoard, addPiece, update, updateInfo
  };
})();

function MakeBoard () {
  const pieces = [];
  const directions = [
    {x: 1, y: 1}, {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: -1},
    {x: -1, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}
  ];
  const getPieces = () => pieces;
  const getPieceAtCoords = (coords) => {
    return pieces[coords.x-1][coords.y-1];
  };
  const countPieces = (player) => {
    let count = 0;
    for (const row of pieces) {
      for (const piece of row) {
        if (piece === player) {
          count++;
        }
      }
    }
    return count;
  };
  const getCurrentScore = () => {
    return {1: countPieces(1), 2: countPieces(2)};
  };
  const getAvailableMoves = (player) => {
    const availableMoves = [];
    for (let x = 1; x <= 8; x++) {
      for (let y = 1; y <= 8; y++) {
        if (moveIsAllowed({x, y}, player)) {
          availableMoves.push({x, y});
        }
      }
    }
    return availableMoves;
  };
  const getRay = (origin, direction) => {
    const rayPieces = [];
    for (let i = 1; i < 8; i++) {
      const x = origin.x + direction.x * i;
      const y = origin.y + direction.y * i;
      if (x < 1 || x > 8 || y < 1 || y > 8) {
        break;
      } else {
        rayPieces.push(getPieceAtCoords({x, y}));
      }
    }
    return rayPieces;
  };
  const getPiecesCanFlipInRay = (ray, player) => {
    const opponent = player % 2 + 1;
    let count = 0;
    let didSandwich = false;
    for (const piece of ray) {
      if (piece === opponent) {
        count += 1;
      } else if (piece === 0) {
        break;
      } else {
        didSandwich = true;
        break;
      }
    }
    if (didSandwich) {
      return count;
    } else {
      return 0;
    }
  };
  const moveIsAllowed = (coords, player) => {
    let canFlipAny = false;
    for (const direction of directions) {
      const ray = getRay(coords, direction);
      if (getPiecesCanFlipInRay(ray, player) > 0) {
        canFlipAny = true;
        break;
      }
    };
    return canFlipAny && getPieceAtCoords(coords) === 0;
  };
  const forcePiece = (coords, player) => {
    pieces[coords.x-1][coords.y-1] = player;
  };
  const placePiece = (coords, player) => {
    pieces[coords.x-1][coords.y-1] = player;
    // flip pieces
    for (const direction of directions) {
      const ray = getRay(coords, direction);
      for (let i = 1; i <= getPiecesCanFlipInRay(ray, player); i++) {
        forcePiece({x: coords.x + i * direction.x, y: coords.y + i * direction.y}, player);
      }
    };
  };
  const makeMove = (coords, player) => {
    let moveIsValid = moveIsAllowed(coords, player);
    if (moveIsValid) {
      placePiece(coords, player);
    };
    return moveIsValid;
  };
  const reset = () => {
    pieces.splice(0);
    for (let x = 1; x <= 8; x++) {
      pieces.push([]);
      for (let y = 1; y <= 8; y++) {
        pieces[x-1].push(0);
      }
    }
    forcePiece({x: 4, y: 4}, 2);
    forcePiece({x: 4, y: 5}, 1);
    forcePiece({x: 5, y: 4}, 1);
    forcePiece({x: 5, y: 5}, 2);
  };
  return {
    reset, getPieces, makeMove, getCurrentScore, getAvailableMoves
  };
};

function MakeGame (_board, _graphicsHandler) {
  const graphicsHandler = _graphicsHandler;
  const board = _board;
  let currentPlayer = 0;
  let gameFinished = false;
  const getWinner = () => {
    const {1: playerOne, 2: playerTwo} = board.getCurrentScore();
    if (playerOne > playerTwo) {
      return 1;
    } else if (playerOne < playerTwo) {
      return 2;
    } else {
      return 0; // tie
    }
  };
  const isFinished = () => gameFinished;
  const changePlayer = () => {
    currentPlayer = (currentPlayer % 2) + 1;
  };
  const updateGraphics = () => {
    graphicsHandler.update();
    graphicsHandler.updateInfo(isFinished(), currentPlayer, getWinner());
  };
  const finishGame = () => {
    currentPlayer = 0;
    gameFinished = true;
  };
  const makeMove = (coords) => {
    const moveWasValid = board.makeMove(coords, currentPlayer)
    if (moveWasValid) {
      changePlayer();
    }
    if (board.getAvailableMoves(currentPlayer).length === 0) {
      changePlayer();
      if (board.getAvailableMoves(currentPlayer).length === 0) {
        finishGame();
      }
    }
    updateGraphics();
  };
  const reset = () => {
    currentPlayer = 1;
    gameFinished = false;
    board.reset();
    graphicsHandler.setupBoard(board);
    updateGraphics();
  };
  return {
    reset, makeMove, getWinner, isFinished
  };
};


const game = MakeGame(MakeBoard(), graphicsHandler);

function startNewGame () {
  game.reset();
}

startNewGame();

document.querySelectorAll('.board-square').forEach(square => {
  square.addEventListener('click', (e) => {
    let [x, y] = e.target.id.split(',').map(Number);
    game.makeMove({x, y});
  });
});
