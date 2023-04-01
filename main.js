import {Solver} from "./solver.js";

let context = null;
let canvas = null;

window.addEventListener("DOMContentLoaded", () => {
    // Get the canvas element
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Could not find canvas element with id "canvas"');
    }
    // Get the 2D drawing context
    context = canvas.getContext('2d');
    if (!context) {
        console.error('Could not get 2D context for canvas element');
    } else {
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        solver = new Solver(context, [0, 0]);
        document.getElementById('Mode2').click();

        requestAnimationFrame(FrameUpdate)
    }
});

function defaults() {
    solver.reset();
    solver.gravity = [0, 0];
    solver.drag = 0;
    solver.store = false;
    solver.vector = false;
    solver.elasticity = 1;
    document.getElementById('drag').value = 0;
    document.getElementById('dragP').innerHTML = "Drag: 0%";
}

let playground = false;
document.getElementById('dropdown').onchange = function (e) {
    solver.reset();
    defaults();
    switch (e.target.value) {
        case '1':
            solver.store = false;
            solver.vector = false;
            playground = true;
            document.getElementById('playground').style.display = 'block';
            document.getElementById('educational').style.display = 'none';
            break;
        case '0':
            playground = false;
            document.getElementById('playground').style.display = 'none';
            document.getElementById('educational').style.display = 'block';
            break;
    }
}

document.getElementById('Mode1').onclick = function () {
    solver.reset();
    const radius = 50;
    solver.store = false;
    solver.vector = true;
    solver.gravity = [0, 0];
    solver.elasticity = 1;
    for (let i = radius; i < canvas.width - radius; i += radius*2 + 5) {
        solver.addBall([i, canvas.height / 2 - radius*2], [0,0], radius, 'orange');
        solver.addBall([i, canvas.height - radius*2], [0,-100 - i /2], radius, 'blue');
    }
}

document.getElementById('Mode2').onclick = function () {
    solver.reset();
    solver.store = true;
    solver.vector = true;
    solver.gravity = [0, 0];
    solver.elasticity = 1;
    solver.addBall([0, canvas.height / 2], [200,0], 150, 'orange');
    solver.addBall([canvas.width, canvas.height / 2], [0,0], 75, 'blue');
    solver.addBall([0, 0], [300,300], 20, 'pink');
}

document.getElementById('Mode3').onclick = function () {
    solver.reset();
    solver.vector = true;
    solver.store = false;
    solver.gravity = [0, 100];
    solver.elasticity = 1;
    solver.addBall([canvas.width / 2, canvas.height / 2], [0,50], 150, 'orange');
    solver.addBall([canvas.width / 2, canvas.height / 2 - 166], [0,50], 15, 'blue');
}

document.getElementById('Mode4').onclick = function () {
    solver.reset();
    solver.vector = true;
    solver.store = false;
    solver.gravity = [0, 0];
    solver.elasticity = 1;
    solver.addBall([0, canvas.height / 2], [1000,0], 25, 'orange');
    solver.addBall([canvas.width / 2, canvas.height / 2], [0,0], 250, 'blue');
}

document.getElementById('Mode5').onclick = function () {
    solver.reset();
    solver.vector = false;
    solver.store = false;
    solver.gravity = [0, 0];
    solver.elasticity = 0;
    solver.addBall([canvas.width / 2, canvas.height / 2], [0,0], 25, 'blue');
    solver.addBall([30, canvas.height / 2], [100,0], 25, 'orange');
}

// Drag changed
document.getElementById("drag").oninput = function () {
    solver.drag = parseFloat(this.value);
    document.getElementById('dragP').innerHTML = "Drag: " + Math.round((parseFloat(this.value) * 100 + Number.EPSILON) * 100) / 100 + "%";
};

// Elasticity changed
document.getElementById("elasticity").oninput = function () {
    solver.elasticity = parseFloat(this.value);
    document.getElementById('elasticityP').innerHTML = "Elasticity: " + Math.trunc(parseFloat(this.value) * 100) + "%";
}

