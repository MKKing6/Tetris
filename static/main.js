var length;

var leftGrid;
var topGrid;

function drawLine(ctx, begin, end, stroke = 'black', width = 1) {
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
        length = w * .7;
    }
    else {
        length = h * .7;
    }
    topGrid = h/2-length/2;
    leftGrid = w/2-(length/2)/2;

    const canvas = document.getElementById("grid");
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    ctx.lineWidth = 1;
    drawLine(ctx, [leftGrid, topGrid], [leftGrid, topGrid + length]);
    drawLine(ctx, [leftGrid, topGrid + length], [leftGrid + length/2, topGrid + length]);
    drawLine(ctx, [leftGrid + length/2, topGrid + length], [leftGrid + length/2, topGrid]);
    
}

onresize = (event) => drawGrid();