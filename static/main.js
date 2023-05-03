var boxLength;

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
        boxLength = (w * .7)/20;
    }
    else {
        boxLength = (h * .7)/20;
    }
    topGrid = h/2-(boxLength*10);
    leftGrid = w/2-(boxLength*5);

    const canvas = document.getElementById("grid");
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    ctx.lineWidth = 1;
    for (var r = 1; r <= 10; r++) {
        drawLine(ctx, [leftGrid+boxLength*r, topGrid], [leftGrid+boxLength*r, topGrid+boxLength*20]);
    }
}

onresize = (event) => drawGrid();