// Radius changed
document.getElementById("radius").oninput = function () {
    ballInfo.radius = parseInt(this.value);
    document.getElementById('radiusP').innerHTML = "Radius: " + parseInt(this.value);
}

// velocityX changed
document.getElementById("velx").oninput = function () {
    ballInfo.vx = parseInt(this.value) * 10;
    document.getElementById('velocityP').innerHTML = "Velocity = [" + parseInt(this.value) * 10 + ", " + ballInfo.vy + "]";
}

// velocityY changed
document.getElementById("vely").oninput = function () {
    ballInfo.vy = parseInt(this.value) * 10;
    document.getElementById('velocityP').innerHTML = "Velocity = [" + ballInfo.vx + ", " + parseInt(this.value) * 10 + "]";
}

// Ball information
let ballInfo = {
    vx: 0,
    vy: 0,
    radius: 25,
    spawnRate: 100
};

// Canvas clicked
document.getElementById("canvas").onmousedown = function (e) {
    if (e.button !== 0 || !playground) return;
    spawn(e);
}

// Canvas mouse move
document.getElementById("canvas").onmousemove = function (e) {
    if (e.buttons !== 1 || !playground) return;
    spawn(e);
}

let spawnT = performance.now();
function spawn(e) {
    if (performance.now() - spawnT < ballInfo.spawnRate) return;
    spawnT = performance.now();
    const x = e.clientX;
    const y = e.clientY;
    const color = 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';
    solver.addBall([x, y], [ballInfo.vx, ballInfo.vy], ballInfo.radius, color);
    document.getElementById('balls').innerHTML = "Balls: " + solver.ballLength();
}

// Clear balls button clicked
document.getElementById("clearBalls").onclick = function () {
    solver.reset();
    document.getElementById('balls').innerHTML = "Balls: " + solver.ballLength();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Gravity x
document.getElementById("gravX").oninput = function () {
    let g = solver.gravity;
    g[0] = parseInt(this.value) * 10;
    solver.gravity = g;
    document.getElementById('gravityP').innerHTML = "Gravity: [" + parseInt(this.value) * 10 + ", " + g[1] + "]";
}

// Gravity y
document.getElementById("gravY").oninput = function () {
    let g = solver.gravity;
    g[1] = parseInt(this.value) * 10;
    solver.gravity = g;
    document.getElementById('gravityP').innerHTML = "Gravity: [" + g[0] + ", " + parseInt(this.value) * 10 + "]";
}

// reset gravity
document.getElementById("resetGrav").onclick = function () {
    solver.gravity = [0, 0];
    document.getElementById('gravX').value = 0;
    document.getElementById('gravY').value = 0;
    document.getElementById('gravityP').innerHTML = "Gravity: [" + 0 + ", " + 0 + "]";
}

// reset velocity
document.getElementById("resetVel").onclick = function () {
    ballInfo.vx = 0;
    ballInfo.vy = 0;
    document.getElementById('velx').value = 0;
    document.getElementById('vely').value = 0;
    document.getElementById('velocityP').innerHTML = "Velocity = [" + 0 + ", " + 0 + "]";
}

// Spawn interval
document.getElementById("spawnRate").oninput = function () {
    ballInfo.spawnRate = parseInt(this.value);
    document.getElementById('spawnRateP').innerHTML = "Spawn Interval: " + parseInt(this.value) + "ms";
}


let solver;
const steps = 8;
const fps = 1000 / 65;
let t1 = 0;

function FrameUpdate() {
    requestAnimationFrame(FrameUpdate)
    let dt = performance.now() - t1;
    if (dt >= fps) {
        dt /= (1000 * steps);

        for (let i = 0; i < steps; i++)
            solver.update(dt);
        solver.render();

        t1 = performance.now();
    }
}
