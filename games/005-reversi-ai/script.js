'use strict';
const getOtherPlayer = (player) => (player % 2) + 1;

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
          displayText = 'Black Wins!';
          break;
        case 2:
          displayText = 'White Wins!';
          break;
        case 0:
          displayText = 'Draw';
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
  const moveHistory = [];
  const getMoveHistory = () => moveHistory.slice(); // shallow copy
  const replayHistory = (movesArray) => {
    reset();
    for (const move of movesArray) {
      makeMove({x: move.x, y: move.y}, move.player, true);
    }
  }
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
          availableMoves.push({x, y, player});
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
  const makeMove = (coords, player, skipCheck=false) => {
    let moveIsValid = false;
    if (!skipCheck) {
      moveIsValid = moveIsAllowed(coords, player);
    }
    if (skipCheck || moveIsValid) {
      placePiece(coords, player);
      moveHistory.push(Object.freeze({player, ...coords}));
    };
    return moveIsValid;
  };
  const stepBack = () => {
    if (moveHistory.length > 0) {
      replayHistory(moveHistory.slice(0, moveHistory.length - 1));
    }
  };
  const getCurrentPlayer = () => {
    if (moveHistory.length === 0) {
      return 1;
    }
    const lastMovePlayer = moveHistory.slice(-1)[0]['player'];
    const otherPlayer = lastMovePlayer % 2 + 1;
    if (getAvailableMoves(otherPlayer).length > 0) {
      return otherPlayer;
    } else if (getAvailableMoves(lastMovePlayer).length > 0) {
      return lastMovePlayer;
    } else {
      return 0;
    }
  };
  const reset = () => {
    pieces.splice(0);
    moveHistory.splice(0);
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
    reset, getPieces, moveIsAllowed, makeMove, getCurrentScore, getAvailableMoves,
    getMoveHistory, replayHistory, stepBack, getPieceAtCoords, getCurrentPlayer
  };
};

function MakeGame (_board, _graphicsHandler) {
  const graphicsHandler = _graphicsHandler;
  const board = _board;
  const players = {};
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
  const getOtherPlayer = () => (currentPlayer % 2) + 1;
  const getCurrentPlayer = () => currentPlayer;
  const changePlayer = () => {
    currentPlayer = (currentPlayer % 2) + 1;
  };
  const updateGraphics = () => {
    graphicsHandler.update();
    graphicsHandler.updateInfo(isFinished(), getCurrentPlayer(), getWinner());
  };
  const finishGame = () => {
    currentPlayer = 0;
    gameFinished = true;
  };
  const makeMove = (coords, player) => {
    const moveIsValid = board.moveIsAllowed(coords, player);
    if (player === getCurrentPlayer() && moveIsValid) {
      board.makeMove(coords, getCurrentPlayer());
      if (board.getAvailableMoves(getOtherPlayer()).length > 0) {
        changePlayer();
        players[currentPlayer].pingForTurn(board.getMoveHistory());
      } else if (board.getAvailableMoves(getCurrentPlayer()).length > 0) {
        players[currentPlayer].pingForTurn(board.getMoveHistory());
      } else {
        finishGame();
      }
    }
    updateGraphics();
  };
  const reset = (_player1, _player2) => {
    board.reset();
    players[1] = _player1;
    players[2] = _player2;
    players[1].setMoveMethod(makeMove);
    players[2].setMoveMethod(makeMove);
    currentPlayer = 1;
    gameFinished = false;
    graphicsHandler.setupBoard(board);
    updateGraphics();

    players[1].pingForTurn(board.getMoveHistory());
  };
  return {
    reset, getWinner, isFinished
  };
};

const MakeGameAgent = function (_player) {
  const player = _player;
  let moveMethod;
  let isOwnTurn = false;
  const getPlayer = () => player;
  const setMoveMethod = (func) => {
    moveMethod = func;
  };
  const makeMove = (coords) => {
    moveMethod(coords, player);
  };
  const pingForTurn = () => {
    // alert for turn. Can be ignored if human player
    isOwnTurn = true;
  };
  return {
    setMoveMethod, makeMove, pingForTurn, getPlayer
  };
};

const MakeAiAgent = function(_player) {
  const agent = MakeGameAgent(_player);
  const board = MakeBoard();
  let decisionMethod;
  const setDecisionMethod = (newMethod) => {decisionMethod = newMethod};
  const pingForTurn = (moveHistory) => {
    board.replayHistory(moveHistory);
    decisionMethod();
    //setTimeout(decisionMethod, 1);
  };
  return {
    ...agent, pingForTurn, setDecisionMethod, board
  };
};

