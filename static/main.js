const tiles = new Image();
tiles.src = "texture.png";
var canvas;
var ctx;
const imagePx = 30;

const GRID_ROW = 10;
const GRID_COLUMN = 40;

const piece = {
  "T": 0,
  "J": 1,
  "L": 2,
  "S": 3,
  "Z": 4,
  "I": 5,
  "O": 6
};

const rotate = [
  [
    [[0, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, 0], [0, 1], [0, 0], [0, -1]],
    [[0, -1], [1, 0], [0, 0], [-1, 0]],
    [[-1, 0], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[-1, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, 1], [0, -1], [0, 0], [0, -1]],
    [[1, -1], [1, 0], [0, 0], [-1, 0]],
    [[-1, -1], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[1, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, -1], [0, -1], [0, 0], [0, -1]],
    [[-1, -1], [1, 0], [0, 0], [-1, 0]],
    [[-1, 1], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[1, 1], [0, 1], [0, 0], [-1, 0]],
    [[1, -1], [1, 0], [0, 0], [0, 1]],
    [[-1, -1], [0, -1], [0, 0], [1, 0]],
    [[-1, 1], [-1, 0], [0, 0], [0, -1]]
  ],
  [
    [[-1, 1], [0, 1], [0, 0], [1, 0]],
    [[1, 1], [1, 0], [0, 0], [0, -1]],
    [[1, -1], [0, -1], [0, 0], [-1, 0]],
    [[-1, -1], [-1, 0], [0, 0], [0, 1]]
  ],
  [
    [[-1, 0], [0, 0], [1, 0], [2, 0]],
    [[1, 1], [1, 0], [1, -1], [1, -2]],
    [[2, -1], [1, -1], [0, -1], [-1, -1]],
    [[0, -2], [0, -1], [0, 0], [0, 1]]
  ],
  [
    [[0, 1], [1, 1], [0, 0], [1, 0]]
  ]
]

var boxLength;
var leftGrid;
var topGrid;
var grid = [];
var currentX;
var currentY;
var currentColor;
var currentState;
var currentPiece;

var currentDirection;

var DAStimer;

function init() {
  grid = Array(GRID_COLUMN);
  for (var i = 0; i < GRID_COLUMN; i++) {
    grid[i] = Array(GRID_ROW).fill(0);
  }
  currentX = 4;
  currentY = 21;
  currentColor = 3; 
  currentPiece = "O";
  currentState = 0;
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
  var w = window.innerWidth;
  var h = window.innerHeight;
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
  for (var r = 0; r <= 10; r++) {
    drawLine(ctx, [leftGrid+r*boxLength, topGrid], [leftGrid+r*boxLength, topGrid+20*boxLength], "white", 0.5);
  }
  for (var c = 0; c <= 20; c++) {
    drawLine(ctx, [leftGrid, topGrid+c*boxLength], [leftGrid+10*boxLength, topGrid+c*boxLength], "white", 0.5);
  }
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 40; c++) {
      if (grid[r][c] != 0) {
        ctx.globalAlpha = 1;
        ctx.drawImage(tiles, (imagePx + 1)*(grid[r][c]-1), 0, imagePx, imagePx, leftGrid+r*boxLength, topGrid+(19-c)*boxLength, boxLength, boxLength);
      }
    }
  }

  ctx.globalAlpha = 1;
  for (var i = 0; i < 4; i++) {
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(currentX+rotate[piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-currentY-rotate[piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }
  
  drawLine(ctx, [leftGrid - 2.5, topGrid], [leftGrid - 2.5, topGrid + (boxLength)*20 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid - 5, topGrid + (boxLength)*20 + 2.5], [leftGrid + (boxLength)*10 + 5, topGrid + (boxLength)*20 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid + (boxLength)*10 + 2.5, topGrid + (boxLength)*20 + 2.5], [leftGrid + (boxLength)*10 + 2.5, topGrid], "white", 1, 5);
}

onresize = () => drawGrid();
document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("grid");
  ctx = canvas.getContext("2d");
})

function DAS() {
  clearInterval(DAStimer);
  if (currentDirection == "left") {
    moveLeft();
    DAStimer = setTimeout(() => {
      moveLeft();
      DAStimer = setInterval(() => {
        moveLeft();
      }, 0)
    }, 100)
  }
  if (currentDirection == "right") {
    moveRight();
    DAStimer = setTimeout(() => {
      moveRight();
      DAStimer = setInterval(() => {
        moveRight();
      }, 0)
    }, 100)
  }
}

function moveLeft() {
  canMove(currentX - 1, currentY);
}

function moveRight() {
  canMove(currentX + 1, currentY);
}

function canMove(newX, newY) {
  for (var i = 0; i < 4; i++) {
    if (newX + rotate[piece[currentPiece]][currentState][i][0] < 0 || newX + rotate[piece[currentPiece]][currentState][i][0] >= GRID_ROW || newY + rotate[piece[currentPiece]][currentState][i][1] < 0 || newY + rotate[piece[currentPiece]][currentState][i][1] >= GRID_COLUMN) {
      return false;
    }
    if (grid[newX + rotate[piece[currentPiece]][currentState][i][0]][newY + rotate[piece[currentPiece]][currentState][i][1]] != undefined) {
      return false;
    }
  }
  currentX = newX;
  currentY = newY;
  drawGrid();
  return true;
}

function canRotate(newState) {
  if (currentPiece == "O") {
    return true;
  }
  for (var i = 0; i < 4; i++) {
    if (currentX + rotate[piece[currentPiece]][newState][i][0] < 0 || currentX + rotate[piece[currentPiece]][newState][i][0] >= GRID_ROW || currentY + rotate[piece[currentPiece]][newState][i][1] < 0 || currentY + rotate[piece[currentPiece]][newState][i][1] >= GRID_COLUMN) {
      return false;
    }
    if (grid[currentX + rotate[piece[currentPiece]][newState][i][0]][currentY + rotate[piece[currentPiece]][newState][i][1]] != undefined) {
      return false;
    }
  }
  currentState = newState;
  drawGrid();
  return true;
}

function clockwiseRotate() {
  let newState;
  if (currentState == 3) {
    newState = 0;
  }
  else {
    newState = currentState + 1;
  }
  canRotate(newState);
}

function counterclockwiseRotate() {
  let newState;
  if (currentState == 0) {
    newState = 3;
  }
  else {
    newState = currentState - 1;
  }
  canRotate(newState);
}
  
document.addEventListener('keydown', event => {
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
  }
})

document.addEventListener("keyup", event => {
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
  }
})