var w = window.innerWidth;
    var h = window.innerHeight;
    if (w < h) {
        var length = w * .7;
    }
    else {
        var length = h * .7;
    }

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

    const canvas = document.getElementById("grid");
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
    ctx.lineWidth = 1;
    drawLine(ctx, [w/2-(length/2)/2, h/2-length/2], [w/2-(length/2)/2, h/2+length/2])
    /*for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 20; j++) {
            ctx.strokeRect(i*(length/20), j*(length/20), length/20 - 1, length/20 - 1);
        }
    }*/
}

onresize = (event) => drawGrid();