const MakeDecisionTreeNode = (_moveHistory, _scoreFunction) => {
  const scoreFunction = _scoreFunction;
  const moveHistory = _moveHistory;
  const board = MakeBoard();
  board.replayHistory(moveHistory);
  const getLastMove = () => moveHistory.slice(-1)[0];
  const nextMoveNodes = [];
  let nodeScore = 0;
  let evaluated = false;
  let expanded = false;
  const getNodeScore = (player) => {
    if (!evaluated) {
      evaluateNode(player);
    }
    return nodeScore;
  }
  const evaluateNode = (player) => {
    if (nextMoveNodes.length === 0) {
      nodeScore = scoreFunction(board, player);
    } else if (board.getCurrentPlayer() === player) {
      // get highest scored next node
      let max = 0;
      for (const moveNode of nextMoveNodes) {
        max = Math.max(max, (moveNode.getNodeScore(player)));
      }
      nodeScore = max;
    } else if (board.getCurrentPlayer() === getOtherPlayer(player)) {
      //get lowest scored next node
      let min = 1;
      for (const moveNode of nextMoveNodes) {
        min = Math.min(min, (moveNode.getNodeScore(player)));
      }
      nodeScore = min;
    } else {
      console.log(player);
      console.log('This should never happen');
      nodeScore = 0;
    }
    evaluated = true;
    return nodeScore;
  };
  const getBestMove = (player, random=false) => {
    // sort by nodeScore in decending order
    if (nextMoveNodes.length === 0) {
      expandTree();
    };
    evaluateNode(player);
    nextMoveNodes.sort((node1, node2) => 
      (node2.getNodeScore(player) - node1.getNodeScore(player)));
    let bestNode = nextMoveNodes[0];
    if (random) {
      if (nextMoveNodes.length > 1 && Math.random() < 0.1) {
        bestNode = nextMoveNodes[1];
      }
    }
    console.log(`Rating: ${nodeScore}`);
    return bestNode.getLastMove();
  };
  const expandTree = () => {
    if (!expanded) {
      expanded = true;
      evaluated = false;
      for (const move of board.getAvailableMoves(board.getCurrentPlayer())) {
        const nextMoveGameHistory = moveHistory.concat([move]);
        const newNode = MakeDecisionTreeNode(nextMoveGameHistory, scoreFunction);
        nextMoveNodes.push(newNode);
      }
    }
  };
  const expandTreeRecursive = (levels) => {
    expandTree();
    levels -= 1;
    if (levels > 0) {
      for (const node of nextMoveNodes) {
        node.expandTreeRecursive(levels);
      }
    }
  };
  const trimTree = (player) => {
    if (nextMoveNodes.length > 0) {
      const opponent = getOtherPlayer(player);
      nextMoveNodes.sort((node1, node2) => 
        (node2.getNodeScore(player) - node1.getNodeScore(player)));
      let topScore;
      // if self, cut bad moves. if opponent, cut good moves (== their bad moves)
      if (board.getCurrentPlayer() === player) {
        topScore = nextMoveNodes[0].getNodeScore(player);
      } else if (board.getCurrentPlayer() === opponent) {
        topScore = nextMoveNodes.slice(-1)[0].getNodeScore(player);
      }
      for (const node of nextMoveNodes) {
        if (Math.abs(topScore - node.getNodeScore(player)) > 0.1) {
          const index = nextMoveNodes.indexOf(node);
          nextMoveNodes.splice(index, 1);
        }
      }
      if (nextMoveNodes.length > 3) {
        if (board.getCurrentPlayer() === player) {
          nextMoveNodes.splice(3);
        } else if (board.getCurrentPlayer() === opponent) {
          nextMoveNodes.splice(0, nextMoveNodes.length - 3);
        }
      }
      // trim recursively
      for (const node of nextMoveNodes) {
        node.trimTree(player);
      }
    }
  };
  const countTotalNodes = () => {
    let totalNodes = 1;
    for (const node of nextMoveNodes) {
      totalNodes += node.countTotalNodes();
    }
    return totalNodes;
  };
  return {
    expandTree, expandTreeRecursive, getNodeScore, getLastMove, getBestMove, trimTree, countTotalNodes
  };
};

