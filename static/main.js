let tiles = new Image();
tiles.src = "texture.png";
let imagePx = 30;

const GRID_ROW = 10;
const GRID_COLUMN = 40;

let inGame = false;

let DAStime = 120;
let ARRtime = 0;
let SDFMult = "infinity";

const piece = {
  "Z": 0,
  "L": 1,
  "O": 2,
  "S": 3,
  "I": 4,
  "J": 5,
  "T": 6,
};

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

let ghostX;
let ghostY;

let DAStimer;
let SDFtimer;

function init() {
  grid = Array(GRID_ROW);
  for (let i = 0; i < GRID_COLUMN; i++) {
    grid[i] = Array(GRID_ROW).fill(0);
  }
  shuffleOrder();
  nextPiece();
}

function toggleScreen(id, toggle) {
  let element = document.getElementById(id);
  let display = (toggle) ? 'block' : 'none';
  element.style.display = display;
}

function startGame() {
  canvas = document.getElementById("grid");
  ctx = canvas.getContext("2d");
  inGame = true;
  init();
  tiles.onload = function () {
    drawGrid();    
  };
}

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

function drawGrid() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (w < h) {
    boxLength = (w * .7)/20;
  }
  else {
    boxLength = (h * .7)/20;
  }
  topGrid = h/2-((boxLength+1)*10);
  leftGrid = w/2-((boxLength+1)*5);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);
  for (let r = 0; r <= 10; r++) {
    drawLine(ctx, [leftGrid+r*boxLength, topGrid], [leftGrid+r*boxLength, topGrid+20*boxLength], "white", 0.5);
  }
  for (let c = 0; c <= 20; c++) {
    drawLine(ctx, [leftGrid, topGrid+c*boxLength], [leftGrid+10*boxLength, topGrid+c*boxLength], "white", 0.5);
  }
  
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 40; c++) {
      if (grid[c][r] != undefined || grid[c][c] != 0) {
        ctx.globalAlpha = 1;
        ctx.drawImage(tiles, (imagePx + 1)*(grid[c][r]-1), 0, imagePx, imagePx, leftGrid+r*boxLength, topGrid-(c-19)*boxLength, boxLength, boxLength);
      }
    }
  }
  
  ctx.globalAlpha = 1;
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(currentX+rotate[piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-currentY-rotate[piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }

  ghostPiece();
  ctx.globalAlpha = .5;
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(ghostX+rotate[piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-ghostY-rotate[piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }
  
  drawLine(ctx, [leftGrid - 2.5, topGrid], [leftGrid - 2.5, topGrid + (boxLength)*20 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid - 5, topGrid + (boxLength)*20 + 2.5], [leftGrid + (boxLength)*10 + 5, topGrid + (boxLength)*20 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid + (boxLength)*10 + 2.5, topGrid + (boxLength)*20 + 2.5], [leftGrid + (boxLength)*10 + 2.5, topGrid], "white", 1, 5);
}

onresize = () => {
  if (inGame) {
    drawGrid();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("grid");
  ctx = canvas.getContext("2d");
})

function shuffleOrder() {
  let pieces = ['Z', 'L', 'O', 'S', 'I', 'J', 'T'];
  for (let i = pieces.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  pieceQueue = pieceQueue.concat(pieces);
}

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
  }
  drawGrid();
}

function moveRight() {
  if (canMove(currentX + 1, currentY)) {
    currentX++;
  }
  drawGrid();
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
        return;
      }
    }
  }
  else {
    clearInterval(SDFtimer);
    SDFtimer = setInterval(() => {
      if (!canMove(currentX, currentY - 1)) {
        if (SDFtimer == null) {
          removeInterval(SDFtimer);
        }
      }
      else {
        currentY--;
      }
      drawGrid();
    }, 500/SDFMult);
  }
}

function lock() {
  for (let i = 0; i < 4; i++) {
    grid[currentY + rotate[piece[currentPiece]][currentState][i][1]][currentX + rotate[piece[currentPiece]][currentState][i][0]] = currentColor;
  }
  if (pieceQueue.length == 5) {
    shuffleOrder();
  }
  nextPiece();
  clear();
  drawGrid();
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
  currentX = 4;
  currentY = 21;
  currentState = 0;
  currentPiece = pieceQueue[0];
  currentColor = piece[pieceQueue[0]] + 1;
  pieceQueue.shift();
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