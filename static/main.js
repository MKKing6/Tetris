const height = document.querySelector("#height span");
const width = document.querySelector("#width span");

function drawGrid() {
    const canvas = document.getElementById("grid");
    const ctx = canvas.getContext("2d");
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w < h) {
        var length = w * .7;
    }
    else {
        var length = h * .7;
    }
    
    canvas.setAttribute('width', length/2);
    canvas.setAttribute('height', length);
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, length/2 - 2, length - 2);
    /*for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 20; j++) {
            ctx.strokeRect(i*(length/20), j*(length/20), length/20 - 1, length/20 - 1);
        }
    }*/
}

onresize = (event) => drawGrid();