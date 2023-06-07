const tiles = new Image();
tiles.src = "texture.png";
var canvas;
var ctx;
const imagePx = 30;

const GRID_ROW = 10;
const GRID_COLUMN = 40;

const piece = {
  "S": 0,
  "L": 1,
  "O": 2,
  "Z": 3,
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
    [[1, 1], [0, 1], [0, 0], [-1, 0]],
    [[1, -1], [1, 0], [0, 0], [0, 1]],
    [[-1, -1], [0, -1], [0, 0], [1, 0]],
    [[-1, 1], [-1, 0], [0, 0], [0, -1]]
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

var boxLength;
var leftGrid;
var topGrid;
var grid = [];

var pieceQueue = [];
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
  shuffleOrder();
  console.log(pieceQueue);
  nextPiece();
}

function shuffleOrder() {
  var pieces = ['S', 'L', 'O', 'Z', 'I', 'J', 'T'];
  for (var i = pieces.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  pieceQueue = pieceQueue.concat(pieces);
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
  drawGrid();
}

function moveRight() {
  canMove(currentX + 1, currentY);
  drawGrid();
}

function canMove(newX, newY) {
  for (var i = 0; i < 4; i++) {
    if (newX + rotate[piece[currentPiece]][currentState][i][0] < 0 || newX + rotate[piece[currentPiece]][currentState][i][0] >= GRID_ROW || newY + rotate[piece[currentPiece]][currentState][i][1] < 0 || newY + rotate[piece[currentPiece]][currentState][i][1] >= GRID_COLUMN) {
      return false;
    }
    if (grid[newX + rotate[piece[currentPiece]][currentState][i][0]][newY + rotate[piece[currentPiece]][currentState][i][1]] != undefined && grid[newX + rotate[piece[currentPiece]][currentState][i][0]][newY + rotate[piece[currentPiece]][currentState][i][1]] != 0) {
      console.log(grid[newX + rotate[piece[currentPiece]][currentState][i][0]][newY + rotate[piece[currentPiece]][currentState][i][1]])
      return false;
    }
  }
  currentX = newX;
  currentY = newY;
  return true;
}

function canRotate(direction, newState) {
  if (currentPiece == "O") {
    return true;
  }
  for (var srs = 0; srs < 5; srs++) {
    var rotatability = true;
    var type = 0;
    if (currentPiece == "I") {
      type = 1;
    }
    if (direction == "clockwise") {
      for (var i = 0; i < 4; i++) {
        if (currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0] < 0 || currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0] >= GRID_ROW || currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1] < 0 || currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1] >= GRID_COLUMN) {
          rotatability = false;
          break;
        }
        if (grid[currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0]][currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1]] != undefined && grid[currentX + rotate[piece[currentPiece]][newState][i][0] + clockwiseSRS[type][currentState][srs][0]][currentY + rotate[piece[currentPiece]][newState][i][1] + clockwiseSRS[type][currentState][srs][1]] != 0) {
          rotatability = false;
          break;
        }
      }
    }
    else if (direction == "counterclockwise") {
      for (var i = 0; i < 4; i++) {
        if (currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0] < 0 || currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0] >= GRID_ROW || currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1] < 0 || currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1] >= GRID_COLUMN) {
          rotatability = false;
          break;
        }
        if (grid[currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0]][currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1]] != undefined && grid[currentX + rotate[piece[currentPiece]][newState][i][0] + -clockwiseSRS[type][newState][srs][0]][currentY + rotate[piece[currentPiece]][newState][i][1] + -clockwiseSRS[type][newState][srs][1]] != 0) {
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
  for (var y = currentY - 1; y >= 0; y--) {
    if (!canMove(currentX, y) || y == 0) {
      lock();
      return;
    }
  }
}

function lock() {
  for (var i = 0; i < 4; i++) {
    grid[currentX + rotate[piece[currentPiece]][currentState][i][0]][currentY + rotate[piece[currentPiece]][currentState][i][1]] = currentColor;
  }
  if (pieceQueue.length == 5) {
    shuffleOrder();
  }
  nextPiece();
  drawGrid();
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
  if (event.repeat) return;
  console.log(event.code);
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
    case "Space":
      hardDrop();
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