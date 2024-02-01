let tiles;
let imagePx = 30;

const GRID_ROW = 10;
const GRID_COLUMN = 40;

let inGame = false;

let DAStime = 150//100; 
let ARRtime = 10//0;
let SDFMult = 20//"infinity";
let dropSpeed = 2000;
let lockSpeed = 500;

const piece = {
  "Z": 0,
  "L": 1,
  "O": 2,
  "S": 3,
  "I": 4,
  "J": 5,
  "T": 6,
};

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

//rotation table
const rotate = [
  [
    [[-1, 1], [0, 1], [0, 0], [1, 0]],
    [[1, 1], [1, 0], [0, 0], [0, -1]],
    [[1, -1], [0, -1], [0, 0], [-1, 0]],
    [[-1, -1], [-1, 0], [0, 0], [0, 1]]
  ],
  [
    [[1, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, -1], [0, 1], [0, 0], [0, -1]],
    [[-1, -1], [1, 0], [0, 0], [-1, 0]],
    [[-1, 1], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[0, 1], [1, 1], [0, 0], [1, 0]]
  ],
  [
    [[1, 1], [0, 1], [0, 0], [-1, 0]],
    [[1, -1], [1, 0], [0, 0], [0, 1]],
    [[-1, -1], [0, -1], [0, 0], [1, 0]],
    [[-1, 1], [-1, 0], [0, 0], [0, -1]]
  ],
  [
    [[-1, 0], [0, 0], [1, 0], [2, 0]],
    [[1, 1], [1, 0], [1, -1], [1, -2]],
    [[2, -1], [1, -1], [0, -1], [-1, -1]],
    [[0, -2], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[-1, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, 1], [0, 1], [0, 0], [0, -1]],
    [[1, -1], [1, 0], [0, 0], [-1, 0]],
    [[-1, -1], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[0, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, 0], [0, 1], [0, 0], [0, -1]],
    [[0, -1], [1, 0], [0, 0], [-1, 0]],
    [[-1, 0], [0, -1], [0, 0], [0, 1]]
  ]
]

let boxLength;
let leftGrid;
let topGrid;
let grid = [];

let pieceQueue = [];
let currentX;
let currentY;
let currentColor;
let currentState;
let currentPiece;
let currentDirection;

let holdPiece;
let holdColor;
let canHold;
let getNextPiece;

let ghostX;
let ghostY;

let DAStimer;
let SDFtimer;
let lockTime;
let dropTime;

let lockCount;
let lowestY;

function init() {
  clearInterval(lockTime);
  lockTime = null;
  clearInterval(dropTime);
  dropTime = null;
  grid = Array(GRID_ROW);
  for (let i = 0; i < GRID_COLUMN; i++) {
    grid[i] = Array(GRID_ROW).fill(0);
  }
  holdPiece = null;
  holdColor = null;
  shuffleOrder();
  getNextPiece = true;
  nextPiece();
}

function toggleScreen(id, toggle) {
  let element = document.getElementById(id);
  let display = (toggle) ? 'block' : 'none';
  element.style.display = display;
}

//start game loop
function startGame() {
  toggleScreen('startScreen', false);
  toggleScreen('grid', true);
  tiles = new Image();
  tiles.src = "texture.png";
  canvas = document.getElementById("grid");
  ctx = canvas.getContext("2d");
  inGame = true;
  init();
  tiles.onload = function () {
    drawGrid();    
  };
}

//end game loop
function gameOver() {
  inGame = false;
  toggleScreen('startScreen', true);
  toggleScreen('grid', false);
}

//draw a line in canvas
function drawLine(ctx, begin, end, stroke = "black", opacity = 1, width = 1) {
  if (opacity) {
    ctx.globalAlpha = opacity;
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
  }

  if (width) {
    ctx.lineWidth = width;
  }

  ctx.beginPath();
  ctx.moveTo(...begin);
  ctx.lineTo(...end);
  ctx.stroke();
}

