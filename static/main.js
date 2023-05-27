const tiles = new Image();
tiles.src = "texture.png";
var canvas;
var ctx;
const imagePx = 30;

const GRID_ROW = 10;
const GRID_COLUMN = 20;
var boxLength;
var leftGrid;
var topGrid;
var grid = [];
var currentX;
var currentY;
var currentColor;
var currentDirection;

var DAStimer;

function init() {
  let arr = [];
  for (var r = 0; r < 10; r++) {
    for (var c = 0; c < 40; c++) {
      arr.push(0);
    }
  }
  while(arr.length) grid.push(arr.splice(0,20));
  currentX = 4;
  currentY = 20;
  currentColor = 5; 
  console.log(grid);
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
  ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+currentX*boxLength, topGrid+(19-currentY)*boxLength, boxLength, boxLength);
  
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
  if (currentX != 0 && grid[currentX-1][currentY] == undefined) {
    currentX--;
    drawGrid();
  }
}

function moveRight() {
  if (currentX != GRID_ROW - 1 && grid[currentX+1][currentY] == undefined) {
    currentX++;
    drawGrid();
  }
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