const MakeMinimaxAi = function (_player, _scoreFunction) {
  const agent = MakeAiAgent(_player);
  const scoreFunction = _scoreFunction;
  let currentNode;
  const getCurrentNode = () => currentNode;
  const chooseMove = () => {
    let currentBoard = agent.board;
    let currentPlayer = agent.getPlayer();
    currentNode = MakeDecisionTreeNode(currentBoard.getMoveHistory(), scoreFunction);
    let depth = 0;
    while (currentNode.countTotalNodes() < 400 && depth < 10) {
      depth += 1;
      currentNode.expandTreeRecursive(depth);
      if (depth > 3) {
        currentNode.trimTree(currentPlayer);
      }
    }
    let move = currentNode.getBestMove(currentPlayer, true);
    agent.makeMove(move);
  };
  agent.setDecisionMethod(chooseMove);
  return {
    ...agent, getCurrentNode
  };
};

const MakePlayer = function (_player) {
  const agent = MakeGameAgent(_player);
  const addClickListeners = () => {
    document.querySelectorAll('.board-square').forEach(square => {
      square.addEventListener('click', (e) => {
        let [x, y] = e.target.id.split(',').map(Number);
        agent.makeMove({x, y});
      });
    });
  };
  return {
    ...agent, addClickListeners
  };
};

const normalize = (value, max, min) => {
  return (value - min) / (max - min);
};

const hybridScoreFunction = (board, player) => {
  const opponent = getOtherPlayer(player);
  const pieceCount = board.getCurrentScore()[player];
  const opponentPieceCount = board.getCurrentScore()[getOtherPlayer(player)];
  const pieceScore = normalize((pieceCount - opponentPieceCount), 64, -64);

  let percentageFinished = board.getMoveHistory().length / 60;
  let positionWeight = 1 - percentageFinished ** 4;
  let positionScore = 0;
  const pieces = board.getPieces();
  const corners = [];
  const cornerAdjacents = [];
  corners.push(board.getPieceAtCoords({x: 1, y: 1}));
  corners.push(board.getPieceAtCoords({x: 8, y: 1}));
  corners.push(board.getPieceAtCoords({x: 1, y: 8}));
  corners.push(board.getPieceAtCoords({x: 8, y: 8}));
  cornerAdjacents.push(board.getPieceAtCoords({x: 2, y: 2}));
  cornerAdjacents.push(board.getPieceAtCoords({x: 7, y: 2}));
  cornerAdjacents.push(board.getPieceAtCoords({x: 2, y: 7}));
  cornerAdjacents.push(board.getPieceAtCoords({x: 7, y: 7}));
  let selfCorners = 0;
  let opponentCorners = 0;
  let cornerAdjacentScore = 0;
  for (let i = 0; i < corners.length; i++) {
    let square = corners[i];
    if (square === player) {
      selfCorners++;
    } else if (square === opponent) {
      opponentCorners++;
    } else {
      // if corner isn't taken, adjacent (diagonal) is anti-valuable
      if (cornerAdjacents[i] === player) {
        cornerAdjacentScore -= 10;
      } else if (cornerAdjacents[i] === opponent) {
        cornerAdjacentScore = 10;
      }
    }
  }
  // 10 * (4 + 3 + 2 + 1)
  const selfCornerScore = (9 * selfCorners - selfCorners ** 2) * 5;
  const opponentCornerScore = (9 * opponentCorners - opponentCorners ** 2) * 5;
  const cornerScore = selfCornerScore - opponentCornerScore;
  let takenCorners = selfCorners + opponentCorners;
  positionScore += normalize(cornerScore, 100, -100) * 0.5;
  positionScore += normalize(cornerAdjacentScore, 50, -50) * ((4 - takenCorners) / 4) * 0.5;

  let score = pieceScore * (1 - positionWeight) + positionScore * positionWeight;
  // if game is finished, override and set to 100 or -100 depending on winner
  if (board.getCurrentPlayer() === 0) {
    if (pieceCount > opponentPieceCount) {
      score = 1;
    } else {
      score = 0;
    }
  }
  return score;
}

const game = MakeGame(MakeBoard(), graphicsHandler);

let ai1 = MakeMinimaxAi(1, hybridScoreFunction);

function startPlayerGame () {
  let player = MakePlayer(2);
  game.reset(ai1, player);
  player.addClickListeners();
  return game;
}

function startNewGame () {
  game.reset(ai1, ai2);
  return game;
}

startPlayerGame();
