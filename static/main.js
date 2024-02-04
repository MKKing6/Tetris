import { init, grid, currentX, currentY, currentColor, currentState, currentPiece, holdPiece, holdColor, ghostX, ghostY } from "/tetris.js";
import * as consts from '/consts.js'

let tiles;
let imagePx = 30;
let ctx;
let canvas;

export let inGame = false;

let boxLength;
let leftGrid;
let topGrid;

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
export function gameOver() {
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
export function drawGrid() {
  //find box length and where the top corner of grid is
  let w = window.innerWidth;
  let h = window.innerHeight;
  if (w < h) {
    boxLength = (w * .7)/(consts.GRID_COLUMN/2);
  }
  else {
    boxLength = (h * .7)/(consts.GRID_COLUMN/2);
  }
  topGrid = h/2-((boxLength+1)*10);
  leftGrid = w/2-((boxLength+1)*5);

  //draws the grid lines
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);
  for (let r = 0; r <= 10; r++) {
    drawLine(ctx, [leftGrid+r*boxLength, topGrid], [leftGrid+r*boxLength, topGrid+(consts.GRID_COLUMN/2)*boxLength], "white", 0.5);
  }
  for (let c = 0; c <= 20; c++) {
    drawLine(ctx, [leftGrid, topGrid+c*boxLength], [leftGrid+consts.GRID_ROW*boxLength, topGrid+c*boxLength], "white", 0.5);
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
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(currentX+consts.rotate[consts.piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-currentY-consts.rotate[consts.piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }

  //draws ghost piece
  ctx.globalAlpha = .5;
  for (let i = 0; i < 4; i++) {
    ctx.drawImage(tiles, (imagePx + 1)*(currentColor-1), 0, imagePx, imagePx, leftGrid+(ghostX+consts.rotate[consts.piece[currentPiece]][currentState][i][0])*boxLength, topGrid+(19-ghostY-consts.rotate[consts.piece[currentPiece]][currentState][i][1])*boxLength, boxLength, boxLength);
  }

  //draws border
  drawLine(ctx, [leftGrid - 2.5, topGrid], [leftGrid - 2.5, topGrid + boxLength * consts.GRID_COLUMN/2 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid - 5, topGrid + boxLength * consts.GRID_COLUMN/2 + 2.5], [leftGrid + boxLength * consts.GRID_ROW + 5, topGrid + boxLength * consts.GRID_COLUMN/2 + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid + boxLength * consts.GRID_ROW + 2.5, topGrid + boxLength * consts.GRID_COLUMN/2 + 2.5], [leftGrid + boxLength * consts.GRID_ROW + 2.5, topGrid], "white", 1, 5);

  //draws hold box
  ctx.fillStyle = "white";
  ctx.fillRect(leftGrid - boxLength * (consts.GRID_ROW/2) - 5, topGrid, boxLength * (consts.GRID_ROW/2), boxLength * 1.5);
  ctx.font = "800 " + boxLength + "px Helvetica";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgb(31, 31, 31)";
  ctx.fillText("HOLD", leftGrid - boxLength * (consts.GRID_ROW/4), topGrid + boxLength * (1.5/2) + boxLength / 2);
  drawLine(ctx, [leftGrid - boxLength * (consts.GRID_ROW/2) - 2.5, topGrid + boxLength * 1.5 - 2.5], [leftGrid - boxLength * (consts.GRID_ROW/2) - 2.5, topGrid + boxLength * (consts.GRID_ROW/2) + 2.5], "white", 1, 5);
  drawLine(ctx, [leftGrid - boxLength * (consts.GRID_ROW/2) - 2.5, topGrid + boxLength * (consts.GRID_ROW/2)], [leftGrid, topGrid + boxLength * (consts.GRID_ROW/2)], "white", 1, 5);

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
      ctx.drawImage(tiles, (imagePx + 1) * holdColor, 0, imagePx, imagePx, (leftGrid - boxLength * shiftX) + (consts.rotate[consts.piece[holdPiece]][0][i][0]*boxLength), (topGrid + boxLength * shiftY) - (consts.rotate[consts.piece[holdPiece]][0][i][1]*boxLength), boxLength, boxLength);
    }
  }
}

//on window resize draw grid
onresize = () => {
  if (inGame) {
    drawGrid();
  }
}

document.getElementById("start").addEventListener("click", startGame);