//draws grid
function drawGrid() {
  //find box length and where the top corner of grid is
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (w < h) {
    boxLength = (w * .7)/(GRID_COLUMN/2);
  }
  else {
    boxLength = (h * .7)/(GRID_COLUMN/2);
  }
  topGrid = h/2-((boxLength+1)*10);
  leftGrid = w/2-((boxLength+1)*5);

  //draws the grid lines
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);
  for (let r = 0; r <= 10; r++) {
    drawLine(ctx, [leftGrid+r*boxLength, topGrid], [leftGrid+r*boxLength, topGrid+(GRID_COLUMN/2)*boxLength], "white", 0.5);
  }
  for (let c = 0; c <= 20; c++) {
    drawLine(ctx, [leftGrid, topGrid+c*boxLength], [leftGrid+GRID_ROW*boxLength, topGrid+c*boxLength], "white", 0.5);
  }

  //draws the tiles that were placed
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 40; c++) {
      if (grid[c][r] != undefined || grid[c][c] != 0) {
        ctx.globalAlpha = 1;
        ctx.drawImage(tiles, (imagePx + 1)*(grid[c][r]-1), 0, imagePx, imagePx, leftGrid+r*boxLength, topGrid-(c-19)*boxLength, boxLength, boxLength);
      }
    }
  }

  //draws current piece
  ctx.globalAlpha = 1;
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(currentX+rotate[piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-currentY-rotate[piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }

  //draws ghost piece
  ghostPiece();
  ctx.globalAlpha = .5;
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(ghostX+rotate[piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-ghostY-rotate[piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }

  //draws border
  drawLine(ctx, [leftGrid - 2.5, topGrid], [leftGrid - 2.5, topGrid + boxLength * GRID_COLUMN/2 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid - 5, topGrid + boxLength * GRID_COLUMN/2 + 2.5], [leftGrid + boxLength * GRID_ROW + 5, topGrid + boxLength * GRID_COLUMN/2 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid + boxLength * GRID_ROW + 2.5, topGrid + boxLength * GRID_COLUMN/2 + 2.5], [leftGrid + boxLength * GRID_ROW + 2.5, topGrid], "white", 1, 5);

  //draws hold box
  ctx.fillStyle = "white";
  ctx.fillRect(leftGrid - boxLength * (GRID_ROW/2) - 5, topGrid, boxLength * (GRID_ROW/2), boxLength * 1.5);
  ctx.font = "800 " + boxLength + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgb(31, 31, 31)";
  ctx.fillText("HOLD", leftGrid - boxLength * (GRID_ROW/4), topGrid + boxLength * (1.5/2) + boxLength / 2);
  drawLine(ctx, [leftGrid - boxLength * (GRID_ROW/2) - 2.5, topGrid + boxLength * 1.5 - 2.5], [leftGrid - boxLength * (GRID_ROW/2) - 2.5, topGrid + boxLength * (GRID_ROW/2) + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid - boxLength * (GRID_ROW/2) - 2.5, topGrid + boxLength * (GRID_ROW/2)], [leftGrid, topGrid + boxLength * (GRID_ROW/2)], "white", 1, 5);

  if (holdPiece) {
    ctx.globalAlpha = 1;
    let shiftX = 3.125;
    let shiftY = 3.25;
    if (holdPiece == "O" || holdPiece == "I") {
      shiftX = shiftX + .5;
    }
    if (holdPiece == "I") {
      shiftY = shiftY - .5;
    }
    for (let i = 0; i < 4; i++) {
      ctx.drawImage(tiles, (imagePx + 1) * holdColor, 0, imagePx, imagePx, (leftGrid - boxLength * shiftX) + (rotate[piece[holdPiece]][0][i][0]*boxLength), (topGrid + boxLength * shiftY) - (rotate[piece[holdPiece]][0][i][1]*boxLength), boxLength, boxLength);
    }
  }
}

//on window resize draw grid
onresize = () => {
  if (inGame) {
    drawGrid();
  }
}

//shuffle order of pieces then add to array
function shuffleOrder() {
  let pieces = ['Z', 'L', 'O', 'S', 'I', 'J', 'T'];
  for (let i = pieces.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  pieceQueue = pieceQueue.concat(pieces);
  console.log(pieceQueue);
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
    if (newX + rotate[piece[currentPiece]][currentState][i][0] < 0 || newX + rotate[piece[currentPiece]][currentState][i][0] >= GRID_ROW || newY + rotate[piece[currentPiece]][currentState][i][1] < 0 || newY + rotate[piece[currentPiece]][currentState][i][1] >= GRID_COLUMN) {
      return false;
    }
    if (grid[newY + rotate[piece[currentPiece]][currentState][i][1]][newX + rotate[piece[currentPiece]][currentState][i][0]] != 0) {
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
        if (currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0] < 0 || currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0] >= GRID_ROW || currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1] < 0 || currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1] >= GRID_COLUMN) {
          rotatability = false;
          break;
        }
        if (grid[currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1]][currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0]] != 0) {
          rotatability = false;
          break;
        }
      }
    }
    else if (direction == "counterclockwise") {
      for (let i = 0; i < 4; i++) {
        if (currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0] < 0 || currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0] >= GRID_ROW || currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1] < 0 || currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1] >= GRID_COLUMN) {
          rotatability = false;
          break;
        }
        if (grid[currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1]][currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0]] != 0) {
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
    if (currentY + rotate[piece[currentPiece]][currentState][i][1] < GRID_COLUMN/2) {
      overGrid = false;
      break;
    }
  }
  if (overGrid == true) {
    gameOver();
  }
  for (let i = 0; i < 4; i++) {
    grid[currentY + rotate[piece[currentPiece]][currentState][i][1]][currentX + rotate[piece[currentPiece]][currentState][i][0]] = currentColor;
  }
  getNextPiece = true;

  holdColor = piece[holdPiece];

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
      grid.push(Array(GRID_ROW).fill(0));
    }
  }
}

function nextPiece() {
  if (getNextPiece) {
    currentPiece = pieceQueue[0];
    currentColor = piece[pieceQueue[0]] + 1;
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
      currentColor = piece[currentPiece] + 1;
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