import { gameOver, drawGrid, inGame } from '/main.js'
import * as consts from '/consts.js'

//srs table
const clockwiseSRS = [
  [
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
  ],
  [
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]
  ]
]

let DAStime = 150//100; 
let ARRtime = 10//0;
let SDFMult = 20//"infinity";
let dropSpeed = 2000;
let lockSpeed = 500;

export let grid = [];

let pieceQueue = [];

export let currentX;
export let currentY;
export let currentColor;
export let currentState;
export let currentPiece;
let currentDirection;

export let holdPiece;
export let holdColor;

let canHold;
let getNextPiece;

export let ghostX;
export let ghostY;

let DAStimer;
let SDFtimer;
let lockTime;
let dropTime;

let lockCount;
let lowestY;

export function init() {
  clearInterval(lockTime);
  lockTime = null;
  clearInterval(dropTime);
  dropTime = null;
  grid = Array(consts.GRID_ROW);
  for (let i = 0; i < consts.GRID_COLUMN; i++) {
    grid[i] = Array(consts.GRID_ROW).fill(0);
  }
  holdPiece = null;
  holdColor = null;
  shuffleOrder();
  getNextPiece = true;
  nextPiece();
}

//shuffle order of pieces then add to array
function shuffleOrder() {
  let pieces = ['Z', 'L', 'O', 'S', 'I', 'J', 'T'];
  for (let i = pieces.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  pieceQueue = pieceQueue.concat(pieces);
}

//Dely Auto Shift
function DAS() {
  clearInterval(DAStimer);
  if (currentDirection == "left") {
    moveLeft();
    DAStimer = setTimeout(() => {
      moveLeft();
      DAStimer = setInterval(() => {
        moveLeft();
      }, ARRtime)
    }, DAStime)
  }
  if (currentDirection == "right") {
    moveRight();
    DAStimer = setTimeout(() => {
      moveRight();
      DAStimer = setInterval(() => {
        moveRight();
      }, ARRtime)
    }, DAStime)
  }
}

function moveLeft() {
  if (canMove(currentX - 1, currentY)) {
    currentX--;
    lowestCheck();
    ghostPiece();
    clearInterval(lockTime);
    lockTime = null;
    autolockCheck();
  }
  drawGrid();
}

function moveRight() {
  if (canMove(currentX + 1, currentY)) {
    currentX++;
    lowestCheck();
    ghostPiece();
    clearInterval(lockTime);
    lockTime = null;
    autolockCheck();
  }
  drawGrid();
}

function autolockCheck() {
  if (!canMove(currentX, currentY - 1)) {  
    clearInterval(dropTime);
    dropTime = null;
    if (lockCount < 15) {
      if (!lockTime) {
        lockTimer();
      }
    }
    else {
      lock();
    }
  }
  else {
    if (!dropTime) {
      dropTimer();
    }
  }
}

function lowestCheck() {
  lockCount++;
  if (currentY < lowestY) {
    lowestY = currentY;
    lockCount = 0;
  }
}

function canMove(newX, newY) {
  for (let i = 0; i < 4; i++) {
    if (newX + consts.rotate[consts.piece[currentPiece]][currentState][i][0] < 0 || newX + consts.rotate[consts.piece[currentPiece]][currentState][i][0] >= consts.GRID_ROW || newY + consts.rotate[consts.piece[currentPiece]][currentState][i][1] < 0 || newY + consts.rotate[consts.piece[currentPiece]][currentState][i][1] >= consts.GRID_COLUMN) {
      return false;
    }
    if (grid[newY + consts.rotate[consts.piece[currentPiece]][currentState][i][1]][newX + consts.rotate[consts.piece[currentPiece]][currentState][i][0]] != 0) {
      return false;
    }
  }
  return true;
}

function canRotate(direction, newState) {
  if (currentPiece == "O") {
    return true;
  }
  for (let srs = 0; srs < 5; srs++) {
    let rotatability = true;
    let type = 0;
    if (currentPiece == "I") {
      type = 1;
    }
    if (direction == "clockwise") {
      for (let i = 0; i < 4; i++) {
        if (currentX + consts.rotate[consts.piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0] < 0 || currentX + consts.rotate[consts.piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0] >= consts.GRID_ROW || currentY + consts.rotate[consts.piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1] < 0 || currentY + consts.rotate[consts.piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1] >= consts.GRID_COLUMN) {
          rotatability = false;
          break;
        }
        if (grid[currentY + consts.rotate[consts.piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1]][currentX + consts.rotate[consts.piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0]] != 0) {
          rotatability = false;
          break;
        }
      }
    }
    else if (direction == "counterclockwise") {
      for (let i = 0; i < 4; i++) {
        if (currentX + consts.rotate[consts.piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0] < 0 || currentX + consts.rotate[consts.piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0] >= consts.GRID_ROW || currentY + consts.rotate[consts.piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1] < 0 || currentY + consts.rotate[consts.piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1] >= consts.GRID_COLUMN) {
          rotatability = false;
          break;
        }
        if (grid[currentY + consts.rotate[consts.piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1]][currentX + consts.rotate[consts.piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0]] != 0) {
          rotatability = false;
          break;
        }
      }
    }
    if (rotatability == true) {
      if (direction == "clockwise") {
        currentX = currentX + clockwiseSRS[type][currentState][srs][0];
        currentY = currentY + clockwiseSRS[type][currentState][srs][1];
      }
      else if (direction == "counterclockwise") {
        currentX = currentX + -clockwiseSRS[type][newState][srs][0];
        currentY = currentY + -clockwiseSRS[type][newState][srs][1];
      }
      currentState = newState;
      return true;
    }
  }
  return false;
}

function clockwiseRotate() {
  let newState;
  if (currentState == 3) {
    newState = 0;
  }
  else {
    newState = currentState + 1;
  }
  canRotate("clockwise", newState);
  ghostPiece();
  drawGrid();
  lowestCheck();
  clearInterval(lockTime);
  lockTime = null;
  autolockCheck();
}

function counterclockwiseRotate() {
  let newState;
  if (currentState == 0) {
    newState = 3;
  }
  else {
    newState = currentState - 1;
  }
  canRotate("counterclockwise", newState);
  ghostPiece();
  drawGrid();
  lowestCheck();
  clearInterval(lockTime);
  lockTime = null;
  autolockCheck();
}

function hardDrop() {
  for (let y = currentY; y >= 0; y--) {
    if (canMove(currentX, y)) {
      currentY = y;
      if (y == 0) {
        lock();
        return;
      }
    }
    else {
      lock();
      return;
    }
  }
}

function ghostPiece() {
  for (let y = currentY; y >= 0; y--) {
    if (canMove(currentX, y)) {
      ghostX = currentX;
      ghostY = y;
    }
    else {
      return;
    }
  }
}

function softDrop() {
  if (SDFMult == "infinity") {
    for (let y = currentY; y >= 0; y--) {
      if (canMove(currentX, y)) {
        currentY = y;
        if (y == 0) {
          drawGrid();
        }
      }
      else {
        drawGrid();
        autolockCheck();
        return;
      }
    }
  }
  else {
    dropOne();
    drawGrid();
    SDFtimer = setInterval(() => {
      dropOne();
      drawGrid();
    }, dropSpeed/SDFMult);
  }
}

function dropOne() {
  if (canMove(currentX, currentY - 1)) {
    currentY--;
  }
  autolockCheck();
}

function lock() {
  clearInterval(lockTime);
  lockTime = null;
  clearInterval(dropTime);
  dropTime = null;
  let overGrid = true;
  for (let i = 0; i < 4; i++) {
    if (currentY + consts.rotate[consts.piece[currentPiece]][currentState][i][1] < consts.GRID_COLUMN/2) {
      overGrid = false;
      break;
    }
  }
  if (overGrid == true) {
    gameOver();
  }
  for (let i = 0; i < 4; i++) {
    grid[currentY + consts.rotate[consts.piece[currentPiece]][currentState][i][1]][currentX + consts.rotate[consts.piece[currentPiece]][currentState][i][0]] = currentColor;
  }
  getNextPiece = true;

  holdColor = consts.piece[holdPiece];

  clear();
  nextPiece();
  drawGrid();
}

function lockTimer() {
  lockTime = setInterval(() => {
    lock();
  }, lockSpeed)
}

function dropTimer() {
  dropTime = setInterval(() => {
    dropOne();
    drawGrid();
  }, dropSpeed)
}

function clear() {
  let linesToClear = [];
  let clearLines = false;
  for (let c = 0; c < 40; c++) {
    let clearLine = true;
    for (let r = 0; r < 10; r++) {
      if (grid[c][r] == 0 || grid[c][r] == undefined) {
        clearLine = false;
        break;
      }
    }
    if(clearLine == true) {
      linesToClear.push(c);
      clearLines = true;
    }
  }
  if (clearLines == true) {
    let linesCleared = 0;
    for (let i = 0; i < linesToClear.length; i++) {
      let line = linesToClear[i] - linesCleared;
      grid.splice(line, 1);
      linesCleared++;
    }
    for (let i = 0; i <= linesToClear.length; i++) {
      grid.push(Array(consts.GRID_ROW).fill(0));
    }
  }
}

function nextPiece() {
  if (getNextPiece) {
    currentPiece = pieceQueue[0];
    currentColor = consts.piece[pieceQueue[0]] + 1;
    pieceQueue.shift();
    if (pieceQueue.length == 5) {
      shuffleOrder();
    }
    canHold = true;
  }
  getNextPiece = false;
  currentX = 4;
  currentY = 21;
  currentState = 0;
  ghostPiece();
  if (!canMove(4, 21)) {
    gameOver();
  }
  lockCount = 0;
  lowestY = 21;
  dropOne();
}

function hold() {
  if (canHold) {
    clearInterval(lockTime);
    lockTime = null;
    clearInterval(dropTime);
    dropTime = null;
    holdColor = 10;
    if (holdPiece) {
      [holdPiece, currentPiece] = [currentPiece, holdPiece];
      currentColor = consts.piece[currentPiece] + 1;
    }
    else {
      holdPiece = currentPiece;
      getNextPiece = true;
    }
    nextPiece();
    canHold = false;
    drawGrid();
  }
}

document.addEventListener('keydown', event => {
  if (inGame == false) {
    return;
  }
  if (event.repeat) return;
  switch (event.code) {
    case "ArrowLeft":
      currentDirection = "left";
      DAS();
      break;
    case "ArrowRight":
      currentDirection = "right";
      DAS();
      break;
    case "KeyZ":
      counterclockwiseRotate();
      break;
    case "KeyX":
      clockwiseRotate();
      break;
    case "ArrowUp":
      clockwiseRotate();
      break;
    case "Space":
      hardDrop();
      break;
    case "ArrowDown":
      softDrop();
      break;
    case "ShiftLeft":
      hold();
      break;
    case "KeyC":
      hold();
      break;
  }
})

document.addEventListener("keyup", event => {
  if (inGame == false) {
    return;
  }
  switch (event.code) {
    case "ArrowLeft":
      if (currentDirection == "left") {
        clearInterval(DAStimer);
        currentDirection = undefined;
      }
      break;
    case "ArrowRight":
      if (currentDirection == "right") {
        clearInterval(DAStimer);
        currentDirection = undefined;
      }
      break;
    case "ArrowDown":
      clearInterval(SDFtimer);
      break;
  }
})